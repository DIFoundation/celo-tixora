import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Ticket, Loader2, Clock } from "lucide-react"
import Image from "next/image"
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { eventTicketingAbi, eventTicketingAddress } from "@/lib/addressAndAbi"
import { useEventRegistration } from "@/hooks/use-event-registration"
import { useAccount } from "wagmi"
import { toast } from "react-toastify"

interface MarketplaceEvent {
  id: number
  eventTitle: string
  price: string
  date: string
  location: string
  image: string
  attendees: number
  ticketsLeft: number
  status: string
  category: string
  trending: boolean
  createdAt: string
  originalPrice: bigint
}

interface EventCardProps {
  event: MarketplaceEvent
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter()
  const { writeContract, isPending, data: hash , error: writeError} = useWriteContract()
  const [purchasing, setPurchasing] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { address, isConnected, chainId } = useAccount()
  
  const { isRegistered, isLoading: checkingRegistration } = useEventRegistration(event.id, address)
  
  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  })

  const getStatusBadge = (event: MarketplaceEvent) => {
    if (event.status === "passed") {
      return <Badge className="bg-gray-500 text-white">Passed</Badge>
    }
    if (event.status === "canceled") {
      return <Badge className="bg-red-500 text-white">Canceled</Badge>
    }
    if (event.status === "closed" || event.status === "sold_out") {
      return <Badge className="bg-orange-500 text-white">Sold Out</Badge>
    }
    
    // Add urgency indicator for low ticket counts
    if (event.ticketsLeft <= 5) {
      return <Badge className="bg-red-500 text-white animate-pulse">{event.ticketsLeft} left</Badge>
    }
    
    return <Badge className="bg-purple-500 text-white">{event.ticketsLeft} left</Badge>
  }

  const handlePurchaseTicket = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click navigation
    
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (event.ticketsLeft === 0) {
      toast.error("Sorry, this event is sold out!")
      return
    }

    if (isRegistered) {
      toast.info("You are already registered for this event!")
      return
    }

    setPurchasing(true)

    try {
      // Check if user has enough balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      })
      
      const requiredAmount = event.originalPrice
      const userBalance = BigInt(balance)
      
      if (userBalance < requiredAmount) {
        toast.error(`Insufficient balance. You need ${event.price} CELO to purchase this ticket.`)
        setPurchasing(false)
        return
      }

      toast.info(`Purchasing ticket for "${event.eventTitle}", click Confirm in your wallet to approve the transaction...`)
      // Call the smart contract to register for the event
      try {
        const result = writeContract({
          address: eventTicketingAddress,
          abi: eventTicketingAbi,
          functionName: 'register',
          args: [BigInt(event.id)],
          value: event.originalPrice,
        })
        
        console.log('Write contract result:', result)
      } catch (contractError) {
        console.error('Contract call error:', contractError)
        toast.error(`Contract call failed`)
        setPurchasing(false)
      }

    } catch (error) {
      console.error("Purchase error:", error)
      toast.error("Transaction failed. Please check your wallet and try again.")
      setPurchasing(false)
    }
  }

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && purchasing) {
      setPurchasing(false)
      toast.success("🎉 Ticket purchased successfully! Welcome to the event!")
      // Small delay before refresh to show success message
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  }, [isSuccess, purchasing])

  // Handle write contract errors
  useEffect(() => {
    if (writeError) {
      console.error("Write contract error:", writeError)
      setPurchasing(false)
      
      // Check for specific error types
      if (writeError.message.includes("insufficient funds")) {
        toast.error("💰 Insufficient funds for transaction. Please check your balance.")
      } else if (writeError.message.includes("rejected")) {
        toast.error("❌ Transaction was rejected by user.")
      } else if (writeError.message.includes("network")) {
        toast.error("🌐 Network error. Please check your connection.")
      } else if (writeError.message.includes("reverted")) {
        toast.error("⚠️ Transaction failed: Execution reverted.")
      } else if (writeError.message.includes("RPC")) {
        toast.error("🔄 Transaction failed: Internal JSON-RPC error. Please try again.")
      } else {
        toast.error(`❗ Transaction failed: ${writeError.message.slice(0, 100)}...`)
      }
    }
  }, [writeError])

  // Handle transaction receipt errors
  useEffect(() => {
    if (receiptError) {
      console.error("Transaction receipt error:", receiptError)
      setPurchasing(false)
      toast.error(`❗ Transaction failed: ${receiptError.message}`)
    }
  }, [receiptError])

  // Check if user is on the correct network
  const isCorrectNetwork = chainId === 11142220 // Celo Sepolia testnet

  const isProcessing = purchasing || isPending || isConfirming

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on the button or its children
    if ((e.target as HTMLElement).closest('button, a, [role="button"]')) {
      return;
    }
    router.push(`/marketplace/${event.id}`)
  }

  const handleNetworkSwitch = (e: React.MouseEvent) => {
    e.stopPropagation()
    toast.error("⚠️ Please switch to Celo Sepolia testnet (Chain ID: 11142220) to purchase tickets")
  }

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = date.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return "Today"
      } else if (diffDays === 1) {
        return "Tomorrow"
      } else if (diffDays > 0 && diffDays <= 7) {
        return `In ${diffDays} days`
      }
      return dateString
    } catch {
      return dateString
    }
  }

  return (
    <Card 
      onClick={handleCardClick}
      className="group cursor-pointer bg-slate-800/50 border-slate-700 hover:border-purple-500/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10"
    >
      <CardContent className="p-0 h-full flex flex-col">
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <Image
            src={imageError ? "/tixora-logo.png" : event.image || "/tixora-logo.png"}
            alt={event.eventTitle}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <Badge className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm border border-blue-500/50">
            {event.category}
          </Badge>
          
          <div className="absolute top-3 right-3">
            {getStatusBadge(event)}
          </div>
          
          {event.trending && (
            <Badge className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse">
              🔥 Trending
            </Badge>
          )}
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold mb-3 text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
            {event.eventTitle}
          </h3>

          <div className="space-y-2 text-xs text-slate-400 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-purple-400 flex-shrink-0" />
              <span className="truncate">{formatEventDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-blue-400 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-purple-400 flex-shrink-0" />
              <span>{event.attendees.toLocaleString()} attendees</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-700/50">
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {event.price}
            </span>
            
            {event.status === "upcoming" && event.ticketsLeft > 0 ? (
              checkingRegistration ? (
                <Button className="bg-slate-600 text-slate-300" disabled size="sm">
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Checking...
                </Button>
              ) : isRegistered ? (
                <Button className="bg-green-600 hover:bg-green-700 text-white" disabled size="sm">
                  <Ticket className="h-3 w-3 mr-1" />
                  Registered
                </Button>
              ) : !isCorrectNetwork ? (
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleNetworkSwitch}
                  size="sm"
                >
                  Wrong Network
                </Button>
              ) : (
                <Button
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
                  onClick={handlePurchaseTicket}
                  disabled={isProcessing}
                  size="sm"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      {isConfirming ? "Confirming..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      <Ticket className="h-3 w-3 mr-1" />
                      Buy Now
                    </>
                  )}
                </Button>
              )
            ) : (
              <Button
                className="bg-slate-600 text-slate-300 cursor-not-allowed"
                disabled
                size="sm"
              >
                <Ticket className="h-3 w-3 mr-1" />
                {event.status === "passed" ? "Event Ended" : 
                 event.status === "canceled" ? "Canceled" : 
                 event.status === "closed" || event.status === "sold_out" ? "Sold Out" : "Unavailable"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}