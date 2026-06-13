import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';
import { requestGasFund, waitForGasFunding } from '../services/postService';
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI, POLYGON_AMOY_CHAIN_ID } from '../constants/web3';

// Thêm fragment của hàm batchCancelListings nếu trong MARKETPLACE_ABI chưa có
const CANCEL_LISTING_ABI = [
  ...MARKETPLACE_ABI,
  'function batchCancelListings(uint256[] calldata tokenIds) external',
];

export const useCancelListingWeb3 = () => {
  const [isCancelingWeb3, setIsCancelingWeb3] = useState(false);
  const [cancelWeb3StatusMessage, setCancelWeb3StatusMessage] = useState('');
  const { wallets } = useWallets();

  const handleCancelListingWeb3 = async ({ ticketIdsWeb3 }) => {
    try {
      setIsCancelingWeb3(true);
      setCancelWeb3StatusMessage('Đang kết nối ví...');

      const wallet = wallets[0];
      if (!wallet) {
        throw new Error(
          'Không tìm thấy ví Web3. Vui lòng đăng nhập hoặc kết nối ví Privy.'
        );
      }

      const ethereumProvider = await wallet.getEthereumProvider();

      // Kiểm tra và chuyển mạng nếu cần
      const currentNetwork = await ethereumProvider.request({
        method: 'eth_chainId',
      });
      if (currentNetwork !== POLYGON_AMOY_CHAIN_ID) {
        setCancelWeb3StatusMessage('Đang chuyển mạng lưới...');
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
      }

      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      setCancelWeb3StatusMessage('Đang yêu cầu phí Gas...');
      console.log('[CANCEL_LISTING] Requesting gas funding for:', signerAddress);

      try {
        await requestGasFund(signerAddress);
        console.log(
          '[CANCEL_LISTING] Gas funding request sent, waiting for confirmation...'
        );
        setCancelWeb3StatusMessage('Đang chờ nạp Gas...');
        await waitForGasFunding(signerAddress);
        console.log('[CANCEL_LISTING] Gas funding confirmed!');
      } catch (gasError) {
        if (gasError?.message?.includes('pending gas fund request')) {
          console.warn(
            '[CANCEL_LISTING] Pending gas fund request detected. User needs to wait 1-2 minutes.'
          );
          throw new Error('Bạn đã có một yêu cầu nạp gas đang chờ. Vui lòng chờ khoảng 1-2 phút để hoàn thành.');
        }
        throw gasError;
      }

      setCancelWeb3StatusMessage(`Đang hủy niêm yết ${ticketIdsWeb3.length} vé trên Smart Contract...`);
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        CANCEL_LISTING_ABI,
        signer
      );

      const overrides = {
        maxPriorityFeePerGas: ethers.parseUnits('30', 'gwei'), // 30 GWEI
        maxFeePerGas: ethers.parseUnits('150', 'gwei'), // 150 GWEI (base + priority)
      };

      console.log('[CANCEL_LISTING] Sending batch cancel transactions for tokenIds:', ticketIdsWeb3);

      try {
        await marketplaceContract.batchCancelListings.estimateGas(ticketIdsWeb3, overrides);
        
        const cancelTx = await marketplaceContract.batchCancelListings(ticketIdsWeb3, overrides);
        console.log(`[CANCEL_LISTING] Batch transaction sent:`, cancelTx.hash);
        
        setCancelWeb3StatusMessage('Đang xác nhận giao dịch trên blockchain...');
        await cancelTx.wait();
        console.log(`[CANCEL_LISTING] ✅ Canceled tokenIds successfully!`);
      } catch (contractError) {
        console.error(`[CANCEL_LISTING] Lỗi khi hủy vé batch:`, contractError);
        const errorMsg =
          contractError?.reason ||
          contractError?.message ||
          String(contractError);
          
        throw new Error(`Smart Contract từ chối khi hủy vé: ${errorMsg}`);
      }

      setCancelWeb3StatusMessage('Đã hủy niêm yết thành công!');
      return true;
    } catch (error) {
      console.error('Lỗi khi gọi Smart Contract (Hủy bán):', error);

      let errorMessage = 'Có lỗi xảy ra khi hủy bán trên blockchain.';
      const errorStr = error?.reason || error?.message || String(error);

      if (
        errorStr.includes('gas price below minimum') ||
        errorStr.includes('gas tip')
      ) {
        errorMessage = 'Gas price quá thấp. Vui lòng thử lại sau.';
      } else if (errorStr.includes('pending gas fund') || errorStr.includes('Bạn đã có một yêu cầu nạp gas đang chờ')) {
        errorMessage =
          'Bạn đã có một yêu cầu nạp gas đang chờ. Vui lòng chờ 1-2 phút.';
      } else if (errorStr.includes('insufficient funds')) {
        errorMessage = 'Tài khoản không đủ gas fee. Vui lòng thử lại sau.';
      } else if (errorStr.includes('user rejected') || errorStr.includes('User rejected')) {
        errorMessage = 'Bạn đã hủy giao dịch.';
      } else {
        errorMessage = errorStr;
      }

      throw new Error(errorMessage);
    } finally {
      setIsCancelingWeb3(false);
      setCancelWeb3StatusMessage('');
    }
  };

  return {
    isCancelingWeb3,
    cancelWeb3StatusMessage,
    handleCancelListingWeb3,
  };
};
