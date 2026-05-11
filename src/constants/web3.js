// Import thẳng file JSON vừa tạo vào
import ShineTicketArtifact from '../abis/ShineTicket.json';

// Địa chỉ Smart Contract của bạn (Cập nhật sau mỗi lần deploy)
export const CONTRACT_ADDRESS = '0x9E8B7a527bD2e678E73265b21A3f0736D50208bC';

// Bóc tách đúng cái mảng "abi" từ trong file JSON ra
export const CONTRACT_ABI = ShineTicketArtifact.abi;

export const POLYGON_AMOY_CHAIN_ID = '0x13882'; // 80002 in hex
