"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ConnectWalletButton from "../form/ConnectWalletButton";
import { useAccount } from "@starknet-react/core";
import { Wallet, Disc3, ShoppingBag, Home, User, Menu, X } from "lucide-react";

const Navbar: React.FC = () => {
  const { address } = useAccount();
  return (
    <div className="px-2 lg:px-0">
      <div className="container mx-auto border-2 px-5 rounded-xl my-3 border-primary/20">
        <div
          className={`flex justify-between items-center backdrop-blur-xl py-4 rounded-xl font-sora ${
            address ? "flex-col gap-2 lg:flex-row md:flex-row" : ""
          }`}
        >
          <div className="logo">
            <Link href="/" className="flex items-center">
              <Disc3 className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl text-primary font-bold">Cairofy</span>
            </Link>
          </div>
          <div className="nav">
            <ConnectWalletButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
