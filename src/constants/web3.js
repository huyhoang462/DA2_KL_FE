// Import file JSON từ thư mục abis
import ShineTicketArtifact from '../abis/ShineTicket.json';
import ShineMarketplaceArtifact from '../abis/ShineMarketplace.json';
import MockUSDTArtifact from '../abis/MockUSDT.json';

// Địa chỉ Smart Contract của bạn (có thể override bằng env)
// cu export const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const CONTRACT_ADDRESS = '0x6EcdAB152dF7bACE887FA6382259DADe3Aa760a8';

export const USDT_TOKEN_ADDRESS = '0xB93e8F4905C889DDB24D0FD13ffa81668f7A26a2';

// Bổ sung địa chỉ Marketplace (Cập nhật sau khi deploy)
export const MARKETPLACE_ADDRESS = '0x19357De551cc161c801c207641f40B5cb36C4499';

// Bóc tách đúng cái mảng "abi" từ trong file JSON ra
export const CONTRACT_ABI = ShineTicketArtifact.abi;
export const MARKETPLACE_ABI = ShineMarketplaceArtifact.abi;
export const USDT_ABI = MockUSDTArtifact.abi;

export const POLYGON_AMOY_CHAIN_ID = '0x13882'; // 80002 in hex
