// "use client";
// import { useMiniApp } from "@/contexts/miniapp-context";
// import { sdk } from "@farcaster/frame-sdk";
// import Image from "next/image";
// import { useState, useEffect } from "react";
// import { useAccount, useConnect } from "wagmi";

// export default function Home() {
//   const { context, isMiniAppReady } = useMiniApp();
//   const [isAddingMiniApp, setIsAddingMiniApp] = useState(false);
//   const [addMiniAppMessage, setAddMiniAppMessage] = useState<string | null>(null);
  
//   // Wallet connection hooks
//   const { address, isConnected, isConnecting } = useAccount();
//   const { connect, connectors } = useConnect();
  
//   // Auto-connect wallet when miniapp is ready
//   useEffect(() => {
//     if (isMiniAppReady && !isConnected && !isConnecting && connectors.length > 0) {
//       const farcasterConnector = connectors.find(c => c.id === 'farcaster');
//       if (farcasterConnector) {
//         connect({ connector: farcasterConnector });
//       }
//     }
//   }, [isMiniAppReady, isConnected, isConnecting, connectors, connect]);
  
//   // Extract user data from context
//   const user = context?.user;
//   // Use connected wallet address if available, otherwise fall back to user custody/verification
//   const walletAddress = address || user?.custody || user?.verifications?.[0] || "0x1e4B...605B";
//   const displayName = user?.displayName || user?.username || "User";
//   const username = user?.username || "@user";
//   const pfpUrl = user?.pfpUrl;
  
//   // Format wallet address to show first 6 and last 4 characters
//   const formatAddress = (address: string) => {
//     if (!address || address.length < 10) return address;
//     return `${address.slice(0, 6)}...${address.slice(-4)}`;
//   };
  
//   if (!isMiniAppReady) {
//     return (
//       <main className="flex-1">
//         <section className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//           <div className="w-full max-w-md mx-auto p-8 text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//             <p className="text-gray-600">Loading...</p>
//           </div>
//         </section>
//       </main>
//     );
//   }
  
//   return (
//     <main className="flex-1">
//       <section className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="w-full max-w-md mx-auto p-8 text-center">
//           {/* Welcome Header */}
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">
//             Welcome
//           </h1>
          
//           {/* Status Message */}
//           <p className="text-lg text-gray-600 mb-6">
//             You are signed in!
//           </p>
          
//           {/* User Wallet Address */}
//           <div className="mb-8">
//             <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-xs text-gray-600 font-medium">Wallet Status</span>
//                 <div className={`flex items-center gap-1 text-xs ${
//                   isConnected ? 'text-green-600' : isConnecting ? 'text-yellow-600' : 'text-gray-500'
//                 }`}>
//                   <div className={`w-2 h-2 rounded-full ${
//                     isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-gray-400'
//                   }`}></div>
//                   {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
//                 </div>
//               </div>
//               <p className="text-sm text-gray-700 font-mono">
//                 {formatAddress(walletAddress)}
//               </p>
//             </div>
//           </div>
          
//           {/* User Profile Section */}
//           <div className="mb-8">
//             {/* Profile Avatar */}
//             <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center overflow-hidden">
//               {pfpUrl ? (
//                 <Image 
//                   src={pfpUrl} 
//                   alt="Profile" 
//                   className="w-full h-full object-cover rounded-full"
//                 />
//               ) : (
//                 <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
//                   <div className="w-3 h-3 bg-green-400 rounded-full"></div>
//                 </div>
//               )}
//             </div>
            
//             {/* Profile Info */}
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900 mb-1">
//                 {displayName}
//               </h2>
//               <p className="text-gray-500">
//                 {username.startsWith('@') ? username : `@${username}`}
//               </p>
//             </div>
//           </div>
          
//           {/* Add Miniapp Button */}
//           <div className="mb-6">
//             <button
//               onClick={async () => {
//                 if (isAddingMiniApp) return;
                
//                 setIsAddingMiniApp(true);
//                 setAddMiniAppMessage(null);
                
//                 try {
//                   const result = await sdk.actions.addMiniApp();
//                   if (result.added) {
//                     setAddMiniAppMessage("✅ Miniapp added successfully!");
//                   } else {
//                     setAddMiniAppMessage("ℹ️ Miniapp was not added (user declined or already exists)");
//                   }
//                 } catch (error: any) {
//                   console.error('Add miniapp error:', error);
//                   if (error?.message?.includes('domain')) {
//                     setAddMiniAppMessage("⚠️ This miniapp can only be added from its official domain");
//                   } else {
//                     setAddMiniAppMessage("❌ Failed to add miniapp. Please try again.");
//                   }
//                 } finally {
//                   setIsAddingMiniApp(false);
//                 }
//               }}
//               disabled={isAddingMiniApp}
//               className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
//             >
//               {isAddingMiniApp ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                   Adding...
//                 </>
//               ) : (
//                 <>
//                   <span>📱</span>
//                   Add Miniapp
//                 </>
//               )}
//             </button>
            
