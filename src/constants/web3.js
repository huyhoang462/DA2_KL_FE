// Import thẳng file JSON vừa tạo vào
import ShineTicketArtifact from '../api/ShineTicket.json';

// Địa chỉ Smart Contract của bạn (có thể override bằng env)
// cu export const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const CONTRACT_ADDRESS = '0xff1B1347F5493aCD886ff0021B1D0d4c8BDf357e';

export const USDT_TOKEN_ADDRESS = '0xB93e8F4905C889DDB24D0FD13ffa81668f7A26a2';

// Bóc tách đúng cái mảng "abi" từ trong file JSON ra
export const CONTRACT_ABI = ShineTicketArtifact.abi;

export const POLYGON_AMOY_CHAIN_ID = '0x13882'; // 80002 in hex
