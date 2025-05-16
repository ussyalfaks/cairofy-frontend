'use client';
import React, { useEffect } from 'react';
import Button from './Button';
import { Connector, useAccount, useConnect, useDisconnect } from '@starknet-react/core';
import { StarknetkitConnector, useStarknetkitConnectModal } from 'starknetkit';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ConnectWalletButtonProps {
  size?: 'sm' | 'lg';
  className?: string;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  size = 'sm',
  className = '',
}) => {
  const router = useRouter();
  const { disconnect } = useDisconnect();

  const { connect, connectors, isSuccess } = useConnect();
  const { account, address } = useAccount();

  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[],
  });

  async function connectWallet() {
    const { connector } = await starknetkitConnectModal();
    try {
      if (connector) {
        connect({ connector: connector as Connector });
      } else {
        toast.error('No wallet connectors found. Please make sure Argent or Braavos is installed.');
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to connect wallet. Try again.');
    }
  }

  useEffect(() => {
    if (isSuccess && address && account) {
      router.push('/pay-bill');
    }
  }, [isSuccess, address, account, router]);

  if (!address) {
    return (
      <Button size={size} type="default" onClick={connectWallet} className={className}>
        Connect wallet
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="px-3 text-sm bg-gray-100 rounded-lg flex items-center justify-center">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </div>
      <Button onClick={() => disconnect()} className="px-4 py-2 text-white transition-colors">
        Disconnect
      </Button>
    </div>
  );
};

export default ConnectWalletButton;