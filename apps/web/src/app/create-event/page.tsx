"use client"

import { useState, useEffect } from "react"
import { useAccount } from 'wagmi'
import { useRouter } from "next/navigation"
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-toastify"
import { Upload, Calendar, MapPin, Users, DollarSign, Sparkles, ArrowLeft, Clock, Image, FileText, Coins, ImageIcon } from "lucide-react"
import { useEventTicketingSetters } from '@/hooks/useEventTicketing'
import Link from "next/link"

export default function CreateEvent() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    price: "",
    totalSupply: "",
    bannerImage: null as File | null,
  })

  const { createTicket, isPending, isConfirming, isConfirmed, error } = useEventTicketingSetters();

  useEffect(() => {
    if (isPending) {
      toast.info("Creating event on blockchain...")
    }
  }, [isPending]) 

  useEffect(() => {
    if (isConfirming) {
      toast.info("Transaction is being processed...")
    }
  }, [isConfirming])

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Event created successfully on blockchain!")
      router.push("/marketplace")
    }
  }, [isConfirmed, router])

  useEffect(() => {
    if (error) {
      toast.error("Transaction denied")
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location || !formData.price || !formData.totalSupply) {
      toast.error("Please fill in all required fields")
      return
    }
  
    try {
      // Convert price to wei (assuming the price is in CELO, 1 CELO = 1e18 wei)
      const priceInWei = BigInt(Math.floor(parseFloat(formData.price) * 1e18));
      const totalSupply = BigInt(parseInt(formData.totalSupply, 10));
      
      // Validate price
      if (priceInWei <= 0n) {
        toast.error("Please enter a valid price greater than 0");
        return;
      }
      
      // Validate total supply
      if (totalSupply <= 0n) {
        toast.error("Please enter a valid total supply greater than 0");
        return;
      }
  
      // Check if event date is in the future
      const eventDateTime = Math.floor(new Date(`${formData.date}T${formData.time}`).getTime() / 1000);
      if (eventDateTime <= Math.floor(Date.now() / 1000)) {
        toast.error("Event date must be in the future");
        return;
      }
  
      const metadata = {
        bannerImage: formData.bannerImage ? formData.bannerImage.name : "",
        date: formData.date,
        time: formData.time
      };
  
      await createTicket(
        priceInWei,
        formData.title,
        formData.description,
        BigInt(eventDateTime),
        totalSupply,
        JSON.stringify(metadata),
        formData.location
      );
  
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event. Please try again.");
    }
  }

  if (!isConnected) {
    router.push("/")
    return null
  }

  const totalRevenue = formData.price && formData.totalSupply
    ? (Number.parseFloat(formData.price) * Number.parseInt(formData.totalSupply)).toFixed(2)
    : "0"

  const platformFee = formData.price && formData.totalSupply
    ? (Number.parseFloat(totalRevenue) * 0.025).toFixed(2) // 2.5% platform fee
    : "0"

  const yourEarnings = formData.price && formData.totalSupply
    ? (Number.parseFloat(totalRevenue) - Number.parseFloat(platformFee)).toFixed(2)
    : "0"

  return (
    <div className="min-h-screen bg-slate-900 text-foreground">
      <div className="pb-6 pt-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header with back button */}
          <div className="mb-4">
            <Link href="/dashboard" className="text-sm inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-4">
              <ArrowLeft className="h-3 w-3" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Create Your Event
                </h1>
                <p className="text-slate-300 text-base ">Launch your next amazing event on the blockchain</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid xl:grid-cols-3 gap-8">
              {/* Left Column - Event Details */}
              <div className="xl:col-span-2 space-y-8">
                {/* Basic Information */}
                <Card className="bg-slate-900/70 border-purple-500/30 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-xl">
                      <FileText className="h-4 w-4 text-purple-400" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-purple-200 font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Event Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Web3 Innovation Summit 2024"
                        required
                        className="text-sm px-4 rounded-md h-10 bg-slate-800/80 border-purple-500/30 text-white focus:border-purple-400 focus:ring-purple-400/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-purple-200 font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Join us for an incredible journey into the future of Web3 technology. Connect with industry leaders, discover innovative projects, and shape the decentralized future..."
                        rows={6}
                        required
                        className="text-sm px-4 rounded-md bg-slate-800/80 border-purple-500/30 text-white focus:border-purple-400 focus:ring-purple-400/20"
                      />
                      <p className="text-slate-400 text-sm">Tell people what makes your event special</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Event Details */}
                <Card className="bg-slate-900/70 border-blue-500/30 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-xl">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      Event Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-blue-200 font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date *
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                          className="text-sm px-4 rounded-md h-10 bg-slate-800/80 border-blue-500/30 text-white focus:border-blue-400 focus:ring-blue-400/20 [&::-webkit-calendar-picker-indicator]:invert"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time" className="text-blue-200 font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Time *
                        </Label>
                        <Input
                          id="time"
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          required
                          className="text-sm px-4 rounded-md h-10 bg-slate-800/80 border-blue-500/30 text-white focus:border-blue-400 focus:ring-blue-400/20 [&::-webkit-calendar-picker-indicator]:invert"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-blue-200 font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location *
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Convention Center, Miami Beach, FL"
                        required
                        className="text-sm px-4 rounded-md h-10 bg-slate-800/80 border-blue-500/30 text-white focus:border-blue-400 focus:ring-blue-400/20"
                      />
                      <p className="text-slate-400 text-sm">Where will your event take place?</p>
                    </div>

                    {/* <div className="space-y-2">
                      <Label htmlFor="banner" className="text-blue-200 font-medium flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Event Banner
                      </Label>
                      <div 
                        className="border-2 border-dashed border-blue-500/50 rounded-xl p-8 text-center bg-gradient-to-br from-blue-900/10 to-purple-900/10 hover:border-blue-400/70 transition-colors cursor-pointer group"
                        onClick={() => document.getElementById('banner')?.click()}
                      >
                        <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <p className="text-blue-200 font-medium mb-2">
                          {formData.bannerImage ? formData.bannerImage.name : "Upload event banner"}
                        </p>
                        <p className="text-slate-400 text-sm">PNG, JPG up to 10MB</p>
                        <Input
                          id="banner"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setFormData({ ...formData, bannerImage: e.target.files?.[0] || null })}
                        />
                      </div>
                    </div> */}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Ticket Configuration & Summary */}
              <div className="space-y-8">
                {/* Ticket Configuration */}
                <Card className="bg-slate-900/70 border-green-500/30 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white text-xl">
                      <Coins className="h-4 w-4 text-green-400" />
                      Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-green-200 font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Price per Ticket *
                      </Label>
                      <div className="relative">
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="25.00"
                          required
                          className="text-sm px-4 rounded-md h-10 bg-slate-800/80 border-green-500/30 text-white focus:border-green-400 focus:ring-green-400/20 "
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 font-sm">
                          CELO
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalSupply" className="text-green-200 font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Total Tickets *
                      </Label>
                      <Input
                        id="totalSupply"
                        type="number"
                        min="1"
                        value={formData.totalSupply}
                        onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
                        placeholder="1000"
                        required
                        className="text-sm px-4 rounded-md h-10 bg-slate-800/80 border-green-500/30 text-white focus:border-green-400 focus:ring-green-400/20"
                      />
                      <p className="text-slate-400 text-sm">How many people can attend?</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Summary */}
                <Card className="bg-slate-900/70 border-yellow-500/30 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white text-xl">
                      <DollarSign className="h-4 w-4 text-yellow-400" />
                      Revenue Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm px-4 rounded-md h-10 flex justify-between items-center bg-slate-700/30">
                        <span className="text-slate-300">Gross Revenue:</span>
                        <span className="text-white font-mono text-lg">{totalRevenue} CELO</span>
                      </div>
                      <div className="text-sm px-4 rounded-md h-10 flex justify-between items-center bg-slate-700/30">
                        <span className="text-slate-300">Platform Fee (2.5%):</span>
                        <span className="text-red-400 font-mono">-{platformFee} CELO</span>
                      </div>
                      <div className="text-sm px-4 rounded-md h-10 flex justify-between items-center bg-gradient-to-r from-yellow-900/30 to-green-900/30 border border-yellow-500/30">
                        <span className="text-yellow-200 font-medium">Your Earnings:</span>
                        <span className="text-yellow-400 font-bold font-mono text-xl">{yourEarnings} CELO</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Create Button */}
                <Card className="bg-slate-900/70 border-purple-500/30 shadow-2xl">
                  <CardContent className="p-4">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isPending || isConfirming}
                      className="text-sm px-4 rounded-md h-10 w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white font-bold shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                    >
                      {isPending || isConfirming ? (
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating Event...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-4 w-4" />
                          Create Event & Launch
                        </div>
                      )}
                    </Button>
                    <p className="text-slate-400 text-xs text-center mt-2">
                      Your event will be deployed to the blockchain
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}