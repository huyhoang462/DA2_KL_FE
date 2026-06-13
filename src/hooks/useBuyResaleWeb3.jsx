import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';
import { toast } from 'react-toastify';
import { useWeb3 } from '../contexts/Web3Provider';
import {
  MARKETPLACE_ADDRESS,
  MARKETPLACE_ABI,
  POLYGON_AMOY_CHAIN_ID,
  USDT_TOKEN_ADDRESS,
} from '../constants/web3';

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) public view returns (uint256)',
];

const toBigIntSafe = (value) => {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(value);
  if (typeof value === 'string' && value.trim() !== '') return BigInt(value);
  return 0n;
};

export const useBuyResaleWeb3 = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const { wallets } = useWallets();

  const handleBuyResaleWeb3 = async ({
    tokenIdsWeb3,
    totalPrice,
    destinationPrivyAddress,
  }) => {
    try {
      console.log('====== [WEB3 RESALE PAYMENT] BẮT ĐẦU MUA LẠI VÉ ======');
      console.log(`- Token IDs:`, tokenIdsWeb3);
      console.log(`- Total Price:`, totalPrice);
      console.log(`- Destination Address:`, destinationPrivyAddress);

      setIsProcessing(true);
      setStatusMessage('Đang kết nối ví...');

      const ethereumProvider = window.ethereum;
      if (!ethereumProvider) {
        throw new Error(
          'Hệ thống không tìm thấy ví Web3 (ví dụ: MetaMask). Vui lòng cài đặt ví Web3 trên trình duyệt của bạn để tiếp tục thanh toán.'
        );
      }

      let currentSigner;
      const browserProvider = new ethers.BrowserProvider(ethereumProvider);
      
      // Yêu cầu kết nối tài khoản
      await browserProvider.send('eth_requestAccounts', []);
      currentSigner = await browserProvider.getSigner();

      const currentNetwork = await ethereumProvider.request({
        method: 'eth_chainId',
      });
      if (currentNetwork !== POLYGON_AMOY_CHAIN_ID) {
        setStatusMessage('Đang chuyển mạng lưới...');
        try {
          await ethereumProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: POLYGON_AMOY_CHAIN_ID }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await ethereumProvider.request({
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
        const newProvider = new ethers.BrowserProvider(ethereumProvider);
        currentSigner = await newProvider.getSigner();
      }

      const connectedBuyerAddress = await currentSigner.getAddress();
      const tokenAddress = USDT_TOKEN_ADDRESS;

      const contract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        currentSigner
      );

      console.log(`[WEB3 RESALE PAYMENT] Ví kết nối: ${connectedBuyerAddress}`);
      console.log(`[WEB3 RESALE PAYMENT] Marketplace Address: ${MARKETPLACE_ADDRESS}`);

      if (!tokenAddress) {
        throw new Error('Không thể xác định địa chỉ USDT token');
      }

      const usdtContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        currentSigner
      );

      const approveAmount = toBigIntSafe(ethers.parseUnits(totalPrice.toString(), 6));

      // Kiểm tra Allowance
      const currentAllowance = await usdtContract.allowance(
        connectedBuyerAddress,
        MARKETPLACE_ADDRESS
      );

      console.log(
        `[WEB3 RESALE PAYMENT] Allowance hiện tại: ${ethers.formatUnits(currentAllowance, 6)} USDT`
      );

      if (approveAmount <= 0n) {
        throw new Error('Số tiền thanh toán không hợp lệ');
      }

      if (currentAllowance < approveAmount) {
        console.log(`[WEB3 RESALE PAYMENT] Cần Approve...`);
        setStatusMessage('Đang chờ phê duyệt (Approve) USDT từ ví...');

        const approveTxOptions = {
          maxPriorityFeePerGas: 30000000000n, // Cứng 30 Gwei tránh lỗi mạng Amoy
          maxFeePerGas: 30000000000n,
        };

        const approveTx = await usdtContract.approve(
          MARKETPLACE_ADDRESS,
          approveAmount,
          approveTxOptions
        );
        console.log(`[WEB3 RESALE PAYMENT] Gửi Approve... Hash: ${approveTx.hash}`);
        await approveTx.wait();
        toast.success('Phê duyệt USDT thành công!');
      }

      console.log(`[WEB3 RESALE PAYMENT] Bắt đầu gọi batchBuyTicketsFor...`);
      setStatusMessage('Đang chờ xác nhận giao dịch mua vé...');

      const txOptions = {
        maxPriorityFeePerGas: 30000000000n,
        maxFeePerGas: 30000000000n,
      };

      const buyTx = await contract.batchBuyTicketsFor(
        tokenIdsWeb3,
        destinationPrivyAddress,
        txOptions
      );
      setStatusMessage('Giao dịch đang được xử lý trên Blockchain...');
      const receipt = await buyTx.wait();

      setStatusMessage('Giao dịch Blockchain thành công!');
      return receipt.hash || buyTx.hash;
    } catch (error) {
      console.error('Web3 Buy Resale Error:', error);
      let errorMessage = 'Giao dịch thất bại. Vui lòng thử lại sau.';

      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        errorMessage = 'Bạn đã từ chối giao dịch trên ví.';
      } else if (error.message && error.message.includes('gas required exceeds allowance')) {
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
    handleBuyResaleWeb3,
  };
};
