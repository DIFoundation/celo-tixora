"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAccount, useWaitForTransactionReceipt } from "wagmi"
import { formatEther, parseEther } from "viem"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Ticket, Loader2, ArrowLeft, Shield, Clock, Copy, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-toastify"
import { useEventTicketingGetters, useEventTicketingSetters } from "@/hooks/useEventTicketing"
import { ChainId, CONTRACT_ADDRESSES } from "@/lib/addressAndAbi"
import { eventTicketingAddress } from "@/lib/contracts"

interface EventData {
  id: number
  creator: string
  price: string
  eventName: string
  description: string
  date: string
  location: string
  closed: boolean
  canceled: boolean
  status: 'upcoming' | 'canceled' | 'closed' | 'passed' | 'sold_out' | 'active' | 'registered'
  image: string
  maxSupply: number
  sold: number
  ticketsLeft: number
  eventTimestamp?: number
}

export default function EventDetailPage() {
  const { id: eventId } = useParams()
  const router = useRouter()
  const { isConnected, address, chainId } = useAccount()
  const [isLoading, setIsLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [events, setEvents] = useState<EventData | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const { useTickets, isRegistered, checkingRegistration, useTicketsLeft, useIsRegistered } = useEventTicketingGetters()
  const { register, isPending, isConfirming, isConfirmed, error, hash } = useEventTicketingSetters()

  // Fetch event data with proper typing
  const { data: eventData, error: contractError, refetch: refetchEvent } = useTickets(
    eventId ? BigInt(eventId as string) : undefined
  )

  // Check if user is registered for this event
  const { data: isUserRegistered, refetch: refetchRegistration } = useIsRegistered(
    eventId ? BigInt(eventId as string) : undefined,
    address
  )

  // Fetch tickets left
  const { data: ticketsLeftCount } = useTicketsLeft(
    eventId ? BigInt(eventId as string) : undefined
  )

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success(`${field} copied to clipboard!`)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const formatTimeRemaining = (timestamp: number) => {
    const eventDate = new Date(timestamp * 1000)
    const now = new Date()
    const diffMs = eventDate.getTime() - now.getTime()

    if (diffMs < 0) return "Event has passed"

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} remaining`
    } else {
      return "Starting soon"
    }
  }

  // Process event data when it's loaded
  useEffect(() => {
    const processEventData = async () => {
      if (!eventData) return

      try {
        const [
          id,
          creator,
          price,
          eventName,
          description,
          eventTimestamp,
          location,
          closed,
          canceled,
          metadata,
          maxSupply,
          sold,
          , // totalCollected
          , // totalRefunded
          proceedsWithdrawn
        ] = eventData as any[]

        // Basic validation
        if (!eventName || !description) {
          throw new Error('Incomplete event data received from contract')
        }

        // Convert timestamp to milliseconds and create Date object
        const eventDate = new Date(Number(eventTimestamp) * 1000)
        const now = new Date()
        const isPassed = eventDate < now
        const availableTickets = Number(maxSupply) - Number(sold)

        // Format the date for display
        let formattedDate = 'Date not available'
        try {
          if (!isNaN(eventDate.getTime())) {
            formattedDate = format(eventDate, 'PPPppp')
          }
        } catch (err) {
          console.error('Error formatting date:', err)
        }

        // Determine status with more granularity
        let status: EventData['status'] = 'upcoming'

        if (canceled) {
          status = 'canceled'
        } else if (closed) {
          status = 'closed'
        } else if (isPassed) {
          status = 'passed'
        } else if (availableTickets <= 0) {
          status = 'sold_out'
        } else if (isUserRegistered) {
          status = 'registered'
        } else {
          status = 'active'
        }

        // Parse metadata if it exists (assuming it's a JSON string)
        let imageUrl = "/metaverse-fashion-show.png"
        try {
          if (metadata) {
            const meta = JSON.parse(metadata)
            if (meta.image) imageUrl = meta.image
          }
        } catch (e) {
          console.error('Error parsing metadata:', e)
        }

        setEvents({
          id: Number(id),
          creator,
          price: formatEther(price),
          eventName,
          description,
          date: formattedDate,
          location,
          closed,
          canceled,
          status,
          image: imageUrl,
          maxSupply: Number(maxSupply),
          sold: Number(sold),
          ticketsLeft: availableTickets,
          eventTimestamp: Number(eventTimestamp)
        })

        setFetchError(null)
      } catch (err) {
        console.error('Error processing event data:', err)
        setFetchError('Failed to load event data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    processEventData()
  }, [eventData, isUserRegistered])

  // Handle contract errors
  useEffect(() => {
    if (contractError) {
      console.error('Contract error:', contractError)
      setFetchError('Failed to fetch event data from the blockchain.')
      setIsLoading(false)
    }
  }, [contractError])

  // Handle wallet connection and redirect if needed
  useEffect(() => {
    if (!isConnected) {
      router.push('/')
      return
    }

    // Refetch data when wallet connects or changes
    if (eventId && isConnected) {
      refetchEvent()
      refetchRegistration()
    }
  }, [isConnected, eventId, refetchEvent, refetchRegistration, router])

  const handleBuyTicket = async () => {
    if (!events) {
      toast.error("❗ Event data not available")
      return
    }

    if (!isConnected || !address) {
      toast.error("🔗 Please connect your wallet first")
      return
    }

    // Additional validations
    if (events.status === 'canceled') {
      toast.error("❌ This event has been canceled")
      return
    }

    if (events.status === 'closed' || events.closed) {
      toast.error("❌ Ticket sales are closed for this event")
      return
    }

    if (events.sold >= events.maxSupply) {
      toast.error("❌ Sorry, this event is sold out")
      return
    }

    const eventDate = new Date(events.date)
    if (eventDate <= new Date()) {
      toast.error("❌ This event has already started or ended")
      return
    }

    setPurchasing(true)

    const loadingToast = toast.loading("🔄 Processing your purchase...")

    try {
      toast.info(`🎫 Preparing to purchase ticket for "${events.eventName}"...`)

      // Convert price from ETH to Wei for the contract call
      const priceInWei = parseEther(events.price)

      // Call the register function
      await register(BigInt(events.id), priceInWei)

      toast.dismiss(loadingToast)
      toast.success("✅ Transaction submitted! Waiting for confirmation...")
    } catch (error: any) {
      console.error("Purchase error:", error)

      // Handle specific error cases
      if (error.message?.includes("AlreadyRegistered")) {
        toast.error("❌ You've already registered for this event")
      } else if (error.message?.includes("InsufficientFunds")) {
        toast.error("❌ Insufficient funds for ticket purchase")
      } else if (error.message?.includes("User rejected the request")) {
        toast.error("❌ Transaction was rejected")
      } else if (error.message?.includes("InvalidPaymentAmount")) {
        toast.error("❌ Incorrect payment amount. Please try again.")
      } else if (error.message?.includes("EventCanceled")) {
        toast.error("❌ This event has been canceled")
      } else if (error.message?.includes("EventClosed")) {
        toast.error("❌ Ticket sales are closed for this event")
      } else if (error.message?.includes("SoldOut")) {
        toast.error("❌ Sorry, this event is now sold out")
      } else if (error.message?.includes("EventStarted")) {
        toast.error("❌ This event has already started")
      } else {
        toast.error("❌ Failed to purchase ticket. Please try again.")
      }
    } finally {
      setPurchasing(false)
    }
  }

  // Handle transaction states with toast notifications
  useEffect(() => {
    if (isPending) {
      toast.info("📤 Transaction submitted! Waiting for confirmation...")
    }
  }, [isPending])

  useEffect(() => {
    if (isConfirming) {
      toast.info("⏳ Transaction confirmed! Processing on blockchain...")
    }
  }, [isConfirming])

  useEffect(() => {
    if (isConfirmed && purchasing) {
      setPurchasing(false)
      toast.success("🎉 Ticket purchased successfully! Your NFT ticket has been minted.")
      // Redirect to tickets page after a short delay
      setTimeout(() => {
        router.push("/tickets")
      }, 2000)
    }
  }, [isConfirmed, purchasing, router])

  useEffect(() => {
    if (error) {
      console.error("Write contract error:", error)
      setPurchasing(false)

      // Check for specific error types with enhanced messages
      if (error.message.includes("insufficient funds")) {
        toast.error("💰 Insufficient funds for transaction. Please check your balance.")
      } else if (error.message.includes("rejected")) {
        toast.error("❌ Transaction was rejected by user.")
      } else if (error.message.includes("network")) {
        toast.error("🌐 Network error. Please check your connection.")
      } else if (error.message.includes("reverted")) {
        toast.error("⚠️ Transaction failed: Execution reverted.")
      } else if (error.message.includes("RPC")) {
        toast.error("🔄 Transaction failed: Internal JSON-RPC error. Please try again.")
      } else {
        toast.error(`❗ Transaction failed: ${error.message.slice(0, 100)}...`)
      }
    }
  }, [error])

  const isProcessing = purchasing || isPending || isConfirming
  const isCorrectNetwork = chainId === ChainId.CELO_SEPOLIA || chainId === ChainId.CELO_MAINNET || chainId === ChainId.CELO_ALFAJORES

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-800/50 rounded-xl border border-purple-500/30 backdrop-blur-sm max-w-md mx-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Wallet Not Connected</h2>
          <p className="text-slate-300 mb-4">Please connect your wallet to view event details and purchase tickets.</p>
          <Button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
          >
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-slate-300">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-800/50 rounded-xl border border-purple-500/30 backdrop-blur-sm max-w-md mx-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load Event</h2>
          <p className="text-slate-300 mb-4">{fetchError}</p>
          <Button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
          >
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto py-4">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-2 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        <div className="grid lg:grid-cols-3 gap-8 mb-4">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative overflow-hidden rounded-xl">
              <Image
                src={imageError ? '/metaverse-fashion-show.png' : events?.image || '/metaverse-fashion-show.png'}
                alt={events?.eventName || 'Event Image'}
                width={800}
                height={450}
                className="w-full h-56 object-cover transition-transform duration-300 hover:scale-105"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {events?.status === 'canceled' && (
                  <Badge className="bg-red-500/90 text-white backdrop-blur-sm">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Canceled
                  </Badge>
                )}
                {events?.status === 'closed' && (
                  <Badge className="bg-gray-500/90 text-white backdrop-blur-sm">
                    Closed
                  </Badge>
                )}
                {events?.status === 'sold_out' && (
                  <Badge className="bg-orange-500/90 text-white backdrop-blur-sm">
                    Sold Out
                  </Badge>
                )}
                {events?.status === 'passed' && (
                  <Badge className="bg-gray-500/90 text-white backdrop-blur-sm">
                    Event Ended
                  </Badge>
                )}
                {events?.status === 'active' && events?.ticketsLeft > 0 && (
                  <Badge className={`backdrop-blur-sm ${events?.ticketsLeft <= 10 ? 'bg-red-500/90 animate-pulse' : 'bg-purple-500/90'} text-white`}>
                    {events?.ticketsLeft} {events?.ticketsLeft === 1 ? 'ticket' : 'tickets'} left
                  </Badge>
                )}
              </div>

              {/* Time remaining indicator */}
              {events?.eventTimestamp && events.status === 'active' && (
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-green-500/90 text-white backdrop-blur-sm">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeRemaining(events.eventTimestamp)}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight">
                  {events?.eventName}
                </h1>

                <div className="mb-2 text-slate-300">
                  <div className="flex items-center gap-1 bg-slate-800/30 rounded-lg px-4 py-2 mb-2 w-full">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="text-xs">{events?.date}</span>
                  </div>
                  <div className="flex flex-row justify-between w-full gap-3">
                    <div className="flex items-center gap-1 bg-slate-800/30 rounded-lg px-4 py-2 w-full">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-xs">{events?.location}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-800/30 rounded-lg px-4 py-2 w-full">
                      <Users className="w-4 h-4 text-green-400" />
                      <span className="text-xs">{events?.sold} attending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm -p-2 -space-y-2">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-purple-400" />
                  About this event
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {events?.description || "No description available for this event."}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm -p-2 -space-y-2">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  Event Organizer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-2 bg-slate-800/30 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {events?.creator?.slice(2, 4).toUpperCase() || '??'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white text-xs">Event Creator</p>
                    <p className="text-xs text-slate-400 font-mono break-all">
                      {events?.creator || 'Unknown creator'}
                    </p>
                  </div>
                  {/* <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge> */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ticket Purchase */}
        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-400" />
                Get Your Ticket
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                  <div>
                    <p className="text-slate-300 text-xs">Price per ticket</p>
                    <p className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      {events?.price} CELO
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-300 text-xs">Available</p>
                    <p className="text-white font-medium text-base">
                      {events?.ticketsLeft} / {events?.maxSupply}
                    </p>
                    <div className="w-16 h-2 bg-slate-700 rounded-full mt-1 right-0">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                        style={{
                          width: `${events?.maxSupply ? (events.sold / events.maxSupply) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {!isCorrectNetwork && (
                  <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Please switch to Celo Sepolia testnet
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-700">
                  <Button
                    onClick={handleBuyTicket}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-10 text-sm transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 rounded-md"
                    disabled={!isCorrectNetwork || events?.status === 'canceled' || events?.status === 'closed' || events?.ticketsLeft === 0 || events?.status === 'passed' || events?.status === 'registered' || isProcessing || checkingRegistration}
                  >
                    {checkingRegistration ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking registration...
                      </>
                    ) : isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : purchasing ? 'Preparing...' : 'Processing...'}
                      </>
                    ) : (
                      events?.status === 'registered' || isRegistered ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Already Registered
                        </>
                      ) : events?.status === 'canceled' ? 'Event Canceled' : events?.status === 'closed' ? 'Sales Ended' : events?.status === 'sold_out' ? 'Sold Out' : events?.status === 'passed' ? 'Event Ended' : events?.status === 'active' ? (
                        <>
                          <Ticket className="w-4 h-4 mr-2" />
                          Buy Ticket Now
                        </>
                      ) : 'Event Canceled'
                    )}
                  </Button>

                  {events?.ticketsLeft && events.ticketsLeft < 10 && events.status === 'active' && (
                    <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-xs text-amber-400 text-center flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Only {events.ticketsLeft} {events.ticketsLeft === 1 ? 'ticket' : 'tickets'} left!
                      </p>
                    </div>
                  )}

                  {/* Transaction Status Indicator */}
                  {isProcessing && (
                    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-3 h-3 animate-spin text-purple-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-slate-300 text-xs font-medium">
                            {isPending ? 'Waiting for wallet confirmation...' : isConfirming ? 'Transaction confirmed! Processing on blockchain...' : purchasing ? 'Preparing transaction...' : 'Processing...'}
                          </p>
                          {hash && (
                            <p className="text-xs text-slate-400 mt-1 font-mono">
                              Tx: {hash.slice(0, 10)}...{hash.slice(-8)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-blue-400" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-slate-400 text-xs mb-1">Event ID</p>
                <p className="text-white font-mono text-xs">{events?.id}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Contract Address</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-mono text-xs break-all flex-1">
                    {eventTicketingAddress}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(eventTicketingAddress, 'Contract Address')}
                    className="p-1 h-auto text-slate-400 hover:text-white"
                  >
                    {copiedField === 'Contract Address' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              {events?.creator && (
                <div>
                  <p className="text-slate-400 text-xs mb-1">Creator Address</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-mono text-xs break-all flex-1">
                      {events.creator}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(events.creator, 'Creator Address')}
                      className="p-1 h-auto text-slate-400 hover:text-white"
                    >
                      {copiedField === 'Creator Address' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}