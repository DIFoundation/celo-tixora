"use client"

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function WalletConnectButton() {
  const router = useRouter()
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { chains, switchChain } = useSwitchChain()

  const handleDisconnect = () => {
    disconnect()
    router.push('/')
  }

  const handleChainChange = (chainId: string) => {
    switchChain?.({ chainId: Number(chainId), connector: connectors[0] })
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 w-full">
        <Select
          value={chain?.id.toString()}
          onValueChange={handleChainChange}
          disabled={!switchChain}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select chain" />
          </SelectTrigger>
          <SelectContent>
            {chains.map((x) => (
              <SelectItem
                key={x.id}
                value={x.id.toString()}
                disabled={x.id === chain?.id}
              >
                {x.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          onClick={handleDisconnect}
          variant="outline"
          className="flex-1"
        >
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Disconnect'}
        </Button>
      </div>
    )
  }

  return (
    <Button
      type='button'
      onClick={
        () => connect({ connector: connectors[0] })
      }
      className='w-full'
    >
      Connect wallet
    </Button>
  )
}
