// Import thẳng file JSON vừa tạo vào
import ShineTicketArtifact from '../abis/ShineTicket.json';

// Địa chỉ Smart Contract của bạn (Cập nhật sau mỗi lần deploy)
export const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Bóc tách đúng cái mảng "abi" từ trong file JSON ra
export const CONTRACT_ABI = ShineTicketArtifact.abi;

export const POLYGON_AMOY_CHAIN_ID = '0x13882'; // 80002 in hex
