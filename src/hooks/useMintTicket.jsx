import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';
import { toast } from 'react-toastify';
import { useWeb3 } from '../contexts/Web3Provider';
import { submitEventMintResult } from '../services/eventService';
import { useQueryClient } from '@tanstack/react-query';
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  POLYGON_AMOY_CHAIN_ID,
} from '../constants/web3';
// Replace with actual Contract Address & ABI for your project

const getMintPrecheckErrorMessage = (error, voucherIndex = null) => {
  const prefix = voucherIndex === null ? '' : `Voucher[${voucherIndex}]: `;
  const reason =
    error?.reason ||
    error?.shortMessage ||
    error?.error?.message ||
    error?.info?.error?.message ||
    error?.message ||
    '';

  if (reason.includes('One of the events is not active')) {
    return `${prefix}Vé chưa được kích hoạt hoặc backend đang lệch với trạng thái on-chain.`;
  }

  if (reason.includes('missing revert data')) {
    return `${prefix}Smart Contract từ chối giao dịch. Có thể voucher hết hạn, chữ ký không hợp lệ, nonce đã dùng hoặc eventId/price sai.`;
  }

  if (reason.includes('CALL_EXCEPTION')) {
    return `${prefix}Lỗi gọi Smart Contract. Dữ liệu voucher có thể không hợp lệ.`;
  }

  return `${prefix}${reason || 'Dữ liệu mint không hợp lệ.'}`;
};

const validateMintVoucher = (voucher, signature, index) => {
  if (!Array.isArray(voucher) || voucher.length !== 9) {
    throw new Error(`Voucher[${index}] có định dạng không hợp lệ.`);
  }

  if (!voucher[8] || typeof voucher[8] !== 'string' || !voucher[8].startsWith('0x')) {
    throw new Error(`Voucher[${index}] thiếu hoặc sai định dạng địa chỉ organizer. Đây có thể là sự kiện được duyệt theo phiên bản cũ, vui lòng tạo lại sự kiện mới!`);
  }

  if (!signature || typeof signature !== 'string') {
    throw new Error(`Voucher[${index}] thiếu chữ ký.`);
  }

  const expiryTime = Number(voucher[6]);
  const nonce = voucher[7];

  if (voucher[0] === null || voucher[0] === undefined) {
    throw new Error(`Voucher[${index}] thiếu eventId.`);
  }

  if (!voucher[1] || Number(voucher[1]) <= 0) {
    throw new Error(`Voucher[${index}] quantity không hợp lệ.`);
  }

  if (!voucher[2] || BigInt(voucher[2]) <= 0n) {
    throw new Error(`Voucher[${index}] price không hợp lệ.`);
  }

  if (!expiryTime || Number.isNaN(expiryTime)) {
    throw new Error(`Voucher[${index}] expiryTime không hợp lệ.`);
  }

  if (expiryTime <= Math.floor(Date.now() / 1000)) {
    throw new Error(`Voucher[${index}] đã hết hạn.`);
  }

  if (nonce === null || nonce === undefined || nonce === '') {
    throw new Error(`Voucher[${index}] thiếu nonce.`);
  }
};

