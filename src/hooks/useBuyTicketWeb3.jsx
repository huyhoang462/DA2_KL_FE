import { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useWeb3 } from '../contexts/Web3Provider';
import { orderService } from '../services/orderService';
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  POLYGON_AMOY_CHAIN_ID,
} from '../constants/web3';

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) public view returns (uint256)',
];

export const useBuyTicketWeb3 = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const { provider, signer, connectWallet } = useWeb3();

  const handleBuyWithWeb3 = async (
    eventId,
    totalQuantity,
    orderId,
    totalAmountUsdt = '1000'
  ) => {
    try {
      console.log('====== [WEB3 PAYMENT] BẮT ĐẦU QUÁ TRÌNH MUA VÉ ======');
      console.log(
        `- Event ID: ${eventId}, Quantity: ${totalQuantity}, Order ID: ${orderId}`
      );

      setIsProcessing(true);
      setStatusMessage('Đang kết nối ví...');

      if (!window.ethereum) {
        throw new Error(
          'Hệ thống không tìm thấy ví Web3. Vui lòng cài đặt MetaMask.'
        );
      }

      let currentSigner = signer;
      if (!currentSigner) {
        await connectWallet();
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        currentSigner = await browserProvider.getSigner();
      }

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
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        currentSigner = await newProvider.getSigner();
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        currentSigner
      );

      console.log(
        `[WEB3 PAYMENT] Mạng lưới hợp lệ. Ví kết nối: ${await currentSigner.getAddress()}`
      );
      console.log(`[WEB3 PAYMENT] Smart Contract Address: ${CONTRACT_ADDRESS}`);

      // Lấy địa chỉ USDT từ Smart Contract (nếu có hàm usdtToken), hoặc fix cứng nếu cần.
      // Ở đây ta gọi hàm usdtToken() của ShineTicket
      setStatusMessage('Đang kiểm tra hạn mức USDT...');
      let usdtAddress;
      try {
        usdtAddress = await contract.usdtToken();
        console.log(
          `[WEB3 PAYMENT] Bóc tách địa chỉ USDT Token từ Contract thành công: ${usdtAddress}`
        );
      } catch (err) {
        throw new Error('Không thể lấy địa chỉ USDT từ Smart Contract');
      }

      const usdtContract = new ethers.Contract(
        usdtAddress,
        ERC20_ABI,
        currentSigner
      );
      const userAddress = await currentSigner.getAddress();

      // Kiểm tra Allowance
      const currentAllowance = await usdtContract.allowance(
        userAddress,
        CONTRACT_ADDRESS
      );

      console.log(
        `[WEB3 PAYMENT] Hạn mức (Allowance) USDT hiện tại của user: ${ethers.formatEther(currentAllowance)}`
      );

      // Approve một lượng đủ lớn (MaxUint256) nếu chưa đủ
      // (Hoặc có thể lấy totalAmountUsdt nếu backend truyền về chính xác lượng wei)
      if (currentAllowance === 0n) {
        // Check simply if 0, or compare with required amount
        console.log(
          `[WEB3 PAYMENT] User chưa Approve hoặc Allowance về 0. Chuẩn bị gọi hàm Approve()...`
        );
        setStatusMessage('Đang chờ phê duyệt (Approve) USDT từ ví...');
        
        const approveTxOptions = {
          maxPriorityFeePerGas: 30000000000n, // Cứng 30 Gwei tránh lỗi mạng Amoy
          maxFeePerGas: 30000000000n,
        };

        const approveTx = await usdtContract.approve(
          CONTRACT_ADDRESS,
          ethers.MaxUint256,
          approveTxOptions
        );
        console.log(
          `[WEB3 PAYMENT] Giao dịch Approve đã được Request! Hash: ${approveTx.hash}`
        );
        const approveTxReceipt = await approveTx.wait();
        console.log(
          `[WEB3 PAYMENT] Giao dịch Approve thành công tại Block: ${approveTxReceipt.blockNumber}`
        );
        toast.success('Phê duyệt USDT thành công!');
      }

      // Mua vé
      console.log(`[WEB3 PAYMENT] Hạn mức đủ. Chuẩn bị gọi hàm buyTicket()...`);
      setStatusMessage('Đang chờ xác nhận giao dịch mua vé...');

      const txOptions = {
        maxPriorityFeePerGas: 30000000000n, // 30 Gwei
        maxFeePerGas: 30000000000n,
      };

      const buyTx = await contract.buyTicket(eventId, totalQuantity, txOptions);
      setStatusMessage('Giao dịch đang được xử lý trên Blockchain...');
      const receipt = await buyTx.wait();

      setStatusMessage('Đang xác nhận với máy chủ...');
      // Báo cáo thành công cho Backend
      await orderService.updateOrderMintStatus(orderId, {
        txHash: receipt.hash || buyTx.hash,
      });

      return receipt.hash || buyTx.hash;
    } catch (error) {
      console.error('Web3 Buy Error:', error);
      let errorMessage = 'Giao dịch thất bại. Vui lòng thử lại sau.';

      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        errorMessage = 'Bạn đã từ chối giao dịch trên ví.';
      } else if (
        error.message &&
        error.message.includes('gas required exceeds allowance')
      ) {
        errorMessage = 'Chưa cấp quyền (Approve) đủ USDT cho giao dịch.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  return {
    isProcessing,
    statusMessage,
    handleBuyWithWeb3,
  };
};
