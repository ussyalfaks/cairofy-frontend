
"use client";
import "./globals.css";
import {
  StarknetConfig,
  useInjectedConnectors,
  argent,
  braavos,
  publicProvider,
  voyager
} from "@starknet-react/core";
import { mainnet, sepolia } from "@starknet-react/chains";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { connectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],

    includeRecommended: "onlyIfNoConnectors",
    order: "alphabetical",
  });

  return (
    <html>
      <body>
        <StarknetConfig
          chains={[mainnet, sepolia]}
          connectors={connectors}
          provider={publicProvider()}
          explorer={voyager}
          autoConnect
        >
          {children}
        </StarknetConfig>
      </body>
    </html>
  );
}

