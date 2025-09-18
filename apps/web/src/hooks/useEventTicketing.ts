import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { type Address, type Hash } from 'viem';
import { getContractAddresses, ChainId, eventTicketingAbi } from '@/lib/addressAndAbi';

// Import your ABI and contract address
// import { EVENT_TICKETING_ABI, EVENT_TICKETING_ADDRESS } from '@/lib/contracts/eventTicketing';

// Types
// interface Ticket {
//   id: bigint;
//   creator: Address;
//   price: bigint;
//   eventName: string;
//   description: string;
//   eventTimestamp: bigint;
//   location: string;
//   closed: boolean;
//   canceled: boolean;
//   metadata: string;
//   maxSupply: bigint;
//   sold: bigint;
//   totalCollected: bigint;
//   totalRefunded: bigint;
//   proceedsWithdrawn: boolean;
// }

// enum Status {
//   Active,
//   Closed,
//   Canceled,
//   SoldOut,
//   EventPassed
// }

// interface UseEventTicketingGettersProps {
//   chainId?: number;
// }

// interface UseEventTicketingSettersProps {
//   chainId?: number;
// }

export function useEventTicketingGetters() {
    const { chain } = useAccount();
    const chainId = chain?.id || ChainId.CELO_SEPOLIA; // default to mainnet
  
    const { ticketNft, eventTicketing, resaleMarket } = getContractAddresses(chainId);
  
  
  
// Getter Hook
// export const useEventTicketingGetters = ({ chainId }: UseEventTicketingGettersProps = {}) => {
  // Get fee recipient
  const useFeeRecipient = () => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'feeRecipient',
      chainId,
    });
  };

  // Get recent tickets
  const useGetRecentTickets = () => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'getRecentTickets',
      chainId,
    });
  };

  // Get registrants for a ticket
  const useGetRegistrants = (ticketId?: bigint) => {
    return useReadContract({
        address: eventTicketing as Address,
        abi: eventTicketingAbi,
      functionName: 'getRegistrants',
      args: ticketId !== undefined ? [ticketId] : undefined,
      chainId,
      query: {
        enabled: ticketId !== undefined,
      },
    });
  };

  // Get ticket status
  const useGetStatus = (ticketId?: bigint) => {
    return useReadContract({
        address: eventTicketing as Address,
        abi: eventTicketingAbi,
      functionName: 'getStatus',
      args: ticketId !== undefined ? [ticketId] : undefined,
      chainId,
      query: {
        enabled: ticketId !== undefined,
      },
    });
  };

  // Get total tickets count
  const useGetTotalTickets = () => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'getTotalTickets',
      chainId,
    });
  };

  // Check if ticket is available
  const useIsAvailable = (ticketId?: bigint) => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'isAvailable',
      args: ticketId !== undefined ? [ticketId] : undefined,
      chainId,
      query: {
        enabled: ticketId !== undefined,
      },
    });
  };

  // Check if user is registered for ticket
  const useIsRegistered = (ticketId?: bigint, address?: Address) => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'isRegistered',
      args: ticketId !== undefined && address ? [ticketId, address] : undefined,
      chainId,
      query: {
        enabled: !!(ticketId !== undefined && address),
      },
    });
  };

  // Get contract owner
  const useOwner = () => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'owner',
      chainId,
    });
  };

  // Get paid amount by user for ticket
  const usePaidAmount = (ticketId?: bigint, address?: Address) => {
    return useReadContract({
    address: eventTicketing as Address,
        abi: eventTicketingAbi,
      functionName: 'paidAmount',
      args: ticketId !== undefined && address ? [ticketId, address] : undefined,
      chainId,
      query: {
        enabled: !!(ticketId !== undefined && address),
      },
    });
  };

  // Get platform fee in basis points
  const usePlatformFeeBps = () => {
    return useReadContract({
        address: eventTicketing as Address,
        abi: eventTicketingAbi,
      functionName: 'platformFeeBps',
      chainId,
    });
  };

  // Get ticket NFT contract address
  const useTicketNft = () => {
    return useReadContract({
        address: eventTicketing as Address,
        abi: eventTicketingAbi,
      functionName: 'ticketNft',
      chainId,
    });
  };

  // Get ticket details
  const useTickets = (ticketId?: bigint) => {
    return useReadContract({
        address: eventTicketing as Address,
        abi: eventTicketingAbi,
      functionName: 'tickets',
      args: ticketId !== undefined ? [ticketId] : undefined,
      chainId,
      query: {
        enabled: ticketId !== undefined,
      },
    });
  };

  // Get tickets left for an event
  const useTicketsLeft = (ticketId?: bigint) => {
    return useReadContract({
        address: eventTicketing as Address,
        abi: eventTicketingAbi,
      functionName: 'ticketsLeft',
      args: ticketId !== undefined ? [ticketId] : undefined,
      chainId,
      query: {
        enabled: ticketId !== undefined,
      },
    });
  };

  return {
    useFeeRecipient,
    useGetRecentTickets,
    useGetRegistrants,
    useGetStatus,
    useGetTotalTickets,
    useIsAvailable,
    useIsRegistered,
    useOwner,
    usePaidAmount,
    usePlatformFeeBps,
    useTicketNft,
    useTickets,
    useTicketsLeft,
  };
};

