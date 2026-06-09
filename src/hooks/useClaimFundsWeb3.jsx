import { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useWeb3 } from '../contexts/Web3Provider';
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  USDT_ABI,
  POLYGON_AMOY_CHAIN_ID,
} from '../constants/web3';

export const useClaimFundsWeb3 = () => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const { signer, connectWallet } = useWeb3();

  const handleClaimFunds = async (onChainIds) => {
    try {
      setIsClaiming(true);
      setStatusMessage('Đang kết nối ví...');

      const normalizedOnChainIds = Array.isArray(onChainIds)
        ? onChainIds.filter((onChainId) => onChainId !== null && onChainId !== undefined)
        : [onChainIds].filter((onChainId) => onChainId !== null && onChainId !== undefined);

      if (normalizedOnChainIds.length === 0) {
        throw new Error('Sự kiện chưa có onChainId hợp lệ để tất toán.');
      }

      if (!window.ethereum) {
        throw new Error(
          'Hệ thống không tìm thấy ví Web3. Vui lòng cài đặt ví MetaMask trên trình duyệt của bạn để tiếp tục.'
        );
      }

      if (!signer) {
        await connectWallet();
      }

      let browserProvider = new ethers.BrowserProvider(window.ethereum);
      let currentSigner = await browserProvider.getSigner();

      const currentNetwork = await window.ethereum.request({
        method: 'eth_chainId',
      });
      
      if (currentNetwork !== POLYGON_AMOY_CHAIN_ID) {
        setStatusMessage('Đang chuyển mạng lưới...');
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: POLYGON_AMOY_CHAIN_ID }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: POLYGON_AMOY_CHAIN_ID,
                  chainName: 'Polygon Amoy Testnet',
                  nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18,
                  },
                  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                  blockExplorerUrls: ['https://amoy.polygonscan.com/'],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
        browserProvider = new ethers.BrowserProvider(window.ethereum);
        currentSigner = await browserProvider.getSigner();
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        currentSigner
      );

      const signerAddress = await currentSigner.getAddress();
      const adminTreasuryAddress = await contract.adminTreasury();

      console.log('[CLAIM FUNDS] signerAddress:', signerAddress);
      console.log('[CLAIM FUNDS] onChainIds:', normalizedOnChainIds);

      setStatusMessage('Đang kiểm tra quyền organizer trên Smart Contract...');
      for (const onChainId of normalizedOnChainIds) {
        const evt = await contract.events(onChainId);
        const organizerAddress = evt.organizer;

        console.log('[CLAIM FUNDS] on-chain organizer check:', {
          onChainId: onChainId?.toString?.() ?? onChainId,
          signerAddress,
          organizerAddress,
        });

        if (organizerAddress.toLowerCase() !== signerAddress.toLowerCase()) {
          throw new Error(
            `Ví đang kết nối (${signerAddress}) không phải organizer của onChainId ${onChainId}. Organizer on-chain là ${organizerAddress}.`
          );
        }
      }

      const txOptions = {
        maxPriorityFeePerGas: 30000000000n, // 30 Gwei
        maxFeePerGas: 30000000000n, // 30 Gwei
      };

      toast.info('Đang xử lý giao dịch tất toán trên Blockchain. Vui lòng không đóng trang...', {
        autoClose: false,
        toastId: 'claiming-toast',
      });

      setStatusMessage('Đang chờ xác nhận tất toán trên ví...');
      const tx = await contract.batchClaimFunds(normalizedOnChainIds, txOptions);
      setStatusMessage('Giao dịch tất toán đang được xử lý trên Blockchain...');
      const receipt = await tx.wait();

      // Parse Transfer logs from USDT token
      setStatusMessage('Đang đọc kết quả chuyển tiền USDT...');
      const usdtInterface = new ethers.Interface(USDT_ABI);
      let organizerAmount = 0n;
      let adminAmount = 0n;

      for (const log of receipt.logs) {
        try {
          const parsedLog = usdtInterface.parseLog(log);
          if (parsedLog && parsedLog.name === 'Transfer') {
            const to = parsedLog.args[1];
            const value = parsedLog.args[2];

            if (to.toLowerCase() === signerAddress.toLowerCase()) {
              organizerAmount += value;
            } else if (to.toLowerCase() === adminTreasuryAddress.toLowerCase()) {
              adminAmount += value;
            }
          }
        } catch (e) {
          // Ignore logs that are not from the USDT contract or cannot be parsed
        }
      }

      toast.dismiss('claiming-toast');
      toast.success('Giao dịch tất toán thành công trên Blockchain!');

      return {
        txHash: receipt.hash || tx.hash,
        organizerAmount: Number(ethers.formatUnits(organizerAmount, 6)),
        adminAmount: Number(ethers.formatUnits(adminAmount, 6)),
        organizerAddress: signerAddress,
        adminTreasuryAddress: adminTreasuryAddress,
      };
    } catch (error) {
      toast.dismiss('claiming-toast');
      console.error('Claim funds error:', error);
      let errorMessage = 'Giao dịch tất toán thất bại. Vui lòng thử lại sau.';
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        errorMessage = 'Bạn đã hủy giao dịch trên ví.';
      } else if (error.reason) {
        errorMessage = `Lỗi từ Smart Contract: ${error.reason}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsClaiming(false);
      setStatusMessage('');
    }
  };

  return {
    isClaiming,
    statusMessage,
    handleClaimFunds,
  };
};
