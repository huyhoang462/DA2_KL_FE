import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';
import { toast } from 'react-toastify';
import { useWeb3 } from '../contexts/Web3Provider';
import { orderService } from '../services/orderService';
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
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

export const useBuyTicketWeb3 = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const { wallets } = useWallets();

  const handleBuyWithWeb3 = async ({
    eventId,
    quantity,
    orderId,
    recipient,
    buyerAddress,
    web3Plan = {},
  }) => {
    try {
      console.log('====== [WEB3 PAYMENT] BẮT ĐẦU QUÁ TRÌNH MUA VÉ ======');
      console.log(
        `- Event ID: ${eventId}, Quantity: ${quantity}, Order ID: ${orderId}`
      );

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

      const connectedBuyerAddress =
        buyerAddress || (await currentSigner.getAddress());
      const shineTicketAddress = CONTRACT_ADDRESS;
      const tokenAddress =
        web3Plan.tokenAddress ||
        USDT_TOKEN_ADDRESS ||
        (await (async () => {
          const fallbackContract = new ethers.Contract(
            shineTicketAddress,
            CONTRACT_ABI,
            currentSigner
          );
          return fallbackContract.usdtToken();
        })());

      const contract = new ethers.Contract(
        shineTicketAddress,
        CONTRACT_ABI,
        currentSigner
      );

      console.log(
        `[WEB3 PAYMENT] Mạng lưới hợp lệ. Ví kết nối: ${connectedBuyerAddress}`
      );
      console.log(
        `[WEB3 PAYMENT] Smart Contract Address: ${shineTicketAddress}`
      );

      console.log(`[WEB3 PAYMENT] USDT Token Address: ${tokenAddress}`);

      if (!tokenAddress) {
        throw new Error('Không thể xác định địa chỉ USDT token');
      }

      const usdtContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        currentSigner
      );
      const userAddress = connectedBuyerAddress;
      const recipientAddress = recipient || web3Plan.recipient || userAddress;

      const approveAmount = toBigIntSafe(
        web3Plan.approveAmount6Decimals ??
          web3Plan.approve?.amount ??
          web3Plan.totalPrice ??
          0n
      );

      let contractCallArgs = [];
      let contractMethod = 'buyTicket';

      if (web3Plan.eventIds && web3Plan.quantities) {
        contractMethod = 'batchBuyTickets';
        contractCallArgs = [
          web3Plan.eventIds,
          web3Plan.quantities,
          recipientAddress,
        ];
      } else {
        contractCallArgs = Array.isArray(web3Plan.contractCall?.args)
          ? web3Plan.contractCall.args
          : [eventId, quantity, recipientAddress];
        contractMethod = web3Plan.contractCall?.method || 'buyTicket';
      }

      // Kiểm tra Allowance
      const currentAllowance = await usdtContract.allowance(
        userAddress,
        web3Plan.approve?.spender || shineTicketAddress
      );

      console.log(
        `[WEB3 PAYMENT] Hạn mức (Allowance) USDT hiện tại của user: ${ethers.formatUnits(currentAllowance)}`
      );

      if (approveAmount <= 0n) {
        throw new Error('Thiếu số tiền approve cho giao dịch Web3');
      }

      if (currentAllowance < approveAmount) {
        console.log(
          `[WEB3 PAYMENT] Allowance chưa đủ. Chuẩn bị gọi hàm Approve()...`
        );
        setStatusMessage('Đang chờ phê duyệt (Approve) USDT từ ví...');

        const approveTxOptions = {
          maxPriorityFeePerGas: 30000000000n, // Cứng 30 Gwei tránh lỗi mạng Amoy
          maxFeePerGas: 30000000000n,
        };

        const approveTx = await usdtContract.approve(
          web3Plan.approve?.spender || shineTicketAddress,
          approveAmount,
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
      console.log(
        `[WEB3 PAYMENT] Hạn mức đủ. Chuẩn bị gọi hàm ${contractMethod}()...`
      );
      setStatusMessage('Đang chờ xác nhận giao dịch mua vé...');

      const txOptions = {
        maxPriorityFeePerGas: 30000000000n, // 30 Gwei
        maxFeePerGas: 30000000000n,
      };

      const buyTx = await contract[contractMethod](
        ...contractCallArgs,
        txOptions
      );
      setStatusMessage('Giao dịch đang được xử lý trên Blockchain...');
      const receipt = await buyTx.wait();

      // ✅ Bước: Parse event EventTicketsMinted từ receipt để lấy tokenIds
      // Smart contract dùng ERC721A nên ID vé luôn liên tiếp: [startTokenId, startTokenId + quantity - 1]
      let tokenIds = [];
      try {
        const contractInterface = new ethers.Interface(CONTRACT_ABI);
        for (const log of receipt.logs) {
          try {
            const parsed = contractInterface.parseLog(log);
            if (parsed && parsed.name === 'EventTicketsMinted') {
              const startTokenId = Number(parsed.args.startTokenId);
              const quantity = Number(parsed.args.quantity);
              for (let i = 0; i < quantity; i++) {
                tokenIds.push(startTokenId + i);
              }
            }
          } catch (_) {
            // Log không phải của contract này — bỏ qua
          }
        }
        console.log('[WEB3 PAYMENT] Đã parse được tokenIds từ receipt:', tokenIds);
      } catch (parseErr) {
        console.warn('[WEB3 PAYMENT] Không parse được tokenIds từ logs, tiếp tục gửi không có tokenIds:', parseErr);
      }

      setStatusMessage(
        'Thanh toán thành công! Hệ thống đang cập nhật vé vào tài khoản của bạn...'
      );

      // Thử tự động đồng bộ với backend nhiều lần trước khi trả về lỗi
      const maxAttempts = 3;
      const baseDelayMs = 2000; // 2s
      let lastErr = null;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          setStatusMessage(
            `Thanh toán thành công! Hệ thống đang cập nhật vé.`
          );
          await orderService.updateOrderMintStatus(orderId, {
            txHash: receipt.hash || buyTx.hash,
            tokenIds,
          });
          // Đồng bộ thành công
          return receipt.hash || buyTx.hash;
        } catch (err) {
          lastErr = err;
          console.warn(
            `[WEB3 PAYMENT] Backend sync attempt ${attempt} failed for tx`,
            receipt.hash,
            err
          );
          if (attempt < maxAttempts) {
            // Exponential backoff
            const delay = baseDelayMs * Math.pow(2, attempt - 1);
            setStatusMessage(
              `Đang thử lại đồng bộ với máy chủ... (thử lại ${attempt + 1}/${maxAttempts})`
            );
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }
        }
      }

      // Nếu tất cả attempts đều thất bại, ném lỗi SYNC_PENDING để FE hiển thị modal/cho phép resync thủ công
      const syncError = new Error(
        'Giao dịch đã thành công trên Blockchain nhưng hệ thống đang nghẽn mạch cập nhật.'
      );
      syncError.code = 'SYNC_PENDING';
      syncError.txHash = receipt.hash || buyTx.hash;
      syncError.cause = lastErr;
      throw syncError;
    } catch (error) {
      console.error('Web3 Buy Error:', error);
      let errorMessage = 'Giao dịch thất bại. Vui lòng thử lại sau.';

      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        errorMessage = 'Bạn đã từ chối giao dịch trên ví.';
      } else if (
        error.message?.includes('One of the events is not active') ||
        error.error?.message?.includes('One of the events is not active') ||
        error.data?.message?.includes('One of the events is not active') ||
        error.reason?.includes('One of the events is not active')
      ) {
        errorMessage =
          'Vé chưa được kích hoạt on-chain (Chưa Mint). Vui lòng thử thanh toán VND hoặc liên hệ hỗ trợ.';
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
