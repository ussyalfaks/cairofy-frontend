'use client';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { ArgentMobileConnector } from 'starknetkit/argentMobile';
import { WebWalletConnector } from 'starknetkit/webwallet';
import { sepolia, mainnet, Chain } from '@starknet-react/chains';
import {
  argent,
  braavos,
  Connector,
  StarknetConfig,
  starkscan,
  useInjectedConnectors,
} from '@starknet-react/core';
import { jsonRpcProvider } from '@starknet-react/core';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const chains = [sepolia]; // Focus on Sepolia for now
  const { connectors: injected } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: 'always',
  });

  const [mounted, setMounted] = useState(false);

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  const rpc = useCallback((chain: Chain) => {
    // Use multiple fallback RPC endpoints
    const endpoints = [
      process.env.NEXT_PUBLIC_ALCHEMY_RPC,
      'https://starknet-sepolia.public.blastapi.io',
      'https://rpc.sepolia.starknet.io',
    ].filter(Boolean);

    return {
      nodeUrl: endpoints[Math.floor(Math.random() * endpoints.length)]
    };
  }, []);

  const provider = jsonRpcProvider({ 
    rpc
  });

  // Only create connectors when component has mounted (client-side)
  const connectors = mounted
    ? [
        ...injected,
        new WebWalletConnector({
          url: 'https://web.argent.xyz',
        }) as never as Connector,
        ArgentMobileConnector.init({
          options: {
            dappName: 'Token bound explorer',
            url: typeof window !== 'undefined' ? window.location.href : '',
          },
        }) as never as Connector,
      ]
    : [];

  // Don't render children until after client-side hydration
  if (!mounted) {
    return null;
  }

  return (
    <StarknetConfig
      chains={chains}
      provider={provider}
      connectors={connectors}
      explorer={starkscan}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}