//             {/* Add Miniapp Status Message */}
//             {addMiniAppMessage && (
//               <div className="mt-3 p-3 bg-white/30 backdrop-blur-sm rounded-lg">
//                 <p className="text-sm text-gray-700">{addMiniAppMessage}</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }

"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import Image from "next/image"
import Link from "next/link"
import { WalletDebug } from "@/components/wallet-debug"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown, Globe, RefreshCw, Shield, Star, Ticket, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function Home() {
  const { isConnected } = useAccount()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    // Only show debug in development
    setShowDebug(process.env.NODE_ENV === 'development')
  }, [])

  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard")
    }
  }, [isConnected, router])

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ 
      behavior: "smooth",
      block: "start"
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden mb-6">
      {/* Debug overlay */}
      {showDebug && (
        <div className="fixed bottom-4 right-4 z-50 max-w-xs">
          <WalletDebug />
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 animate-gradient" />

        {/* Enhanced Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full animate-float blur-sm" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-secondary/20 rounded-full animate-float animate-delay-200 blur-sm" />
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-primary/30 rounded-full animate-float animate-delay-400 blur-sm" />
        <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-purple-500/20 rounded-full animate-float animate-delay-600 blur-sm" />
        <div className="absolute bottom-40 right-10 w-14 h-14 bg-cyan-500/20 rounded-full animate-float animate-delay-800 blur-sm" />

        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                The Future of{' '}
                <span className="gradient-text animate-neon-pulse bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
                  Event Ticketing
                </span>
              </h1>
            </div>

            <div className={`transition-all duration-1000 delay-200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-4xl mx-auto leading-relaxed">
                Secure, transparent, and fraud-proof NFT tickets on the blockchain. Own your tickets, trade freely, and
                never worry about counterfeits again.
              </p>
            </div>

            <div className={`transition-all duration-1000 delay-400 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                {/* <WalletConnectButton className="w-full sm:w-auto min-w-[220px] text-lg px-8 py-4 animate-pulse-glow h-14 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-lg shadow-purple-500/25 transition-all duration-300" /> */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto min-w-[220px] text-lg px-8 py-4 glow-border hover:bg-primary/10 bg-transparent h-14 rounded-full border-2 hover:scale-105 transition-all duration-300"
                  onClick={() => scrollToSection("how-it-works")}
                >
                  Learn More <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Enhanced Stats */}
            <div className={`transition-all duration-1000 delay-600 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold gradient-text animate-bounce-in bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
                    10K+
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground group-hover:text-white transition-colors">
                    Events Created
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold gradient-text animate-bounce-in animate-delay-200 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                    500K+
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground group-hover:text-white transition-colors">
                    Tickets Sold
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold gradient-text animate-bounce-in animate-delay-400 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
                    Zero
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground group-hover:text-white transition-colors">
                    Counterfeits
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-[calc(100vh-10px)] left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown 
              className="h-8 w-8 text-muted-foreground cursor-pointer hover:text-white transition-colors"
              onClick={() => scrollToSection("featured-events")}
            />
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section id="featured-events" className="py-20 px-4 bg-slate-900/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              Featured Events
            </h2>
            <p className="text-md text-muted-foreground max-w-2xl mx-auto">
              Discover amazing events from top organizers around the world
            </p>
          </div>

          {/* Event Carousel Controls */}
          {/* <div className="flex justify-center items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="text-muted-foreground hover:text-white"
            >
              {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="flex gap-2">
              {featuredEvents.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentEventIndex % featuredEvents.length
                      ? 'bg-primary w-8'
                      : 'bg-muted-foreground hover:bg-primary/70'
                  }`}
                  onClick={() => {
                    setCurrentEventIndex(index)
                    setIsAutoPlaying(false)
                  }}
                />
              ))}
            </div>
          </div> */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* {featuredEvents.slice(0, 4).map((event, index) => (
              <Card
                key={event.id}
                className={`group hover:scale-105 transition-all duration-500 cursor-pointer bg-slate-800/90 border-slate-700 hover:border-primary/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/20 ${
                  index === currentEventIndex % featuredEvents.length ? 'ring-2 ring-primary/50 scale-102' : ''
                }`}
              >
                <CardContent className="p-0">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={imageErrors[Number(event.id)] ? "/placeholder.svg" : event.image || "/placeholder.svg"}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={() => handleImageError(Number(event.id))}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <Badge className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm">
                      {event.category}
                    </Badge>
                    <Badge className={`absolute top-3 right-3 backdrop-blur-sm ${
                      event.ticketsLeft <= 10 ? 'bg-red-500/90 animate-pulse' : 'bg-secondary/90'
                    } text-white`}>
                      {event.ticketsLeft} left
                    </Badge>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors text-white line-clamp-2 min-h-[3.5rem]">
                      {event.title}
                    </h3>

                    <div className="space-y-2 text-sm text-slate-300 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span className="truncate">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span>{event.attendees.toLocaleString()} attendees</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center pt-4 border-t border-slate-700/50">
                      <span className="text-2xl font-bold gradient-text bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        {event.price}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))} */}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/marketplace')}
              className="px-8 py-4 text-lg hover:scale-105 transition-all duration-300 border-primary/50 hover:bg-primary/10"
            >
              View All Events <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-card/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to secure, verifiable event tickets
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform animate-pulse-glow shadow-xl shadow-purple-500/30">
                  <Ticket className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Buy NFT Tickets</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect your wallet and purchase authentic NFT tickets directly from event organizers. Each ticket is
                unique and stored on the blockchain.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform animate-pulse-glow animate-delay-200 shadow-xl shadow-cyan-500/30">
                  <Shield className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Store Securely</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your tickets are safely stored in your crypto wallet. No more lost tickets or worrying about screenshots
                - your ownership is cryptographically verified.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform animate-pulse-glow animate-delay-400 shadow-xl shadow-purple-500/30">
                  <Globe className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Use & Trade</h3>
              <p className="text-muted-foreground leading-relaxed">
                Present your QR code at the event for instant verification. Transfer or resell your tickets anytime with
                full transparency and zero fraud risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Why Choose Tixora?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Revolutionary features that make event ticketing better for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-4 hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-500/30 glow-border backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/20">
              <Shield className="h-16 w-16 text-purple-400 mx-auto mb-6 animate-pulse-glow" />
              <h3 className="text-xl font-semibold mb-4 text-white">100% Secure</h3>
              <p className="text-sm text-purple-200 leading-relaxed">
                Blockchain-verified authenticity eliminates all counterfeiting risks
              </p>
            </Card>

            <Card className="text-center p-4 hover:scale-105 transition-all duration-300 bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border-cyan-500/30 glow-border backdrop-blur-sm hover:shadow-xl hover:shadow-cyan-500/20">
              <Zap className="h-16 w-16 text-cyan-400 mx-auto mb-6 animate-pulse-glow animate-delay-200" />
              <h3 className="text-xl font-semibold mb-4 text-white">Zero Fees</h3>
              <p className="text-sm text-cyan-200 leading-relaxed">
                No platform fees - organizers keep 100% of ticket sales revenue
              </p>
            </Card>

            <Card className="text-center p-4 hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-900/40 to-cyan-900/20 border-purple-500/30 glow-border backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/20">
              <RefreshCw className="h-16 w-16 text-purple-400 mx-auto mb-6 animate-pulse-glow animate-delay-400" />
              <h3 className="text-xl font-semibold mb-4 text-white">Free Trading</h3>
              <p className="text-sm text-purple-200 leading-relaxed">
                Transfer and resell tickets freely with transparent pricing
              </p>
            </Card>

            <Card className="text-center p-8 hover:scale-105 transition-all duration-300 bg-gradient-to-br from-cyan-900/40 to-purple-900/20 border-cyan-500/30 glow-border backdrop-blur-sm hover:shadow-xl hover:shadow-cyan-500/20">
              <Star className="h-16 w-16 text-cyan-400 mx-auto mb-6 animate-pulse-glow animate-delay-600" />
              <h3 className="text-xl font-semibold mb-4 text-white">Own Forever</h3>
              <p className="text-sm text-cyan-200 leading-relaxed">
                Keep your tickets as collectible NFTs with permanent ownership
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-card/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between text-center mb-2">
            <div>
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Image src="/tixora-logo.png" alt="Tixora" width={40} height={40} className="rounded-lg" />
                <span className="text-2xl font-bold gradient-text bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Tixora
                </span>
              </div>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                The future of event ticketing is here. Secure, transparent, and decentralized.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <Link href="https://github.com/DIFoundation/Tixora/blob/main/README.md" target="_blank" className="hover:text-primary transition-colors hover:underline">
                Documentation
              </Link>
              <Link href="/resources" className="hover:text-primary transition-colors hover:underline">
                Resources
              </Link>
              <Link href="#" className="hover:text-primary transition-colors hover:underline">
                Support
              </Link>
              <Link href="#" className="hover:text-primary transition-colors hover:underline">
                Privacy
              </Link>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {new Date().getFullYear()} Tixora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}