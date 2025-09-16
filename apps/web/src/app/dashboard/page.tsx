"use client"

import { useAccount, useBalance } from "wagmi"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ShoppingBag, TicketIcon, Activity, Users, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
// import { useRecentTickets, useUserTickets, formatPrice } from "@/hooks/use-contracts"
import { useMemo, useEffect, useState } from "react"
import { formatEther } from "viem"
// import { toast } from "react-toastify"
import { eventTicketingAbi, eventTicketingAddress } from "../../lib/addressAndAbi"
import { useReadContract, useReadContracts } from "wagmi"
import { DialogContent, DialogTitle } from "@radix-ui/react-dialog"

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [userStats, setUserStats] = useState({
    attendedEvents: 0,
    totalSpent: "0",
    createdEvents: 0,
    totalRevenue: "0"
  })

  // Get total tickets count
  const { data: totalTickets, isLoading: loadingTotalTickets } = useReadContract({
    address: eventTicketingAddress,
    abi: eventTicketingAbi,
    functionName: 'getTotalTickets',
  })

  // Get recent tickets data
  const { data: recentTicketsData, isLoading: loadingRecentTickets } = useReadContract({
    address: eventTicketingAddress,
    abi: eventTicketingAbi,
    functionName: 'getRecentTickets',
  })

  // Calculate user-specific stats
  useEffect(() => {
    if (!recentTicketsData || !address) return

    const tickets = recentTicketsData as any[]
    
    // Calculate events created by user
    const createdByUser = tickets.filter(ticket => 
      ticket.creator.toLowerCase() === address.toLowerCase()
    )
    
    // Calculate total revenue from created events
    const totalRevenue = createdByUser.reduce((sum, ticket) => 
      sum + Number(ticket.totalCollected), 0
    )
    
    // Calculate events attended (rough estimation - in real app you'd track registrations)
    const attendedEvents = tickets.filter(ticket => 
      ticket.sold > 0 && !ticket.canceled
    ).length
    
    // Calculate estimated spending (this would need actual registration tracking)
    const estimatedSpent = attendedEvents * 0.01 // Rough estimation
    
    setUserStats({
      attendedEvents: attendedEvents,
      totalSpent: estimatedSpent.toString(),
      createdEvents: createdByUser.length,
      totalRevenue: formatEther(BigInt(totalRevenue))
    })
  }, [recentTicketsData, address])

  // Stats cards data
  const stats = useMemo(() => [
    {
      label: "Events Attended",
      value: userStats.attendedEvents.toString(),
      change: userStats.attendedEvents > 0 ? "Based on ticket ownership" : "Connect to see your events",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500"
    },
    {
      label: "Total Spent",
      value: `${userStats.totalSpent} CELO`,
      change: userStats.attendedEvents > 0 ? "Estimated spending" : "No purchases yet",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500"
    },
    {
      label: "Events Created",
      value: userStats.createdEvents.toString(),
      change: userStats.createdEvents > 0 ? 
        `${userStats.createdEvents} events launched` : "Create your first event",
      icon: Plus,
      color: "from-purple-500 to-pink-500"
    },
    {
      label: "Revenue Earned",
      value: `${userStats.totalRevenue} CELO`,
      change: userStats.createdEvents > 0 ? 
        `From ${userStats.createdEvents} events` : "No revenue yet",
      icon: Users,
      color: "from-orange-500 to-red-500"
    },
  ], [userStats])

  // Generate recent activity from tickets data
  const recentActivity = useMemo(() => {
    if (!recentTicketsData || !address) return []
    
    const tickets = recentTicketsData as any[]
    
    return tickets
      .filter(ticket => ticket.creator.toLowerCase() === address.toLowerCase())
      .slice(0, 5)
      .map((ticket) => ({
        id: Number(ticket.id),
        action: ticket.canceled ? `Canceled ${ticket.eventName}` : `Created ${ticket.eventName}`,
        time: new Date(Number(ticket.eventTimestamp) * 1000).toLocaleDateString(),
        amount: `${formatEther(ticket.price)} CELO`,
        type: ticket.canceled ? "cancel" : "create",
        status: ticket.closed ? "Closed" : ticket.canceled ? "Canceled" : "Active",
        sold: Number(ticket.sold),
        maxSupply: Number(ticket.maxSupply)
      }))
  }, [recentTicketsData, address])

  // Platform stats
  const platformStats = useMemo(() => {
    if (!recentTicketsData) return null
    
    const tickets = recentTicketsData as any[]
    const activeEvents = tickets.filter(t => !t.closed && !t.canceled).length
    const totalSold = tickets.reduce((sum, t) => sum + Number(t.sold), 0)
    const totalRevenue = tickets.reduce((sum, t) => sum + Number(t.totalCollected), 0)
    
    return {
      totalEvents: tickets.length,
      activeEvents,
      totalTicketsSold: totalSold,
      totalPlatformRevenue: formatEther(BigInt(totalRevenue))
    }
  }, [recentTicketsData])

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""

  const quickActions = [
    {
      title: "Marketplace",
      description: "Browse and purchase event tickets",
      icon: ShoppingBag,
      href: "/marketplace",
      gradient: "from-purple-500 to-blue-500",
    },
    {
      title: "My Tickets",
      description: "View and manage your NFT tickets",
      icon: TicketIcon,
      href: "/tickets",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Create Event",
      description: "Launch your own ticketed event",
      icon: Plus,
      href: "/create-event",
      gradient: "from-purple-600 to-pink-500",
    },
  ]

  if (!isConnected) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-foreground pt-6">
      <div className="pb-12">
        <div className="container mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {shortAddress}
              </span>
            </h1>
            <p className="text-slate-300 text-sm">Manage your events and tickets on the decentralized web</p>
          </div>

          {/* Platform Overview */}
          {platformStats && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Platform Overview
              </h2>
              <div className="grid xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
                <Card className="bg-gradient-to-br from-slate-800/80 to-purple-900/30 border-purple-500/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-xl font-bold text-white">{platformStats.totalEvents}</p>
                    <p className="text-slate-300 text-sm">Total Events</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-slate-800/80 to-blue-900/30 border-blue-500/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-xl font-bold text-white">{platformStats.activeEvents}</p>
                    <p className="text-slate-300 text-sm">Active Events</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-slate-800/80 to-green-900/30 border-green-500/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-xl font-bold text-white">{platformStats.totalTicketsSold}</p>
                    <p className="text-slate-300 text-sm">Tickets Sold</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-slate-800/80 to-orange-900/30 border-orange-500/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-xl font-bold text-white">{platformStats.totalPlatformRevenue}</p>
                    <p className="text-slate-300 text-sm">Platform Revenue (CELO)</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Personal Stats */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Your Stats
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index} className="bg-gradient-to-br from-slate-800/80 to-purple-900/30 border-purple-500/30 overflow-hidden relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`} />
                    <CardContent className="p-4 relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="h-4 w-4 text-white" />
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white mb-2">
                          {stat.value}
                        </p>
                        <p className="text-slate-300 font-medium mb-1">{stat.label}</p>
                        <p className="text-green-400 text-sm font-medium">{stat.change}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Quick Actions
            </h2>
            <div className="flex flex-row sm:flex-row gap-6 overflow-x-auto overflow-hidden scrollbar-hide">
              <div className="flex flex-nowrap gap-6">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <Link key={index} href={action.href}>
                      <Card className="group cursor-pointer bg-gradient-to-br from-slate-800/80 to-purple-900/30 border-purple-500/30 overflow-hidden relative hover:border-purple-400/60 transition-all duration-300">
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                        <CardContent className="flex flex-col items-center justify-center p-4 text-center relative z-10 h-48 w-48">
                          <div
                            className={`w-12 h-12 rounded-full mb-3 bg-gradient-to-br ${action.gradient} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}
                          >
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-lg font-bold mb-2 text-white">{action.title}</h3>
                          <p className="text-slate-300 text-sm">{action.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div>
            <Card className="bg-gradient-to-br from-slate-800/80 to-purple-900/30 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white text-xl">
                  <Activity className="h-4 w-4 text-purple-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'cancel' ? 'bg-red-400' : 'bg-blue-400'
                          }`} />
                          <div>
                            <p className="text-white font-medium text-lg">{activity.action}</p>
                            <p className="text-slate-400">{activity.time}</p>
                            <p className="text-slate-500 text-sm">
                              {activity.sold}/{activity.maxSupply} tickets sold
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant="outline"
                            className={`border-purple-500/50 px-2 py-1 ${
                              activity.status === 'Active' 
                                ? 'text-green-300 bg-green-500/10 border-green-500/50'
                                : activity.status === 'Canceled'
                                ? 'text-red-300 bg-red-500/10 border-red-500/50'
                                : 'text-gray-300 bg-gray-500/10 border-gray-500/50'
                            }`}
                          >
                            {activity.status}
                          </Badge>
                          <span className="text-purple-300 font-mono text-sm">
                            {activity.amount}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400">No recent activity. Create your first event to get started!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}