import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { type Address, type Hash } from 'viem';
// Import your ABI and contract address
// import { TICKET_NFT_ABI, TICKET_NFT_ADDRESS } from '@/lib/contracts/ticketNft';

// import { useAccount } from 'wagmi'; // or your preferred web3 library
import { getContractAddresses, ChainId, ticketNftAbi } from '@/lib/addressAndAbi';

// // Types
// interface TicketMetadata {
//   ticketId: bigint;
//   eventName: string;
//   description: string;
//   eventTimestamp: bigint;
//   location: string;
// }

// interface UseTicketNFTGettersProps {
//   chainId?: number;
// }

// interface UseTicketNFTSettersProps {
//   chainId?: number;
// }

export function useTicketNFTGetters() {
    const { chain } = useAccount();
    const chainId = chain?.id || ChainId.CELO_SEPOLIA; // default to mainnet
  
    const { ticketNft, eventTicketing, resaleMarket } = getContractAddresses(chainId);
  
  
  

// Getter Hook
// export const useTicketNFTGetters = ({ chainId }: UseTicketNFTGettersProps = {}) => {
  // Balance of specific address
  const useBalanceOf = (owner?: Address) => {
    return useReadContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'balanceOf',
      args: owner ? [owner] : undefined,
      chainId,
      query: {
        enabled: !!owner,
      },
    });
  };

  // Get approved address for token
  const useGetApproved = (tokenId?: bigint) => {
    return useReadContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'getApproved',
      args: tokenId !== undefined ? [tokenId] : undefined,
      chainId,
      query: {
        enabled: tokenId !== undefined,
      },
    });
  };

  // Get ticket metadata
  const useGetTicketMetadata = (tokenId?: bigint) => {
    return useReadContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'getTicketMetadata',
      args: tokenId !== undefined ? [tokenId] : undefined,
      chainId,
      query: {
        enabled: tokenId !== undefined,
      },
    });
  };

  // Get image URI
  const useImageUri = () => {
    return useReadContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'imageUri',
      chainId,
    });
  };

  // Check if approved for all
  const useIsApprovedForAll = (owner?: Address, operator?: Address) => {
    return useReadContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'isApprovedForAll',
      args: owner && operator ? [owner, operator] : undefined,
      chainId,
      query: {
        enabled: !!(owner && operator),
      },
    });
  };

  // Get minter address
  const useMinter = () => {
    return useReadContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'minter',
      chainId,
    });
  };

  // Get contract name
  const useName = () => {
    return useReadContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'name',
      chainId,
    });
  };

  // Get contract owner
  const useOwner = () => {
    return useReadContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'owner',
      chainId,
    });
  };

  // Get owner of token
  const useOwnerOf = (tokenId?: bigint) => {
    return useReadContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'ownerOf',
      args: tokenId !== undefined ? [tokenId] : undefined,
      chainId,
      query: {
        enabled: tokenId !== undefined,
      },
    });
  };

  // Check interface support
  const useSupportsInterface = (interfaceId?: `0x${string}`) => {
    return useReadContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'supportsInterface',
      args: interfaceId ? [interfaceId] : undefined,
      chainId,
      query: {
        enabled: !!interfaceId,
      },
    });
  };

  // Get contract symbol
  const useSymbol = () => {
    return useReadContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'symbol',
      chainId,
    });
  };

  // Get token URI
  const useTokenURI = (tokenId?: bigint) => {
    return useReadContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'tokenURI',
      args: tokenId !== undefined ? [tokenId] : undefined,
      chainId,
      query: {
        enabled: tokenId !== undefined,
      },
    });
  };

  return {
    useBalanceOf,
    useGetApproved,
    useGetTicketMetadata,
    useImageUri,
    useIsApprovedForAll,
    useMinter,
    useName,
    useOwner,
    useOwnerOf,
    useSupportsInterface,
    useSymbol,
    useTokenURI,
  };
};

export function useTicketNFTSetters() {
    const { chain } = useAccount();
    const chainId = chain?.id || ChainId.CELO_SEPOLIA; // default to mainnet
  
    const { ticketNft, eventTicketing, resaleMarket } = getContractAddresses(chainId);

// Setter Hook
// export const useTicketNFTSetters = ({ chainId }: UseTicketNFTSettersProps = {}) => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    chainId,
  });

  // Approve function
  const approve = (to: Address, tokenId: bigint) => {
    writeContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'approve',
      args: [to, tokenId],
      chainId,
    });
  };

  // Mint for registrant
  const mintForRegistrant = (
    to: Address,
    ticketId: bigint,
    eventName: string,
    description: string,
    eventTimestamp: bigint,
    location: string
  ) => {
    writeContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'mintForRegistrant',
      args: [to, ticketId, eventName, description, eventTimestamp, location],
      chainId,
    });
  };

  // Renounce ownership
  const renounceOwnership = () => {
    writeContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'renounceOwnership',
      chainId,
    });
  };

  // Safe transfer from (3 parameters)
  const safeTransferFrom = (from: Address, to: Address, tokenId: bigint) => {
    writeContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'safeTransferFrom',
      args: [from, to, tokenId],
      chainId,
    });
  };

  // Safe transfer from with data (4 parameters)
  const safeTransferFromWithData = (from: Address, to: Address, tokenId: bigint, data: `0x${string}`) => {
    writeContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'safeTransferFrom',
      args: [from, to, tokenId, data],
      chainId,
    });
  };

  // Set approval for all
  const setApprovalForAll = (operator: Address, approved: boolean) => {
    writeContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'setApprovalForAll',
      args: [operator, approved],
      chainId,
    });
  };

  // Set image URI
  const setImageUri = (newImageUri: string) => {
    writeContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'setImageUri',
      args: [newImageUri],
      chainId,
    });
  };

  // Set minter
  const setMinter = (newMinter: Address) => {
    writeContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'setMinter',
      args: [newMinter],
      chainId,
    });
  };

  // Transfer from
  const transferFrom = (from: Address, to: Address, tokenId: bigint) => {
    writeContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
      functionName: 'transferFrom',
      args: [from, to, tokenId],
      chainId,
    });
  };

  // Transfer ownership
  const transferOwnership = (newOwner: Address) => {
    writeContract({
      address: ticketNft as Address,
      abi: ticketNftAbi,
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
    approve,
    mintForRegistrant,
    renounceOwnership,
    safeTransferFrom,
    safeTransferFromWithData,
    setApprovalForAll,
    setImageUri,
    setMinter,
    transferFrom,
    transferOwnership,
  };
};

// Usage Examples:
/*
// For getter functions
const getters = useTicketNFTGetters({
  chainId: 1, // Optional - Ethereum mainnet
});

// Use individual hooks
const { data: balance, isLoading: balanceLoading } = getters.useBalanceOf('0x...' as Address);
const { data: metadata, isLoading: metadataLoading } = getters.useGetTicketMetadata(BigInt(1));

// For setter functions
const {
  approve,
  mintForRegistrant,
  isPending,
  isConfirming,
  isConfirmed,
  hash,
  error
} = useTicketNFTSetters({
  chainId: 1, // Optional
});

// Example usage
const handleApprove = () => {
  approve('0x...' as Address, BigInt(1));
};

const handleMint = () => {
  mintForRegistrant(
    '0x...' as Address,
    BigInt(1),
    'Event Name',
    'Event Description',
    BigInt(Math.floor(Date.now() / 1000)),
    'Event Location'
  );
};
*/