"use client";

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useAccount, useContract, useSendTransaction, useTransactionReceipt } from '@starknet-react/core';
import { CAIROFY_CONTRACT_ADDRESS, CAIROFY_ABI } from '@/constants/contract';
import { uploadToIPFS } from '@/lib/ipfs';
import Image from 'next/image';
import { 
  UploadCloud, 
  Music,
  Info,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Form schema and types
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  price: z.coerce.number().min(0.1, { message: "Price must be at least 0.1 STRK." }),
  for_sale: z.boolean().default(true),
});

const Upload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [audioIPFS, setAudioIPFS] = useState<{ ipfs: string, gateway: string } | null>(null);
  const [coverIPFS, setCoverIPFS] = useState<{ ipfs: string, gateway: string } | null>(null);
  const [transactionHash, setTransactionHash] = useState("");

  const { address, isConnected } = useAccount();
  const { contract } = useContract({
    address: CAIROFY_CONTRACT_ADDRESS,
    abi: CAIROFY_ABI,
  });

  const { sendAsync } = useSendTransaction({ calls: [] });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 1,
      for_sale: true,
    },
  });

  const { data: receipt } = useTransactionReceipt({
    hash: transactionHash,
    watch: true,
  });

  useEffect(() => {
    if (receipt && transactionHash) {
      toast.success("Song uploaded successfully!", {
        duration: 5000,
        position: "top-center",
        icon: "🎉",
      });

      setTransactionHash("");
      form.reset();
      setAudioFile(null);
      setCoverImage(null);
      setAudioIPFS(null);
      setCoverIPFS(null);
    }
  }, [receipt, transactionHash, form]);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleAudioUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('audio/')) {
        toast.error('Please upload a valid audio file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB
        toast.error('File size must be less than 50MB');
        return;
      }
      setAudioFile(file);
    }
    // Reset the input value so the same file can be selected again after removal
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const removeAudioFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent div's onClick
    setAudioFile(null);
  };

  const handleCoverImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }
      setCoverImage(file);
    }
    // Reset the input value so the same file can be selected again after removal
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeCoverImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent div's onClick
    setCoverImage(null);
  };

  const onSubmit = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!audioFile) {
      toast.error("Please upload an audio file");
      return;
    }
    
    if (!coverImage) {
      toast.error("Please upload a cover image");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload audio file to IPFS
      const audioResult = await uploadToIPFS(audioFile);
      if (!audioResult) {
        toast.error("Failed to upload audio file to IPFS");
        setIsUploading(false);
        return;
      }
      setAudioIPFS({
        ipfs: audioResult.ipfsUrl,
        gateway: audioResult.gatewayUrl
      });

      // Upload cover image to IPFS
      const imageResult = await uploadToIPFS(coverImage);
      if (!imageResult) {
        toast.error("Failed to upload cover image to IPFS");
        setIsUploading(false);
        return;
      }
      setCoverIPFS({
        ipfs: imageResult.ipfsUrl,
        gateway: imageResult.gatewayUrl
      });

      // Here you would typically call your smart contract with the IPFS URLs
      console.log('Audio IPFS URL:', audioResult.ipfsUrl);
      console.log('Cover IPFS URL:', imageResult.ipfsUrl);
      
      // Register song on the smart contract
      try {
        if (!contract) {
          throw new Error("Contract not initialized");
        }

        const formData = form.getValues();
        
        // Prepare the transaction call
        const calls = contract.populate("register_song", [
          formData.name,
          audioIPFS?.ipfs || "", // ipfs_hash
          coverIPFS?.ipfs || "", // preview_ipfs_hash
          formData.price.toString(), // price as string
          formData.for_sale ? "1" : "0", // for_sale as string
        ]);

        // Show toast that we're submitting to contract
        toast.loading("Submitting to contract: Please confirm the transaction in your wallet...", {
          duration: 10000,
          position: "top-center"
        });

        // Execute the transaction
        const response = await sendAsync([calls]);
        console.log("Transaction response:", response);

        // Store the transaction hash to monitor its status
        if (response.transaction_hash) {
          setTransactionHash(response.transaction_hash);
          
          toast.success(`Transaction submitted! Hash: ${response.transaction_hash.substring(0, 10)}...`, {
            duration: 5000,
            position: "top-center"
          });
        }
      } catch (error) {
        console.error('Contract error:', error);
        
        let errorMessage = "Failed to register song on the blockchain";
        
        if (error instanceof Error) {
          if (error.message.includes("User rejected")) {
            errorMessage = "Transaction was rejected. Please approve the transaction to upload the song.";
          } else if (error.message.includes("network")) {
            errorMessage = "Network error. Please check your connection and try again.";
          } else {
            errorMessage = `Error: ${error.message}`;
          }
        }
        
        toast.error(errorMessage);
        return;
      }
    } catch (error) {
      console.error('Error during upload:', error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      
      <main className="flex-grow px-4 py-12 pt-24"> {/* Added pt-24 to increase top padding */}
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Upload Track</h1>
            <main className="flex-1 container max-w-4xl mx-auto py-12 px-4">
              <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8">
                    {/* Audio Upload Section */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-400">
                        Audio File
                      </div>
                      <div className="border border-dashed border-gray-600 rounded-lg p-8">
                        <div 
                          className="h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 rounded-lg transition-colors relative"
                          onClick={() => audioInputRef.current?.click()}
                        >
                          {audioFile ? (
                            <>
                              <div className="relative w-full flex justify-end">
                                <button
                                  onClick={removeAudioFile}
                                  className="absolute -top-4 -right-4 p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                                >
                                  <X className="h-4 w-4 text-gray-400" />
                                </button>
                              </div>
                              <Music className="h-8 w-8 text-purple-500 mb-2" />
                              <p className="text-sm text-purple-500 font-medium">
                                {audioFile.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {(audioFile.size / (1024 * 1024)).toFixed(2)}MB
                              </p>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-400">
                                Drag and drop your audio file here, or {" "}
                                <span className="text-purple-500">browse</span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Supported formats: MP3, WAV (max 50MB)
                              </p>
                            </>
                          )}
                          <input
                            ref={audioInputRef}
                            type="file"
                            accept="audio/*"
                            onChange={handleAudioUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cover Image Upload */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-400">
                        Cover Image
                      </div>
                      <div className="border border-dashed border-gray-600 rounded-lg p-8">
                        <div 
                          className="h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 rounded-lg transition-colors relative overflow-hidden"
                          onClick={() => imageInputRef.current?.click()}
                        >
                          {coverImage ? (
                            <>
                              <button
                                onClick={removeCoverImage}
                                className="absolute -top-2 -right-2 p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors z-50 cursor-pointer"
                              >
                                <X className="h-4 w-4 text-gray-400" />
                              </button>
                              <Image
                                src={URL.createObjectURL(coverImage)}
                                alt="Cover preview"
                                fill
                                className="object-contain z-20"
                              />
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-400">
                                Drag and drop your cover image here, or {" "}
                                <span className="text-purple-500">browse</span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Supported formats: JPEG, PNG, GIF (max 50MB)
                              </p>
                            </>
                          )}
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Song name"
                                className="bg-gray-800/50 border-gray-700 text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    className="bg-gray-800/50 border-gray-700 text-white pl-16"
                                    {...field}
                                  />
                                  <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none text-gray-400 border-r border-gray-700">
                                    STRK
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="for_sale"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-700 bg-gray-800/50 cursor-pointer"
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                  />
                                  <label className="text-sm text-gray-400 cursor-pointer">List for sale</label>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {(audioIPFS || coverIPFS) && (
                      <div className="mt-4 p-4 bg-purple-500/10 rounded-lg space-y-2">
                        <h3 className="text-sm font-medium text-purple-500">IPFS Upload Status</h3>
                        {audioIPFS && (
                          <div className="text-xs text-gray-400 space-y-1">
                            <div>
                              <span className="font-medium">Audio IPFS:</span>
                              <span className="ml-2 text-purple-500 break-all">
                                {audioIPFS.ipfs}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Gateway URL:</span>
                              <a 
                                href={audioIPFS.gateway} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-2 text-purple-500 hover:underline break-all"
                              >
                                {audioIPFS.gateway}
                              </a>
                            </div>
                          </div>
                        )}
                        {coverIPFS && (
                          <div className="text-xs text-gray-400 space-y-1">
                            <div>
                              <span className="font-medium">Cover IPFS:</span>
                              <span className="ml-2 text-purple-500 break-all">
                                {coverIPFS.ipfs}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Gateway URL:</span>
                              <a 
                                href={coverIPFS.gateway} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-2 text-purple-500 hover:underline break-all"
                              >
                                {coverIPFS.gateway}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* NFT Info */}
                    <div className="bg-gray-800/30 rounded-lg p-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium text-white">Upload Details</h3>
                          <p className="text-sm text-gray-400">
                            Your song will be uploaded on the Starknet blockchain. Set your price and choose whether to list it for sale.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 cursor-pointer"
                      disabled={isUploading || !isConnected || !address}
                    >
                      {!isConnected ? (
                        "Connect Wallet to Upload"
                      ) : isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Upload Song"
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </main>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Upload;


