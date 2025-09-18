// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NFTName = "Tixora NFT";
const NFTSymbol = "TIX";
const NFTURI = "ipfs://bafybeidjmguiviozpgptmvbkq4mzivq5vp3uktw3fuouzk2i25binmfyxy";
const DeployerAddress = "0x08d0d1572A8a714D90D670Ea344Dd23B1dF565Dd";

const TixoraModule = buildModule("Tixora", (m) => {
  // Deploy TicketNft
  const ticketNft = m.contract("TicketNft", [NFTName, NFTSymbol, NFTURI]);

  // Deploy EventTicketing
  const eventTicketing = m.contract("EventTicketing", [ticketNft, DeployerAddress, 250]);

  // Set TicketNft minter to EventTicketing
  m.call(ticketNft, "setMinter", [eventTicketing]);

  // Deploy TicketResaleMarket
  const ticketResaleMarket = m.contract("TicketResaleMarket", [eventTicketing, ticketNft, DeployerAddress, 250]);

  return { ticketNft, eventTicketing, ticketResaleMarket };
});

export default TixoraModule;
