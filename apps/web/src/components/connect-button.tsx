"use client"

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

export function WalletConnectButton() {
  const router = useRouter()
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const handleDisconnect = () => {
    disconnect()
    router.push('/')
  }

  const handleSwitchChain = () => {
    if (!chainId) return

    if (chainId === 42220) {
      switchChain({ chainId: 11142220 })
    } else if (chainId === 11142220) {
      switchChain({ chainId: 42220 })
    }
  }

  if (isConnected) {
  return (
    <div className="flex items-center gap-2 w-full">
      <button
        type="button"
        onClick={handleSwitchChain}
        className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3 py-2"
      >
        Celo
      </button>

      <button
        type="button"
        onClick={handleDisconnect}
        className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
      >
        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Disconnect'}
      </button>
    </div>
  )
}

  return(
    <Button
      type='button'
      onClick={() => connect({ connector: connectors[0] })}
      className='w-full'
    >
      Connect wallet
    </Button>
  )

}
