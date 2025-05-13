"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet, Disc3, ShoppingBag, Home, User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const connectWallet = () => {
    // In a real implementation, this would connect to StarkNet wallet
    setIsConnected(true);
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
            {isConnected ? (
              <Button 
                variant="outline" 
                className="flex items-center space-x-2 py-2 text-sm rounded-full bg-[#1A1A1A] border-[#333333] hover:border-[#0EA5E9]/70 hover:bg-[#0EA5E9]/10"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">0x72...38F1</span>
              </Button>
            ) : (
              <Button 
                onClick={connectWallet}
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
                href="/dashboard" 
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
              
              {isConnected ? (
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center space-x-2 py-2 rounded-full bg-[#1A1A1A] border-[#333333]"
                >
                  <User className="h-4 w-4" />
                  <span>0x72...38F1</span>
                </Button>
              ) : (
                <Button 
                  onClick={connectWallet}
                  className="flex items-center bg-[#0EA5E9] justify-center space-x-2 rounded-full"
                >
                  <Wallet className="h-4 w-4" />
                  <span className=''>Connect Wallet</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;