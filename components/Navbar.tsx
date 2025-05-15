
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet, Disc3, ShoppingBag, Home, User, Menu, X } from 'lucide-react';
import * as Dialog from "@radix-ui/react-dialog";
import { useConnect, useAccount, Connector, useDisconnect } from "@starknet-react/core";
import { UserCircle2 } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { connectors, connectAsync } = useConnect();
  const { account, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleConnect = async (connector: Connector) => {
    await connectAsync({ connector });
    setIsDialogOpen(false);
  };


  return (
    <header className="fixed top-0 left-0 w-full bg-[#0F0F0]/80 backdrop-blur-md z-50 border-b border-[#333333]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Disc3 className="h-8 w-8 text-purple-600 mr-2" />
            <span className="text-xl text-purple-600 font-bold">Cairofy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white/80 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/marketplace" className="text-white/80 hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link href="/dashboard" className="text-white/80 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/Upload" className="text-white/80 hover:text-white transition-colors">
              Upload
            </Link>
            <Link href="/profile" className="text-white/80 hover:text-white transition-colors">
            Profile
            </Link>
          </nav>

          {/* Connect Wallet Button (Desktop) */}
          <div className="hidden md:block">
            {isConnected && account ? (
              <div className="flex items-center space-x-2 px-4 py-2 rounded-full border border-purple-600 bg-[#1c1f26]">
                <UserCircle2 className="w-6 h-6 text-purple-600" />
                <span className="hidden sm:inline text-purple-600">{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
                <button onClick={() => disconnect()} className="ml-2 text-sm text-red-400 hover:underline">Disconnect</button>
              </div>
            ) : (
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center space-x-2 py-2 text-sm rounded-full btn-primary"
              >
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Connect Wallet</span>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-[#333333] animate-fade-in-up">
            <div className="flex flex-col space-y-4 px-2 pt-2 pb-4">
              <Link 
                href="/" 
                className="flex items-center px-3 py-2 text-white/80 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Home className="h-5 w-5 mr-2" />
                Home
              </Link>
              <Link 
                href="/marketplace" 
                className="flex items-center px-3 py-2 text-white/80 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Marketplace
              </Link>
              <Link 
                href="/dashboard" 
                className="flex items-center px-3 py-2 text-white/80 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-5 w-5 mr-2" />
                Dashboard
              </Link>
              <Link 
                href="/Upload" 
                className="flex items-center px-3 py-2 text-white/80 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-5 w-5 mr-2" />
                Upload
              </Link>
              <Link 
                href="/profile" 
                className="flex items-center px-3 py-2 text-white/80 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Disc3 className="h-5 w-5 mr-2" />
                Profile
              </Link>
              {isConnected && account ? (
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full border border-[#2d2f36] bg-[#1c1f26]">
                  <UserCircle2 className="w-6 h-6 text-white" />
                  <span>{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
                  <button onClick={() => disconnect()} className="ml-2 text-xs text-red-400 hover:underline">Disconnect</button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="flex items-center justify-center space-x-2 rounded-full"
                >
                  <Wallet className="h-4 w-4" />
                  <span className=''>Connect Wallet</span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Wallet Connect Dialog */}
        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 border border-[#0EA5E9] bg-[0EA5E9]/60 z-40" />
            <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background p-6 shadow-xl border border-[#1c1f26]">
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title className="text-xl font-bold text-foreground">
                  Connect Wallet
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="text-foreground hover:text-red-500">
                    <X />
                  </button>
                </Dialog.Close>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Choose a wallet to continue.
              </p>
              <div className="space-y-3">
                {connectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => handleConnect(connector)}
                    className="w-full py-2 rounded-md bg-[#5C94FF] text-white text-center font-semibold hover:bg-[#487dd8] transition flex items-center justify-center"
                  >
                    <img 
                    src={typeof connector.icon === 'string' 
                      ? connector.icon 
                      : connector.icon?.dark}
                    alt={connector.name}
                    className="w-6 h-6 mr-2 self-center"
                    />
                    {connector.name}
                  </button>
                ))}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
};

export default Navbar;