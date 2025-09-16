"use client"

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
// import { useMiniApp } from '@/contexts/miniapp-context'
// import { ConnectButton } from './connect-button'
// import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Button } from './ui/button'

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()

  if (isConnected) {
  return (
    <div className="flex items-center gap-2 w-full">
      <button
        type="button"
        className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3 py-2"
      >
        Celo
      </button>

      <button
        type="button"
        className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
      >
        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
      </button>
    </div>
  )
}

  return(
    <Button
      type='button'
      onClick={() => connect({ connector: connectors[0] })}
    >
      Connect wallet
    </Button>
  )

}
