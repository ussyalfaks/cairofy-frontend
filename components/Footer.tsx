import Link from 'next/link';
import { Disc3, Twitter, Instagram, MessageCircle, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1A1A1A] border-t border-[#333333] py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <Disc3 className="h-8 w-8 text-purple-600 mr-2" />
              <span className="text-xl text-purple-600 font-bold">Cairofy</span>
            </Link>
            <p className="text-white/70 text-sm mb-4">
              Stream. Own. Earn. The next generation of music ownership 
              and distribution on StarkNet.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-[#0EA5E9] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-[#0EA5E9] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-[#0EA5E9] transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-[#0EA5E9] transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/marketplace" className="text-white/70 hover:text-white text-sm transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-white/70 hover:text-white text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-white/70 hover:text-white text-sm transition-colors">
                  Upload Music
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="text-white/70 hover:text-white text-sm transition-colors">
                  Subscription
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-white/70 hover:text-white text-sm transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/70 hover:text-white text-sm transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/70 hover:text-white text-sm transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
                  Smart Contract
                </a>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-white/70 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/70 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="text-white/70 hover:text-white text-sm transition-colors">
                  Copyright
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#333333] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Cairofy. 
          </p>
          <p className="text-white/50 text-sm">
          All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;