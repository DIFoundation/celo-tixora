import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { getContractAddresses, ChainId, resaleMarketAbi } from '@/lib/addressAndAbi';
import { Address } from 'viem';
// Import your ABI and contract address
// import { TICKET_MARKETPLACE_ABI, TICKET_MARKETPLACE_ADDRESS } from '@/lib/contracts/ticketMarketplace';

// // Types
// interface Listing {
//   ticketId: bigint;
//   tokenId: bigint;
//   seller: Address;
//   price: bigint;
//   active: boolean;
// }

// interface UseTicketMarketplaceGettersProps {
//   chainId?: number;
// }

// interface UseTicketMarketplaceSettersProps {
//   chainId?: number;
// }


export function useTicketMarketplaceGetters() {
    const { chain } = useAccount();
    const chainId = chain?.id || ChainId.CELO_SEPOLIA; // default to mainnet
  
    const { resaleMarket } = getContractAddresses(chainId);
  
  

// Getter Hook
// export const useTicketMarketplaceGetters = ({ chainId }: UseTicketMarketplaceGettersProps = {}) => {
  // Get event ticketing contract address
  const useEventTicketing = () => {
    return useReadContract({
      address: resaleMarket as Address,
      abi: resaleMarketAbi,
      functionName: 'eventTicketing',
      chainId,
    });
  };

  // Get fee recipient
  const useFeeRecipient = () => {
    return useReadContract({
      address: resaleMarket as Address,
      abi: resaleMarketAbi,
      functionName: 'feeRecipient',
      chainId,
    });
  };

  // Get listing details
  const useGetListing = (tokenId?: bigint) => {
    return useReadContract({
      address:  resaleMarket as Address,
      abi: resaleMarketAbi,
      functionName: 'getListing',
      args: tokenId !== undefined ? [tokenId] : undefined,
      chainId,
      query: {
        enabled: tokenId !== undefined,
      },
    });
  };

  // Get listing by token ID (direct mapping)
  const useListings = (tokenId?: bigint) => {
    return useReadContract({
      address:  resaleMarket as Address,
      abi: resaleMarketAbi,
      functionName: 'listings',
      args: tokenId !== undefined ? [tokenId] : undefined,
      chainId,
      query: {
        enabled: tokenId !== undefined,
      },
    });
  };

  // Get maximum price limit
  const useMaxPrice = () => {
    return useReadContract({
      address:  resaleMarket as Address,
      abi: resaleMarketAbi,
      functionName: 'maxPrice',
      chainId,
    });
  };

  // Get contract owner
  const useOwner = () => {
    return useReadContract({
      address:  resaleMarket as Address,
      abi: resaleMarketAbi,
      functionName: 'owner',
      chainId,
    });
  };

  // Get royalty percentage in basis points
  const useRoyaltyBps = () => {
    return useReadContract({
      address:  resaleMarket as Address,
      abi: resaleMarketAbi,
      functionName: 'royaltyBps',
      chainId,
    });
  };

  // Get ticket NFT contract address
  const useTicketNft = () => {
    return useReadContract({
      address:  resaleMarket as Address,
      abi: resaleMarketAbi,
      functionName: 'ticketNft',
      chainId,
    });
  };

  return {
    useEventTicketing,
    useFeeRecipient,
    useGetListing,
    useListings,
    useMaxPrice,
    useOwner,
    useRoyaltyBps,
    useTicketNft,
  };
};


export function useTicketMarketplaceSetters() {
    const { chain } = useAccount();
    const chainId = chain?.id || ChainId.CELO_SEPOLIA;
  
    const { ticketNft, eventTicketing, resaleMarket } = getContractAddresses(chainId);
  
// Setter Hook
// export const useTicketMarketplaceSetters = ({ chainId }: UseTicketMarketplaceSettersProps = {}) => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    chainId,
  });

  // Buy ticket (payable function)
  const buyTicket = (tokenId: bigint, value: bigint) => {
    writeContract({
      address: resaleMarket as Address,
      abi: resaleMarketAbi,
      functionName: 'buyTicket',
      args: [tokenId],
      value,
      chainId,
    });
  };

  // Cancel listing
  const cancelListing = (tokenId: bigint) => {
    writeContract({
      address: resaleMarket as Address,
      abi: resaleMarketAbi,
      functionName: 'cancelListing',
      args: [tokenId],
      chainId,
    });
  };

  // List ticket for sale
  const listTicket = (tokenId: bigint, price: bigint) => {
    writeContract({
      address: resaleMarket as Address,
      abi: resaleMarketAbi,
      functionName: 'listTicket',
      args: [tokenId, price],
      chainId,
    });
  };

  // Set fee recipient (owner only)
  const setFeeRecipient = (newRecipient: Address) => {
    writeContract({
      address: resaleMarket as Address,
      abi: resaleMarketAbi,
      functionName: 'setFeeRecipient',
      args: [newRecipient],
      chainId,
    });
  };

  // Set maximum price limit (owner only)
  const setMaxPrice = (newMaxPrice: bigint) => {
    writeContract({
      address: resaleMarket as Address,
      abi: resaleMarketAbi,
      functionName: 'setMaxPrice',
      args: [newMaxPrice],
      chainId,
    });
  };

  // Set royalty percentage (owner only)
  const setRoyalty = (newRoyaltyBps: number) => {
    writeContract({
      address: resaleMarket as Address,
      abi: resaleMarketAbi,
      functionName: 'setRoyalty',
      args: [newRoyaltyBps],
      chainId,
    });
  };

  // Transfer ownership (owner only)
  const transferOwnership = (newOwner: Address) => {
    writeContract({
      address: resaleMarket as Address,
      abi: resaleMarketAbi,
      functionName: 'transferOwnership',
      args: [newOwner],
      chainId,
    });
  };

  return {
    // Transaction state
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,

    // Write functions
    buyTicket,
    cancelListing,
    listTicket,
    setFeeRecipient,
    setMaxPrice,
    setRoyalty,
    transferOwnership,
  };
};

// Usage Examples:
/*
// For getter functions
const getters = useTicketMarketplaceGetters({
  chainId: 1, // Optional - Ethereum mainnet
});

// Use individual hooks
const { data: listing, isLoading: listingLoading } = getters.useGetListing(BigInt(1));
const { data: maxPrice, isLoading: maxPriceLoading } = getters.useMaxPrice();
const { data: royaltyBps } = getters.useRoyaltyBps();

// For setter functions
const {
  listTicket,
  buyTicket,
  cancelListing,
  isPending,
  isConfirming,
  isConfirmed,
  hash,
  error
} = useTicketMarketplaceSetters({
  chainId: 1, // Optional
});

// Example usage
const handleListTicket = () => {
  listTicket(BigInt(1), BigInt('1000000000000000000')); // List token 1 for 1 ETH
};

const handleBuyTicket = () => {
  buyTicket(BigInt(1), BigInt('1000000000000000000')); // Buy token 1 for 1 ETH
};

const handleCancelListing = () => {
  cancelListing(BigInt(1)); // Cancel listing for token 1
};

// Admin functions
const handleSetMaxPrice = () => {
  setMaxPrice(BigInt('10000000000000000000')); // Set max price to 10 ETH
};

const handleSetRoyalty = () => {
  setRoyalty(250); // Set royalty to 2.5% (250 basis points)
};
*/