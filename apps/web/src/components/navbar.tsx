"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAccount } from "wagmi"
import { WalletConnectButton } from "./connect-button"
import { ConnectButton } from "@rainbow-me/rainbowkit"

const navLinks = [
  { name: "Home", href: "/" },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Marketplace', href: '/marketplace' },
  { name: 'My Tickets', href: '/tickets' },
  { name: 'Create Event', href: '/create-event' },
  { name: "Docs", href: "https://docs.celo.org", external: true }
]

export function Navbar() {
  const pathname = usePathname()
  const { isConnected } = useAccount()

  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="flex items-center space-x-2">
                  <Image 
                    src="/logo.svg" 
                    alt="Tixora" 
                    width={40} 
                    height={40} 
                    className="rounded-full h-10 w-10"
                  />
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Tixora
                  </span>
                </Link>
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                      pathname === link.href ? "text-foreground" : "text-foreground/70"
                    }`}
                  >
                    {link.name}
                    {link.external && <ExternalLink className="h-4 w-4" />}
                  </Link>
                ))}
                <div className="mt-6 pt-6 border-t">
                  <WalletConnectButton />
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="hidden font-bold sm:inline-block text-xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Tixora
            </span>
          </Link>
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href
                  ? "text-foreground"
                  : "text-foreground/70"
              }`}
            >
              {link.name}
              {link.external && <ExternalLink className="h-4 w-4" />}
            </Link>
          ))}
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <WalletConnectButton />
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
