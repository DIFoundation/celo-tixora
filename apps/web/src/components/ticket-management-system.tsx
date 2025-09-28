"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar, QrCode, Send, ExternalLink, Copy, Search, MoreVertical, Download, Eye, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { useAccount } from 'wagmi'
import { useEventTicketingGetters, useEventTicketingSetters } from "@/hooks/useEventTicketing"
import { useTicketNFTGetters } from "@/hooks/useNFTTicket"
import Link from "next/link"
import { formatEther } from 'viem'

interface NFTTicketDisplay {
  id: string
  tokenId: bigint
  eventTitle: string
  eventTimestamp: number
  location: string
  status: 'upcoming' | 'past'
  qrCode: string
  price: string
  purchaseDate: string
  txHash: string
}

type TicketAction = "view" | "transfer" | "qr" | null

export function TicketManagementSystem() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<NFTTicketDisplay | null>(null)
  const [currentAction, setCurrentAction] = useState<TicketAction>(null)
  const [transferAddress, setTransferAddress] = useState("")
  const { isConnected, address } = useAccount()
  const { useGetRecentTickets } = useEventTicketingGetters()
  const { isConfirmed } = useEventTicketingSetters()
  const { useBalanceOf, useGetTicketMetadata } = useTicketNFTGetters()

  // Get the number of tickets owned by the user
  const { data: balance = 0n } = useBalanceOf(address)
  
  // Generate an array of token IDs to fetch metadata for
  const tokenIds = useMemo(() => {
    if (!balance) return []
    return Array(Number(balance)).fill(0).map((_, i) => BigInt(i + 1))
  }, [balance])

  // Get metadata for each token ID
  const { data: ticketsData = [] } = useGetTicketMetadata(tokenIds)

  // Transform the tickets data into the expected format
  const userTickets = useMemo(() => {
    if (!ticketsData || !Array.isArray(ticketsData)) return []
    
    return ticketsData
      .filter(ticket => ticket && ticket.registered) // Filter out invalid tickets
      .map((ticket, index) => {
        const now = Math.floor(Date.now() / 1000)
        const isPast = Number(ticket.eventTimestamp) < now
        
        return {
          id: ticket.tokenId.toString(),
          tokenId: BigInt(ticket.tokenId),
          eventTitle: ticket.eventName || `Event #${ticket.tokenId}`,
          eventTimestamp: Number(ticket.eventTimestamp) || 0,
          location: ticket.location || 'Location not specified',
          status: isPast ? "past" as const : "upcoming" as const,
          qrCode: ticket.tokenId.toString(),
          price: ticket.price ? `${formatEther(ticket.price)} CELO` : '0 CELO',
          purchaseDate: ticket.purchaseDate || new Date().toISOString(),
          txHash: ticket.txHash || `0x${ticket.tokenId.toString().padStart(64, '0')}`
        } satisfies NFTTicketDisplay
      })
  }, [ticketsData])

  // Handle transfer completion
  useEffect(() => {
    if (isConfirmed) {
      setCurrentAction(null)
      setTransferAddress("")
      // Optionally refresh the tickets list here
    }
  }, [isConfirmed])

  const categories = ["all", "upcoming", "past"]

  const filteredTickets = userTickets.filter((ticket) => {
    const matchesSearch = ticket.eventTitle.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "upcoming" && ticket.status === "upcoming") ||
      (selectedCategory === "past" && ticket.status === "past")

    return matchesSearch && matchesCategory
  })

  const handleTicketAction = (ticket: NFTTicketDisplay, action: TicketAction) => {
    setSelectedTicket(ticket)
    setCurrentAction(action)
  }

  const handleTransfer = async () => {
    if (!selectedTicket || !transferAddress || !address) return

    try {
      await transferTicket(address, transferAddress as `0x${string}`, BigInt(selectedTicket.tokenId))
      setCurrentAction(null)
      setTransferAddress("")
    } catch (error) {
      console.error('Transfer failed:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-green-500 text-white"
      case "past":
        return "bg-gray-500 text-white"
      default:
        return "bg-purple-500 text-white"
    }
  }

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""

  const handleRefresh = async () => {
    // Implement refresh logic if needed, or remove this function if not used
  }

  return (
    <div className="min-h-screen bg-slate-800 text-foreground">

      <div className="container mx-auto py-8 pt-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Tickets
            </h1>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
              title="Refresh tickets"
            >
              <RefreshCw className="h-4 w-4 text-purple-400" />
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{userTickets.length}</p>
                    <p className="text-sm text-slate-400">Total Tickets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">
                      {userTickets.filter((t: NFTTicketDisplay) => t.status === "upcoming").length}
                    </p>
                    <p className="text-sm text-slate-400">Upcoming Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{userTickets.length}</p>
                    <p className="text-sm text-slate-400">Transferable</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search tickets by event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-10 bg-slate-800/50 border-slate-700 focus:border-purple-500 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className={` h-10
                  ${selectedCategory === "all"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "border-slate-600 text-slate-600 hover:border-purple-500"
                  }
                `}
              >
                All
              </Button>
              <Button
                variant={selectedCategory === "upcoming" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("upcoming")}
                className={` w-full h-10
                  ${selectedCategory === "upcoming"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "border-slate-600 text-slate-600 hover:border-purple-500"
                  }
                `}
              >
                Upcoming
              </Button>
              <Button
                variant={selectedCategory === "past" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("past")}
                className={`w-full h-10
                  ${selectedCategory === "past"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "border-slate-600 text-slate-600 hover:border-purple-500"
                  }
                `}
              >
                Past
              </Button>
            </div>
          </div>

          {/* Tickets Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="overflow-hidden bg-slate-800/50 border-slate-700 hover:border-purple-500/50"
              >
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-purple-400" />
                  </div>
                  <Badge className={`absolute top-3 right-3 ${getStatusColor(ticket.status)}`}>
                    {ticket.status === "upcoming" ? "Valid" : "Used"}
                  </Badge>
                  <div className="absolute bottom-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" className="bg-slate-700 hover:bg-slate-600">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem onClick={() => handleTicketAction(ticket, "view")}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTicketAction(ticket, "qr")}>
                          <QrCode className="w-4 h-4 mr-2" />
                          Show QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTicketAction(ticket, "transfer")}>
                          <Send className="w-4 h-4 mr-2" />
                          Transfer Ticket
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => window.open(`https://celoscan.io/tx/${ticket.txHash}`, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on Celoscan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2 text-white">{ticket.eventTitle}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date(ticket.purchaseDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs text-slate-400">Ticket ID</p>
                      <p className="font-mono text-sm text-purple-300">#{ticket.qrCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Paid</p>
                      <p className="font-medium text-purple-400">{ticket.price}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-8">
              <QrCode className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">No Tickets Found</h3>
              <p className="text-slate-400 mb-2 text-md">
                {searchQuery || selectedCategory !== "all"
                  ? "No tickets match your current filters."
                  : "You don't have any tickets yet. Visit the marketplace to purchase some!"}
              </p>
              <Link href="/marketplace">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  {searchQuery || selectedCategory !== "all" ? "Clear Filters" : "Discover Events"}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details Dialog */}
      <Dialog open={currentAction === "view"} onOpenChange={() => setCurrentAction(null)}>
        <DialogContent className="sm:max-w-2xl bg-slate-800 border-slate-700">
          {selectedTicket && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-white">{selectedTicket.eventTitle}</DialogTitle>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="w-full h-48 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-purple-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ticket ID</span>
                      <span className="font-mono text-purple-300">#{selectedTicket.qrCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Purchase Price</span>
                      <span className="font-medium text-purple-400">{selectedTicket.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Purchase Date</span>
                      <span className="text-white">{new Date(selectedTicket.purchaseDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status</span>
                      <Badge className={getStatusColor(selectedTicket.status)}>
                        {selectedTicket.status === "upcoming" ? "Valid" : "Used"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-white">Transaction Details</h4>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-slate-700 p-2 rounded flex-1 truncate text-slate-300">
                        {selectedTicket.txHash}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedTicket.txHash)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://celoscan.io/tx/${selectedTicket.txHash}`, "_blank")}
                  className="border-slate-600 text-slate-300 hover:border-purple-500"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Celoscan
                </Button>
                <Button
                  onClick={() => handleTicketAction(selectedTicket, "qr")}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Show QR Code
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={currentAction === "qr"} onOpenChange={() => setCurrentAction(null)}>
        <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
          {selectedTicket && (
            <div className="text-center space-y-6">
              <DialogHeader>
                <DialogTitle className="text-white">Entry QR Code</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center mx-auto">
                  <QrCode className="w-24 h-24 text-slate-800" />
                </div>
                <div>
                  <p className="font-medium text-white">{selectedTicket.eventTitle}</p>
                  <p className="text-sm text-slate-400">Ticket #{selectedTicket.qrCode}</p>
                </div>
                <p className="text-xs text-slate-400">Show this QR code at the event entrance for verification</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:border-purple-500 bg-transparent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => setCurrentAction(null)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={currentAction === "transfer"} onOpenChange={() => setCurrentAction(null)}>
        <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
          {selectedTicket && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-white">Transfer Ticket</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-4 bg-slate-700 rounded-lg">
                  <p className="font-medium text-white">{selectedTicket.eventTitle}</p>
                  <p className="text-sm text-slate-400">Ticket #{selectedTicket.qrCode}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transferAddress" className="text-slate-300">
                    Recipient Wallet Address
                  </Label>
                  <Input
                    id="transferAddress"
                    placeholder="0x..."
                    value={transferAddress}
                    onChange={(e) => setTransferAddress(e.target.value)}
                    className="bg-slate-700 border-slate-600 focus:border-purple-500 text-white"
                  />
                </div>

                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-300">
                    Warning: This action cannot be undone. Make sure the recipient address is correct.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentAction(null)}
                  className="flex-1 border-slate-600 text-slate-300 hover:border-purple-500"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTransfer}
                  disabled={!transferAddress || isTransferring}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isTransferring ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Transferring...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Transfer
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}