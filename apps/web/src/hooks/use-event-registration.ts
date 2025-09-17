import { useReadContract } from 'wagmi'
import { eventTicketingAbi, eventTicketingAddress } from '@/lib/addressAndAbi'

export function useEventRegistration(eventId: number, userAddress?: string) {
  const { data: isRegistered, isLoading, error } = useReadContract({
    address: eventTicketingAddress,
    abi: eventTicketingAbi,
    functionName: 'isRegistered',
    args: userAddress ? [BigInt(eventId), userAddress] : undefined,
    query: {
      enabled: !!userAddress && eventId >= 0,
    },
  })

  return {
    isRegistered: isRegistered || false,
    isLoading,
    error,
  }
}