export const useMintTicket = () => {
  const [isMinting, setIsMinting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const { wallets } = useWallets();
  const queryClient = useQueryClient();

  const handleMintTicket = async (event) => {
    console.log('Bắt đầu mint vé cho sự kiện:', event);
    try {
      setIsMinting(true);
      setStatusMessage('Đang kết nối ví...');
      const isDevMode = import.meta.env?.DEV ?? false;

      // Bước 1: Kiểm tra môi trường ví (Wallet Environment Check)
      let ethereumProvider;
      let browserProvider;
      let currentSigner;

      if (window.ethereum) {
        // Default: Luôn ưu tiên dùng MetaMask (window.ethereum) nếu người dùng có cài extension
        ethereumProvider = window.ethereum;
        browserProvider = new ethers.BrowserProvider(window.ethereum);
        await browserProvider.send('eth_requestAccounts', []); // Yêu cầu kết nối ví
        currentSigner = await browserProvider.getSigner();
      } else if (wallets && wallets.length > 0) {
        // Fallback: Dùng ví kết nối qua Privy nếu không tìm thấy MetaMask gốc
        const wallet = wallets[0];
        ethereumProvider = await wallet.getEthereumProvider();
        browserProvider = new ethers.BrowserProvider(ethereumProvider);
        currentSigner = await browserProvider.getSigner();
      } else {
        throw new Error(
          'Hệ thống không tìm thấy ví Web3. Vui lòng cài đặt MetaMask để tiếp tục thanh toán.'
        );
      }

      // Bước 2: Kiểm tra và Ép chuyển mạng lưới (Network Switch)
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
          // If the network is not added to MetaMask, we can prompt to add it
          // Error code 4902 indicates that the chain has not been added to MetaMask.
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

        // Bắt buộc khởi tạo lại Provider và Signer sau khi ví vừa đổi mạng
        // Nếu không ethers.js sẽ báo lỗi "network changed: 1 => 80002"
        const newProvider = new ethers.BrowserProvider(ethereumProvider);
        currentSigner = await newProvider.getSigner();
      }

      // Bước 3: Chuẩn bị Dữ liệu Voucher (Data Formatting)
      setStatusMessage('Đang chuẩn bị dữ liệu mint...');
      // Lấy voucher từ cục dữ liệu Event (đã fetch từ BE về)
      const vouchersData = event.vouchers;
      const signaturesData = event.signatures;

      if (
        !vouchersData ||
        !signaturesData ||
        vouchersData.length !== signaturesData.length
      ) {
        throw new Error(
          'Dữ liệu vouchers hoặc signatures không hợp lệ từ sự kiện.'
        );
      }

      // Chuẩn hóa mảng vouchers để convert eventId sang BigInt giống với yêu cầu của smart contract nếu cần
      const formattedVouchers = vouchersData.map((v, index) => {
        const rawVoucher = v.voucher || v;
        
        if (!rawVoucher.organizer) {
          throw new Error(`Sự kiện này được duyệt theo hệ thống cũ (thiếu địa chỉ organizer). Vui lòng tạo lại sự kiện mới để có thể phát hành vé.`);
        }

        return [
          BigInt(rawVoucher.eventId),
          rawVoucher.quantity,
          BigInt(rawVoucher.price), // Backend đã parse sẵn ra Wei, chỉ việc chuyển sang BigInt
          rawVoucher.commissionRateBps,
          rawVoucher.relayerGasPerTicket,
          rawVoucher.checkinGasPerTicket,
          rawVoucher.expiryTime,
          rawVoucher.nonce,
          rawVoucher.organizer,
        ];
      });

      // Lấy array ký
      const signatures = signaturesData;

      // Bước 4: Khởi tạo Smart Contract và Giao dịch
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        currentSigner
      );

      // Mạng Polygon Amoy yêu cầu cấu hình Gas tối thiểu 25 Gwei
      const txOptions = {
        maxPriorityFeePerGas: 30000000000n, // 30 Gwei
        maxFeePerGas: 30000000000n, // 30 Gwei
      };

      // 🚨 BLOCK UI LÚC NÀY
      toast.info(
        'Hệ thống đang đúc toàn bộ các hạng vé lên Blockchain. Vui lòng KHÔNG ĐÓNG trình duyệt hay làm mới (F5) trang web lúc này!',
        {
          autoClose: false,
          toastId: 'minting-toast',
        }
      );

      // Gọi hàm batchRegisterEvents thay vì batchMintEventTickets
      console.log('--- DEBUG: MINT PARAMS ---');
      console.log('formattedVouchers:', formattedVouchers);
      console.log('signatures:', signatures);
      console.log('txOptions:', txOptions);
      console.log('--------------------------');

      const seenNonces = new Set();
      setStatusMessage('Đang kiểm tra dữ liệu voucher...');
      formattedVouchers.forEach((voucher, index) => {
        validateMintVoucher(voucher, signatures[index], index);

        const nonceKey = String(voucher[7]);
        if (seenNonces.has(nonceKey)) {
          throw new Error(`Nonce bị trùng ở Voucher[${index}].`);
        }
        seenNonces.add(nonceKey);
      });

      try {
        setStatusMessage('Đang kiểm tra giao dịch với Smart Contract...');
        await contract.batchRegisterEvents.staticCall(
          formattedVouchers,
          signatures
        );
        console.log('[WEB3 PAYMENT] Batch staticCall precheck: OK');
      } catch (precheckError) {
        console.error(
          '[WEB3 PAYMENT] Batch staticCall precheck failed',
          precheckError
        );

        if (isDevMode) {
          console.log('--- DEBUG: PER-VOUCHER CHECK ---');
          for (let index = 0; index < formattedVouchers.length; index++) {
            const voucher = formattedVouchers[index];
            const signature = signatures[index];

            console.log(`Voucher[${index}]`, {
              eventId: voucher[0]?.toString?.() ?? voucher[0],
              quantity: voucher[1],
              price: voucher[2]?.toString?.() ?? voucher[2],
              commissionRateBps: voucher[3],
              relayerGasPerTicket: voucher[4],
              checkinGasPerTicket: voucher[5],
              expiryTime: voucher[6],
              nonce: voucher[7],
              organizer: voucher[8],
              signaturePreview:
                typeof signature === 'string'
                  ? `${signature.slice(0, 18)}...${signature.slice(-10)}`
                  : signature,
            });

            try {
              await contract.batchRegisterEvents.staticCall(
                [voucher],
                [signature]
              );
              console.log(`Voucher[${index}] staticCall: OK`);
            } catch (staticError) {
              console.error(`Voucher[${index}] staticCall failed`, staticError);
              throw new Error(getMintPrecheckErrorMessage(staticError, index));
            }
          }
          console.log('--- DEBUG: PER-VOUCHER CHECK DONE ---');
        }

        throw new Error(getMintPrecheckErrorMessage(precheckError));
      }

      setStatusMessage('Đang chờ xác nhận đăng ký sự kiện trên ví...');
      const tx = await contract.batchRegisterEvents(
        formattedVouchers,
        signatures,
        txOptions
      );

      // Bước 4b: Đợi Blockchain xác nhận giao dịch (Await)
      setStatusMessage('Giao dịch mint đang được xử lý trên Blockchain...');
      const receipt = await tx.wait();

      // Bước 5: Báo cáo Backend và Chốt hạ
      try {
        setStatusMessage('Đang cập nhật kết quả mint lên hệ thống...');
        await submitEventMintResult(event.id, {
          isSuccess: true,
          txHash: receipt.hash || tx.hash,
        });

        toast.dismiss('minting-toast');
        toast.success('Sự kiện đã mở bán thành công!');
        queryClient.invalidateQueries(['events', 'user']);
      } catch (beError) {
        console.error('Backend update error:', beError); // Fix: Sử dụng hoặc log lỗi này thay vì bỏ không
        toast.dismiss('minting-toast');
        throw new Error(
          'Vé đã đúc trên mạng nhưng hệ thống gặp lỗi cập nhật. Vui lòng liên hệ Admin'
        );
      }
    } catch (error) {
      toast.dismiss('minting-toast');

      console.error('====== MINT ERROR DETAILS ======');
      console.error('Full Error Object:', error);
      console.error('Error Code:', error.code);
      console.error('Error Reason:', error.reason);
      console.error('Error Message:', error.message);
      console.error('Error Data (Hex):', error.data);
      console.error('Transaction Params:', error.transaction);
      if (error.info) console.error('Error Info:', error.info);
      console.error('================================');

      let errorMessage = 'Mint vé thất bại. Vui lòng thử lại sau.';

      // Xử lý các lỗi theo tài liệu
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        errorMessage = 'Bạn đã hủy giao dịch trên ví.';
      } else if (
        error.code === 'INSUFFICIENT_FUNDS' ||
        (error.error &&
          error.error.message &&
          error.error.message.includes('insufficient funds'))
      ) {
        errorMessage = 'Ví của bạn không đủ POL/BNB để trả phí mạng.';
      } else if (
        error.message ===
        'Vé đã đúc trên mạng nhưng hệ thống gặp lỗi cập nhật. Vui lòng liên hệ Admin'
      ) {
        errorMessage = error.message;
      } else if (
        error.error &&
        error.error.message &&
        error.error.message.includes('gas price below minimum')
      ) {
        errorMessage =
          'Phí Gas hiện tại đang quá cao hoặc bạn đặt Gas quá thấp. Vui lòng thử lại sau hoặc tăng phí Gas trong ví.';
      } else if (error.message && error.message.includes('user rejected')) {
        errorMessage = 'Bạn đã hủy giao dịch trên ví.';
      } else if (
        error.message?.includes('One of the events is not active') ||
        error.error?.message?.includes('One of the events is not active') ||
        error.data?.message?.includes('One of the events is not active') ||
        error.reason?.includes('One of the events is not active')
      ) {
        errorMessage =
          'Vé chưa được kích hoạt trên hệ thống Backend hoặc dữ liệu vé đã bị sai lệch so với Backend. Vui lòng liên hệ hỗ trợ.';
      } else if (
        error.message &&
        error.message.includes('missing revert data')
      ) {
        errorMessage =
          'Giao dịch bị từ chối từ Smart Contract. Nguyên nhân có thể do Voucher hết hạn, chữ ký BE không hợp lệ, hoặc vé/nonce đã được mint.';
      } else if (error.message && error.message.includes('CALL_EXCEPTION')) {
        errorMessage =
          'Lỗi gọi Smart Contract (CALL_EXCEPTION). Giao dịch không hợp lệ.';
      } else if (error.message) {
        // Cố gắng lấy lọi dễ hiểu cho các lỗi catch chung chung
        errorMessage =
          error.info?.error?.message ||
          error.error?.message ||
          error.shortMessage ||
          error.message;
      }

      if (
        errorMessage &&
        errorMessage.includes('Hệ thống không tìm thấy ví Web3')
      ) {
        toast.error(
          <div>
            <p className="mb-2">
              Hệ thống không tìm thấy ví Web3. Bạn cần cài đặt ví để tiếp tục.
            </p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-500 underline hover:text-blue-700"
            >
              👉 Nhấn vào đây để tải và cài đặt MetaMask
            </a>
          </div>,
          { autoClose: 10000 }
        );
      } else {
        toast.error(errorMessage);
      }

      // Gọi API báo fail nếu đã start
      if (
        error.code !== 4001 &&
        error.code !== 'ACTION_REJECTED' &&
        !error.message?.includes('MetaMask')
      ) {
        // Lỗi người dùng reject trên ví không cần lưu fail lên db (hoặc tuỳ policy)
        try {
          await submitEventMintResult(event.id, {
            isSuccess: false,
            failureReason: error.message || 'Lỗi không xác định',
          });
          queryClient.invalidateQueries(['events', 'user']);
        } catch (e) {
          console.error('Failed to submit mint result:', e);
        }
      }
    } finally {
      setIsMinting(false);
      setStatusMessage('');
    }
  };

  return {
    isMinting,
    statusMessage,
    handleMintTicket,
  };
};
