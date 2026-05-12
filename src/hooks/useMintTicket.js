import { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useWeb3 } from '../contexts/Web3Provider';
import {
  startEventMinting,
  submitEventMintResult,
} from '../services/eventService';
import { useQueryClient } from '@tanstack/react-query';
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  POLYGON_AMOY_CHAIN_ID,
} from '../constants/web3';
// Replace with actual Contract Address & ABI for your project

export const useMintTicket = () => {
  const [isMinting, setIsMinting] = useState(false);
  const { provider, signer, connectWallet } = useWeb3();
  const queryClient = useQueryClient();

  const handleMintTicket = async (event) => {
    console.log('Bắt đầu mint vé cho sự kiện:', event);
    try {
      setIsMinting(true);

      // Bước 1: Kiểm tra môi trường ví (Wallet Environment Check)
      if (typeof window.ethereum === 'undefined') {
        toast.error(
          'Hệ thống không tìm thấy ví Web3. Vui lòng cài đặt tiện ích MetaMask trên trình duyệt của bạn để tiếp tục.'
        );
        return;
      }

      let currentSigner = signer;
      if (!currentSigner) {
        // Tự động gọi lại hàm "Connect Wallet" ở Phần 1
        await connectWallet();
        // Cần lấy lại signer sau khi connect
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        currentSigner = await browserProvider.getSigner();
      }

      // Bước 2: Kiểm tra và Ép chuyển mạng lưới (Network Switch)
      const currentNetwork = await window.ethereum.request({
        method: 'eth_chainId',
      });
      if (currentNetwork !== POLYGON_AMOY_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: POLYGON_AMOY_CHAIN_ID }],
          });
        } catch (switchError) {
          // If the network is not added to MetaMask, we can prompt to add it
          // Error code 4902 indicates that the chain has not been added to MetaMask.
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
      }

      // Bước 3: Chuẩn bị Dữ liệu Voucher (Data Formatting)
      // Lấy voucher từ cục dữ liệu Event (đã fetch từ BE về)
      const voucherData = event.voucher;

      if (!voucherData) {
        throw new Error('Không tìm thấy dữ liệu voucher từ sự kiện.');
      }

      // Thông báo BE bắt đầu mint (Tuỳ chọn nhưng giúp tracking trạng thái 'minting')
      // try {
      //   await startEventMinting(event.id);
      // } catch (err) {
      //   console.warn('Could not start minting on BE:', err);
      // }

      // Tách Chữ ký (BE có thể trả về voucherSignature hoặc signature)
      const signature = event.voucherSignature || event.signature;

      // Chuẩn hóa payload voucher nếu BE bọc thêm { voucher, voucherSignature }
      const rawVoucher = voucherData.voucher || voucherData;

      if (!signature) {
        throw new Error('Không tìm thấy chữ ký voucher từ BE.');
      }

      // Gom Tuple theo đúng thứ tự Struct MintVoucher
      const voucherTuple = [
        rawVoucher.eventId,
        rawVoucher.quantity,
        rawVoucher.commissionRateBps,
        rawVoucher.relayerGasPerTicket,
        rawVoucher.checkinGasPerTicket,
        rawVoucher.expiryTime,
        rawVoucher.nonce,
      ];

      // Bước 4: Khởi tạo Smart Contract và Giao dịch
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        currentSigner
      );

      // Thay vì truyền thủ công maxFee/maxPriorityFee (có thể không được hỗ trợ chuẩn xác trên một số RPC của Polygon Amoy),
      // hãy thiết lập gasPrice tiêu chuẩn (Legacy) vả tăng lên xíu để đảm bảo không bị "below minimum".
      const feeData = await currentSigner.provider.getFeeData();

      const txOptions = {};

      // Minimum Polygon Amoy gas price thường là 25 Gwei (25000000000)
      // Sử dụng loại giao dịch Legacy (gasPrice) để tránh lỗi EIP-1559 thiếu support maxPriorityFeePerGas
      const minimumGasPrice = 30000000000n; // Set an toàn 30 Gwei

      if (feeData.gasPrice && feeData.gasPrice > minimumGasPrice) {
        txOptions.gasPrice = (feeData.gasPrice * 120n) / 100n; // Tăng 20% so với network hiện tại
      } else {
        txOptions.gasPrice = minimumGasPrice;
      }

      // Gọi hàm mintEventTickets, nhét cục Tuple, chuỗi Signature và tuỳ chọn gas vào
      const tx = await contract.mintEventTickets(
        voucherTuple,
        signature,
        txOptions
      );

      toast.info('Giao dịch đang được xử lý trên Blockchain...');

      // Chờ đợi giao dịch hoàn tất
      const receipt = await tx.wait();

      // Từ lúc có txHash trở đi, FE sẽ gọi API BE
      await submitEventMintResult(event.id, {
        isSuccess: true,
        txHash: receipt.hash || tx.hash,
      });

      toast.success('Mint vé thành công!');
      queryClient.invalidateQueries(['events', 'user']);
    } catch (error) {
      console.error('Mint error:', error);

      let errorMessage = 'Mint vé thất bại. Vui lòng thử lại sau.';

      // Xử lý các lỗi Ethers/MetaMask phổ biến
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        errorMessage = 'Bạn đã từ chối giao dịch trên ví.';
      } else if (
        error.code === 'INSUFFICIENT_FUNDS' ||
        (error.error &&
          error.error.message &&
          error.error.message.includes('insufficient funds'))
      ) {
        errorMessage = 'Số dư trong ví không đủ để trả phí Gas.';
      } else if (
        error.error &&
        error.error.message &&
        error.error.message.includes('gas price below minimum')
      ) {
        errorMessage =
          'Phí Gas hiện tại đang quá cao hoặc bạn đặt Gas quá thấp. Vui lòng thử lại sau hoặc tăng phí Gas trong ví.';
      } else if (error.message && error.message.includes('user rejected')) {
        errorMessage = 'Giao dịch bị từ chối.';
      } else if (error.message) {
        // Cố gắng lấy lọi dễ hiểu cho các lỗi catch chung chung
        errorMessage = `Lỗi ví: ${error.info?.error?.message || error.error?.message || error.shortMessage || errorMessage}`;
      }

      toast.error(errorMessage);

      // Gọi API báo fail nếu đã start
      if (error.code !== 4001 && error.code !== 'ACTION_REJECTED') {
        // Lỗi người dùng reject trên ví không cần lưu fail lên db (hoặc tuỳ policy)
        try {
          await submitEventMintResult(event.id, {
            isSuccess: false,
            failureReason: error.message || 'Lỗi không xác định',
          });
          queryClient.invalidateQueries(['events', 'user']);
        } catch (e) {}
      }
    } finally {
      setIsMinting(false);
    }
  };

  return {
    isMinting,
    handleMintTicket,
  };
};
