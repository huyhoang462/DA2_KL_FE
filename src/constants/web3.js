// Import thẳng file JSON vừa tạo vào
import ShineTicketArtifact from '../abis/ShineTicket.json';

// Địa chỉ Smart Contract của bạn (Cập nhật sau mỗi lần deploy)
// cu export const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const CONTRACT_ADDRESS = '0xf14d7dadf33aB3E2335B5C0280d23F49FFD157d5';

// Bóc tách đúng cái mảng "abi" từ trong file JSON ra
export const CONTRACT_ABI = ShineTicketArtifact.abi;

export const POLYGON_AMOY_CHAIN_ID = '0x13882'; // 80002 in hex