export function useEventTicketingSetters() {
    const { chain } = useAccount();
    const chainId = chain?.id || ChainId.CELO_SEPOLIA; // default to mainnet
  
    const { ticketNft, eventTicketing, resaleMarket } = getContractAddresses(chainId);
  
  

// Setter Hook
// export const useEventTicketingSetters = ({ chainId }: UseEventTicketingSettersProps = {}) => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    chainId,
  });

  // Cancel ticket
  const cancelTicket = (ticketId: bigint) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'cancelTicket',
      args: [ticketId],
      chainId,
    });
  };

  // Claim refund
  const claimRefund = (ticketId: bigint) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'claimRefund',
      args: [ticketId],
      chainId,
    });
  };

  // Close ticket
  const closeTicket = (ticketId: bigint) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'closeTicket',
      args: [ticketId],
      chainId,
    });
  };

  // Create ticket
  const createTicket = (
    price: bigint,
    eventName: string,
    description: string,
    eventTimestamp: bigint,
    maxSupply: bigint,
    metadata: string,
    location: string
  ) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'createTicket',
      args: [price, eventName, description, eventTimestamp, maxSupply, metadata, location],
      chainId,
    });
  };

  // Finalize event
  const finalizeEvent = (ticketId: bigint) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'finalizeEvent',
      args: [ticketId],
      chainId,
    });
  };

  // Register for event (payable)
  const register = (ticketId: bigint, value: bigint) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'register',
      args: [ticketId],
      value,
      chainId,
    });
  };

  // Renounce ownership
  const renounceOwnership = () => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'renounceOwnership',
      chainId,
    });
  };

  // Set fee recipient
  const setFeeRecipient = (newRecipient: Address) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'setFeeRecipient',
      args: [newRecipient],
      chainId,
    });
  };

  // Set service fee
  const setServiceFee = (feeBps: number) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'setServiceFee',
      args: [feeBps],
      chainId,
    });
  };

  // Set ticket NFT contract
  const setTicketNft = (ticketNftAddress: Address) => {
    writeContract({
        address: eventTicketing as Address,
        abi: eventTicketingAbi,
      functionName: 'setTicketNft',
      args: [ticketNftAddress],
      chainId,
    });
  };

  // Transfer ownership
  const transferOwnership = (newOwner: Address) => {
    writeContract({
        address: eventTicketing as Address,
        abi: eventTicketingAbi,
      functionName: 'transferOwnership',
      args: [newOwner],
      chainId,
    });
  };

  // Update max supply
  const updateMaxSupply = (ticketId: bigint, newMaxSupply: bigint) => {
    writeContract({
        address: eventTicketing as Address,
        abi: eventTicketingAbi,
      functionName: 'updateMaxSupply',
      args: [ticketId, newMaxSupply],
      chainId,
    });
  };

  // Update ticket
  const updateTicket = (
    ticketId: bigint,
    newPrice: bigint,
    newLocation: string,
    newEventTimestamp: bigint
  ) => {
    writeContract({
        address: eventTicketing as Address,
        abi: eventTicketingAbi,
      functionName: 'updateTicket',
      args: [ticketId, newPrice, newLocation, newEventTimestamp],
      chainId,
    });
  };

  // Withdraw proceeds
  const withdrawProceeds = (ticketId: bigint) => {
    writeContract({
        address: eventTicketing as Address,
        abi: eventTicketingAbi,
      functionName: 'withdrawProceeds',
      args: [ticketId],
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
    cancelTicket,
    claimRefund,
    closeTicket,
    createTicket,
    finalizeEvent,
    register,
    renounceOwnership,
    setFeeRecipient,
    setServiceFee,
    setTicketNft,
    transferOwnership,
    updateMaxSupply,
    updateTicket,
    withdrawProceeds,
  };
};

// Usage Examples:
/*
// For getter functions
const getters = useEventTicketingGetters({
  chainId: 1, // Optional - Ethereum mainnet
});

// Use individual hooks
const { data: tickets, isLoading: ticketsLoading } = getters.useGetRecentTickets();
const { data: ticketDetails, isLoading: detailsLoading } = getters.useTickets(BigInt(1));
const { data: isAvailable } = getters.useIsAvailable(BigInt(1));

// For setter functions
const {
  createTicket,
  register,
  cancelTicket,
  isPending,
  isConfirming,
  isConfirmed,
  hash,
  error
} = useEventTicketingSetters({
  chainId: 1, // Optional
});

// Example usage
const handleCreateTicket = () => {
  createTicket(
    BigInt('1000000000000000000'), // 1 ETH in wei
    'My Event',
    'Event Description',
    BigInt(Math.floor(Date.now() / 1000) + 86400), // Tomorrow
    BigInt(100), // Max 100 tickets
    '{"image": "ipfs://..."}', // Metadata
    'Event Location'
  );
};

const handleRegister = () => {
  register(BigInt(1), BigInt('1000000000000000000')); // Register for ticket 1 with 1 ETH
};

const handleCancel = () => {
  cancelTicket(BigInt(1));
};
*/