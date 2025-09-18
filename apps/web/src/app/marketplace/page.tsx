"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAccount } from 'wagmi'
import { Search, Filter, TrendingUp, Clock, Calendar, MapPin, Users, Tag, Sparkles, AlertCircle } from "lucide-react"
import { useEventTicketingGetters } from "../../hooks/useEventTicketing"
import { formatEther } from "viem"
import { EventCard } from "@/components/event-card"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

interface TicketData {
  id: number
  creator: string
  price: bigint
  eventName: string
  description: string
  eventTimestamp: bigint
  location: string
  closed: boolean
  canceled: boolean
  metadata: string
  maxSupply: bigint
  sold: bigint
  totalCollected: bigint
  totalRefunded: bigint
  proceedsWithdrawn: boolean
}

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

export default function Marketplace() {
  const router = useRouter()
  const { address, isConnected, chainId } = useAccount()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("trending")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [events, setEvents] = useState<MarketplaceEvent[]>([])
  const [loading, setLoading] = useState(true)

  const { useGetTotalTickets, useGetRecentTickets } = useEventTicketingGetters()
  
  // Check if user is on the correct network
  const isCorrectNetwork = chainId === 11142220 // Celo Sepolia testnet

  // Read contract data
  const { data: totalTickets, error: totalTicketsError } = useGetTotalTickets()

  const { data: recentTickets, error: recentTicketsError } = useGetRecentTickets()

  // Handle contract errors
  useEffect(() => {
    if (totalTicketsError) {
      toast.error(`Failed to load tickets: ${totalTicketsError.message}`)
      console.error('Total tickets error:', totalTicketsError)
    }
  }, [totalTicketsError])

  // Transform blockchain data to marketplace format
  useEffect(() => {
    if (recentTickets && Array.isArray(recentTickets)) {
      const transformedEvents: MarketplaceEvent[] = recentTickets.map((ticket: TicketData, index: number) => {
        const eventDate = new Date(Number(ticket.eventTimestamp) * 1000)
        const now = new Date()
        const isUpcoming = eventDate > now
        const isPassed = eventDate < now
        const isCanceled = ticket.canceled
        const isClosed = ticket.closed
        const ticketsLeft = Number(ticket.maxSupply - ticket.sold)
        
        let status = "upcoming"
        if (isCanceled) status = "canceled"
        else if (isClosed) status = "closed"
        else if (isPassed) status = "passed"
        else if (ticketsLeft === 0) status = "sold_out"

        // Parse metadata for additional info
        let category = "Event"
        let image = "/placeholder.svg"
        try {
          if (ticket.metadata) {
            const metadata = JSON.parse(ticket.metadata)
            category = metadata.category || "Event"
            image = metadata.image || "/placeholder.svg"
          }
        } catch (e) {
          console.log("Could not parse metadata")
        }

        return {
          id: Number(ticket.id),
          eventTitle: ticket.eventName,
          price: `${formatEther(ticket.price)} CELO`,
          date: eventDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          location: ticket.location,
          image: image,
          attendees: Number(ticket.maxSupply),
          ticketsLeft: ticketsLeft,
          status: status,
          category: category,
          trending: ticket.sold > (ticket.maxSupply * BigInt(7)) / BigInt(10), // Trending if 70% sold
          createdAt: eventDate.toISOString(),
          originalPrice: ticket.price,
        }
      })

      setEvents(transformedEvents)
      setLoading(false)
    }
  }, [recentTickets])

  // Redirect to landing page if wallet is not connected
  if (!isConnected) {
    toast.error("Please connect your wallet to access the marketplace")
    router.push("/")
    return null
  }

  const getEventsByTab = () => {
    let filteredEvents = events

    switch (activeTab) {
      case "upcoming":
        filteredEvents = events.filter(event => event.status === "upcoming")
        break
      case "passed":
        filteredEvents = events.filter(event => event.status === "passed")
        break
      case "canceled":
        filteredEvents = events.filter(event => event.status === "canceled")
        break
      case "closed":
        filteredEvents = events.filter(event => event.status === "closed" || event.status === "sold_out")
        break
      default:
        filteredEvents = events.filter(event => event.status === "upcoming")
    }

    // Apply search filter
    if (searchTerm) {
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    if (sortBy === "recent") {
      filteredEvents = [...filteredEvents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === "trending") {
      filteredEvents = [...filteredEvents].sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0))
    }

    return filteredEvents
  }

  const getTabCount = (tab: string) => {
    switch (tab) {
      case "upcoming":
        return events.filter(event => event.status === "upcoming").length
      case "passed":
        return events.filter(event => event.status === "passed").length
      case "canceled":
        return events.filter(event => event.status === "canceled").length
      case "closed":
        return events.filter(event => event.status === "closed" || event.status === "sold_out").length
      default:
        return 0
    }
  }

  const filteredEvents = getEventsByTab()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 text-foreground">
      <div className="pb-8 pt-4">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold mb-4">
              Event{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Marketplace
              </span>
            </h1>
            <p className="text-md text-slate-300 mx-auto leading-relaxed">
              Discover amazing events and secure your NFT tickets on the blockchain. 
              All transactions are verified, fraud-proof, and powered by smart contracts.
            </p>
          </div>

          {/* Network Warning */}
          {!isCorrectNetwork && (
            <div className="mb-4">
              <Card className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-orange-500/50">
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    <div>
                      <p className="text-orange-200 font-medium">Wrong Network</p>
                      <p className="text-orange-300 text-sm">Please switch to Celo Sepolia testnet to interact with events.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-4">
            <div className="flex flex-col xl:flex-row gap-3">
              {/* Search Bar */}
              <div className="flex-1 w-full">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-slate-400 w-4 h-4 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    placeholder="Search events by name, location, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-sm px-4 rounded-md h-10 pl-12 bg-slate-800/50 border-slate-600 focus:border-purple-400 focus:ring-purple-400/20 text-white backdrop-blur-sm"
                  />
                  {searchTerm && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {filteredEvents.length} results
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Sort Buttons */}
              <div className="flex flex-row gap-3 justify-between w-full">
                <Button
                  variant={sortBy === "trending" ? "default" : "outline"}
                  onClick={() => setSortBy("trending")}
                  className={`text-sm px-4 rounded-md h-10 transition-all duration-200 w-full ${
                    sortBy === "trending"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg"
                      : "border-slate-600 text-slate-300 hover:border-purple-500 hover:text-white"
                  }`}
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Trending
                </Button>
                <Button
                  variant={sortBy === "recent" ? "default" : "outline"}
                  onClick={() => setSortBy("recent")}
                  className={`text-sm px-4 rounded-md h-10 transition-all duration-200 w-full ${
                    sortBy === "recent"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg"
                      : "border-slate-600 text-slate-300 hover:border-blue-500 hover:text-white"
                  }`}
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Recent
                </Button>
              </div>
            </div>
          </div>

          {/* Event Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-2 border border-slate-600/50 shadow-xl w-full">
              <div className="flex flex-row justify-between w-full">
                {[
                  { key: "upcoming", label: "Upcoming", color: "purple" },
                  { key: "passed", label: "Passed", color: "green" },
                  { key: "canceled", label: "Canceled", color: "red" },
                  { key: "closed", label: "Closed", color: "gray" }
                ].map((tab) => {
                  const count = getTabCount(tab.key)
                  const isActive = activeTab === tab.key
                  return (
                    <Button
                      key={tab.key}
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => setActiveTab(tab.key)}
                      className={`h-8 px-1 transition-all duration-200 w-full text-xs ${
                        isActive
                          ? `bg-gradient-to-r ${
                              tab.color === "purple" ? "from-purple-600 to-pink-600" :
                              tab.color === "green" ? "from-green-600 to-emerald-600" :
                              tab.color === "red" ? "from-red-600 to-pink-600" :
                              "from-gray-600 to-slate-600"
                            } shadow-lg`
                          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      }`}
                    >
                      {tab.label}
                      {count > 0 && (
                        <Badge 
                          variant="secondary" 
                          className={`ml-0.5 text-xs ${
                            isActive 
                              ? "bg-white/20 text-white" 
                              : "bg-slate-600/50 text-slate-300"
                          }`}
                        >
                          {count}
                        </Badge>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center p-6">
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm max-w-md mx-auto">
                <CardContent className="p-6">
                  <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-white mb-2">Loading Events</h3>
                  <p className="text-slate-300">Fetching latest events from the blockchain...</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Events Grid */}
          {!loading && filteredEvents.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-white">
                  {activeTab === "upcoming" && "Upcoming Events"}
                  {activeTab === "passed" && "Past Events"} 
                  {activeTab === "canceled" && "Canceled Events"}
                  {activeTab === "closed" && "Closed Events"}
                  {searchTerm && (
                    <span className="text-purple-400 ml-2">
                      matching &quot;{searchTerm}&quot;
                    </span>
                  )}
                </h2>
                <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                  {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredEvents.length === 0 && (
            <div className="text-center py-20">
              <div className="mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">No Events Found</h3>
                <p className="text-xl text-slate-400 max-w-md mx-auto">
                  {searchTerm 
                    ? `No events match your search for "${searchTerm}"`
                    : `No ${activeTab} events are currently available`
                  }
                </p>
              </div>
              
              {searchTerm && (
                <Button
                  onClick={() => setSearchTerm("")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  Clear Search
                </Button>
              )}
              
              {!searchTerm && events.length === 0 && (
                <Card className="bg-slate-800/30 border-slate-600/50 max-w-lg mx-auto mt-8">
                  <CardContent className="p-6">
                    <p className="text-slate-400 mb-4">Be the first to create an event!</p>
                    <Button
                      onClick={() => router.push("/create-event")}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                    >
                      Create Event
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Platform Stats */}
          {!loading && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-slate-800/60 to-purple-900/30 border-purple-500/30 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    {totalTickets ? Number(totalTickets) : 0}
                  </div>
                  <div className="text-slate-400 font-medium">Total Events Created</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/60 to-green-900/30 border-green-500/30 backdrop-blur-sm hover:border-green-400/50 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                    {events.filter(e => e.status === "upcoming").length}
                  </div>
                  <div className="text-slate-400 font-medium">Active Events</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/60 to-blue-900/30 border-blue-500/30 backdrop-blur-sm hover:border-blue-400/50 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    {events.reduce((sum, e) => sum + e.attendees, 0).toLocaleString()}
                  </div>
                  <div className="text-slate-400 font-medium">Total Capacity</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/60 to-yellow-900/30 border-yellow-500/30 backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                    Zero
                  </div>
                  <div className="text-slate-400 font-medium">Fraud Cases</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}