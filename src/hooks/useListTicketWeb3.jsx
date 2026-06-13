import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';
import { requestGasFund, waitForGasFunding } from '../services/postService';
import {
  CONTRACT_ADDRESS,
  MARKETPLACE_ADDRESS,
  CONTRACT_ABI,
  MARKETPLACE_ABI,
  POLYGON_AMOY_CHAIN_ID,
} from '../constants/web3';

export const useListTicketWeb3 = () => {
  const [isWeb3Processing, setIsWeb3Processing] = useState(false);
  const [web3StatusMessage, setWeb3StatusMessage] = useState('');
  const { wallets } = useWallets();

  const handleListTicketWeb3 = async ({
    ticketIdsWeb3,
    pricesWeb3,
    walletAddress,
  }) => {
    try {
      setIsWeb3Processing(true);
      setWeb3StatusMessage('Đang kết nối ví...');

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
        setWeb3StatusMessage('Đang chuyển mạng lưới...');
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

      setWeb3StatusMessage('Đang kiểm tra phí Gas...');
      console.log('[POST] Requesting gas funding for:', signerAddress);

      try {
        await requestGasFund(signerAddress);
        console.log(
          '[POST] Gas funding request sent, waiting for confirmation...'
        );
        setWeb3StatusMessage('Đang chờ nạp Gas...');
        await waitForGasFunding(signerAddress);
        console.log('[POST] Gas funding confirmed!');
      } catch (gasError) {
        if (gasError?.message?.includes('pending gas fund request')) {
          console.warn(
            '[POST] Pending gas fund request detected. User needs to wait 1-2 minutes.'
          );
          throw new Error('Bạn đã có một yêu cầu nạp gas đang chờ. Vui lòng chờ khoảng 1-2 phút để hoàn thành.');
        }
        throw gasError;
      }

      setWeb3StatusMessage('Đang kiểm tra quyền truy cập...');
      const ticketContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      const isApproved = await ticketContract.isApprovedForAll(
        signerAddress,
        MARKETPLACE_ADDRESS
      );

      const overrides = {
        maxPriorityFeePerGas: ethers.parseUnits('30', 'gwei'), // 30 GWEI
        maxFeePerGas: ethers.parseUnits('150', 'gwei'), // 150 GWEI (base + priority)
      };

      if (!isApproved) {
        setWeb3StatusMessage('Đang yêu cầu cấp quyền (Approve)...');
        console.log('[POST] Requesting approval for Marketplace...');
        const approveTx = await ticketContract.setApprovalForAll(
          MARKETPLACE_ADDRESS,
          true,
          overrides
        );
        console.log('[POST] Approval transaction sent:', approveTx.hash);
        await approveTx.wait();
        console.log('[POST] ✅ Approval confirmed!');
      }

      setWeb3StatusMessage('Đang kiểm tra quyền sở hữu vé...');
      console.log('[TICKET OWNERSHIP CHECK] Checking tickets...');
      for (let i = 0; i < ticketIdsWeb3.length; i++) {
        const ticketId = ticketIdsWeb3[i];
        try {
          const owner = await ticketContract.ownerOf(ticketId);
          console.log(
            `[TICKET #${i}] Owner: ${owner}, Expected: ${signerAddress}`
          );
          if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
            throw new Error(
              `Vé #${i} không thuộc về bạn. Chủ sở hữu: ${owner}`
            );
          }
        } catch (ownerError) {
          console.error(`[TICKET #${i}] Ownership check failed:`, ownerError);
          throw new Error(
            `Lỗi kiểm tra vé #${i}: ${ownerError?.reason || ownerError?.message}`
          );
        }
      }

      setWeb3StatusMessage('Đang gửi giao dịch đăng bán...');
      console.log(
        '[POST] Sending batch list tickets transaction to blockchain...'
      );

      console.log('[BATCH LIST TICKETS] Parameters:', {
        ticketIds: ticketIdsWeb3.map((id) => id.toString()),
        prices: pricesWeb3.map((p) => ethers.formatUnits(p, 6)),
        fundReceiver: walletAddress,
        signerAddress,
      });

      try {
        const estimatedGas =
          await marketplaceContract.batchListTickets.estimateGas(
            ticketIdsWeb3,
            pricesWeb3,
            walletAddress,
            overrides
          );
        console.log(
          '[BATCH LIST TICKETS] Estimated Gas:',
          estimatedGas.toString()
        );
      } catch (estimateError) {
        console.error(
          '[BATCH LIST TICKETS] estimateGas failed:',
          estimateError
        );
        const errorMsg =
          estimateError?.reason ||
          estimateError?.message ||
          String(estimateError);
        throw new Error(`Smart Contract từ chối: ${errorMsg}`);
      }

      const listTx = await marketplaceContract.batchListTickets(
        ticketIdsWeb3,
        pricesWeb3,
        walletAddress,
        overrides
      );
      
      setWeb3StatusMessage('Đang xác nhận giao dịch trên blockchain...');
      await listTx.wait();

      return listTx.hash;
    } catch (error) {
      console.error('Lỗi khi gọi Smart Contract:', error);

      let errorMessage = 'Có lỗi xảy ra khi tương tác với blockchain.';
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
      setIsWeb3Processing(false);
      setWeb3StatusMessage('');
    }
  };

  return {
    isWeb3Processing,
    web3StatusMessage,
    handleListTicketWeb3,
  };
};
