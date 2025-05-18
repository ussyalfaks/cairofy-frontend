"use client";
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { 
  UploadCloud, 
  Music,
  Image as ImageIcon,
  Info,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { uploadToIPFS, IPFSResponse } from '@/lib/ipfs';
import { useAccount, useContract, useSendTransaction, useTransactionReceipt } from '@starknet-react/core';
import { CAIROFY_CONTRACT_ADDRESS, CAIROFY_ABI } from '@/constants/contrat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { shortString } from 'starknet';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import Navbar from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';

// Form schema
const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  // description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  genre: z.string().min(1, { message: "Please select a genre." }),
  price: z.coerce.number().min(0.1, { message: "Price must be at least 0.1 ETH." }),
});


interface UploadResult {
  audioIpfs: IPFSResponse | null;
  coverIpfs: IPFSResponse | null;
  metadataIpfs: IPFSResponse | null;
  transactionHash?: string;
}

const Upload = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [transactionConfirmed, setTransactionConfirmed] = useState(false);
  
  // Get wallet connection status
  const { address } = useAccount();
  
  // Setup contract
  const { contract } = useContract({
    address: CAIROFY_CONTRACT_ADDRESS,
    abi: CAIROFY_ABI,
  });
  
  // Initialize the send transaction hook with empty calls array
  const { sendAsync, isPending: isTransactionPending } = useSendTransaction({
    calls: [], // Start with empty calls, we'll provide them when sending the transaction
  });
  
  // Get transaction receipt to monitor transaction status
  const { data: receipt, isLoading: isWaitingForReceipt } = useTransactionReceipt({
    hash: transactionHash,
    watch: true,
  });
  
  // Effect to handle successful transaction receipt
  useEffect(() => {
    if (receipt && transactionHash && !transactionConfirmed) {
      // Transaction is confirmed
      setTransactionConfirmed(true);
      setUploadStep('Transaction confirmed!');
      
      toast.success(
        <div className="space-y-2">
          <p>Song registered successfully on the blockchain!</p>
          <p className="text-xs font-mono break-all">Transaction: {transactionHash}</p>
        </div>
      );
    }
  }, [receipt, transactionHash, transactionConfirmed]);
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      // description: "",
      genre: "",
      price: 0.1,
    },
  });

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
  };

  const removeAudioFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAudioFile(null);
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  const handleCoverImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }
      setCoverImage(file);
      const url = URL.createObjectURL(file);
      setCoverImagePreview(url);
    }
  };

  const removeCoverImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCoverImage(null);
    setCoverImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const createMetadataFile = async (audioIpfs: IPFSResponse, coverIpfs: IPFSResponse, formData: z.infer<typeof formSchema>): Promise<File> => {
    const metadata = {
      name: formData.title,
      // description: formData.description,
      image: coverIpfs.ipfsUrl,
      animation_url: audioIpfs.ipfsUrl,
      attributes: [
        {
          trait_type: "Genre",
          value: formData.genre
        },
        {
          trait_type: "Price",
          value: formData.price
        },
        {
          display_type: "date", 
          trait_type: "Created", 
          value: Math.floor(Date.now() / 1000)
        }
      ]
    };

    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    return new File([metadataBlob], 'metadata.json', { type: 'application/json' });
  };

  const uploadFiles = async (formData: z.infer<typeof formSchema>): Promise<UploadResult> => {
    try {
      if (!audioFile || !coverImage) {
        throw new Error('Audio file and cover image are required');
      }

      // Step 1: Upload audio file
      setUploadStep('Uploading audio file to IPFS...');
      const audioIpfs = await uploadToIPFS(audioFile);
      if (!audioIpfs) throw new Error('Failed to upload audio file to IPFS');
      
      // Step 2: Upload cover image
      setUploadStep('Uploading cover image to IPFS...');
      const coverIpfs = await uploadToIPFS(coverImage);
      if (!coverIpfs) throw new Error('Failed to upload cover image to IPFS');
      
      // Step 3: Create and upload metadata
      setUploadStep('Creating and uploading metadata...');
      const metadataFile = await createMetadataFile(audioIpfs, coverIpfs, formData);
      const metadataIpfs = await uploadToIPFS(metadataFile);
      if (!metadataIpfs) throw new Error('Failed to upload metadata to IPFS');
      
      return {
        audioIpfs,
        coverIpfs,
        metadataIpfs
      };
    } catch (error) {
      console.error('Error during upload process:', error);
      throw error;
    }
  };

  const registerSongOnContract = async (formData: z.infer<typeof formSchema>, result: UploadResult) => {
    try {
      if (!address) {
        throw new Error('Wallet not connected');
      }
      
      if (!result.audioIpfs || !result.coverIpfs) {
        throw new Error('Missing IPFS data');
      }
      
      if (!contract) {
        throw new Error('Contract not initialized');
      }
      
      setUploadStep('Preparing transaction...');
      
      // Convert title to felt (short string) for Cairo contract
      const nameAsFelt = shortString.encodeShortString(formData.title);
      
      // For IPFS hashes, we need to use a different approach
      // Instead of passing the hash directly, we'll create a custom call
      // with the correct parameter types
      
      // Convert price to u256 format (low, high parts)
      const priceInWei = Math.floor(formData.price * 10**18);
      
      // Create a uint256 object for the price
      const price = {
        low: priceInWei.toString(),
        high: '0'
      };
      
      // Prepare the register_song transaction call
     
      const calls = contract.populate('register_song', [
          nameAsFelt,              // name as string (will be converted to felt)
          result.audioIpfs.hash,        // ipfs_hash as string
          result.coverIpfs.hash,        // preview_ipfs_hash as string
          price                         // price as uint256 object
        ]);
      
      if (!calls) {
        throw new Error('Failed to create contract call');
      }
      
      setUploadStep('Waiting for wallet confirmation...');
      
      // Show toast that we're submitting to contract
      toast.loading("Please confirm the transaction in your wallet...", {
        id: "transaction-pending",
      });
      
      // Execute the transaction
      console.log("Sending transaction with calls:", calls);
      const response = await sendAsync([calls]);
      
      console.log("Transaction response:", response);
      
      // Store the transaction hash to monitor its status
      if (response.transaction_hash) {
        setTransactionHash(response.transaction_hash);
        setUploadStep('Transaction submitted!');
        
        // Stop the loading state on the button
        setIsUploading(false);
        
        toast.success(`Transaction submitted! You can view the status below.`, {
          id: "transaction-pending",
        });
        
        return response.transaction_hash;
      } else {
        throw new Error("No transaction hash returned");
      }
    } catch (error) {
      console.error('Error registering song on contract:', error);
      let errorMessage = 'Unknown contract error';
      
      if (error instanceof Error) {
        if (error.message.includes("User rejected")) {
          errorMessage = "Transaction was rejected in the wallet";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(`Failed to register song: ${errorMessage}`, {
        id: "transaction-pending",
      });
      
      throw new Error(`Failed to register song on blockchain: ${errorMessage}`);
    }
  };

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    if (!address) {
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
    
    try {
      setIsUploading(true);
      setTransactionConfirmed(false);
      
      // Step 1: Upload files to IPFS
      const result = await uploadFiles(formData);
      setUploadResult(result);
      
      // Step 2: Register song on blockchain
      const txHash = await registerSongOnContract(formData, result);
      
      // Update result with transaction info
      setUploadResult(prev => prev ? {
        ...prev,
        transactionHash: txHash
      } : null);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Upload failed: ${errorMessage}`);
      setIsUploading(false);
      setUploadStep('');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      
      <main className="flex-grow px-4 py-12 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 cal-sans">Upload Your Track</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Share your music as an NFT on the Starknet blockchain and connect with your audience</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              {/* Track Details - Now includes description */}
              <div className="backdrop-blur-[20px] bg-white/2 border border-white/10 rounded-xl p-8 hover:border-white/20 transition-all duration-300">
                <div className="text-sm text-gray-300 mb-6 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <span className="font-medium">Track Details</span>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Song Title"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem className='w-full'>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue placeholder="Select Genre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-black border-white/10">
                            <SelectItem value="electronic" className="text-white hover:bg-white/5">Electronic</SelectItem>
                            <SelectItem value="hiphop" className="text-white hover:bg-white/5">Hip Hop</SelectItem>
                            <SelectItem value="rock" className="text-white hover:bg-white/5">Rock</SelectItem>
                            <SelectItem value="jazz" className="text-white hover:bg-white/5">Jazz</SelectItem>
                            <SelectItem value="classical" className="text-white hover:bg-white/5">Classical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                              className="bg-white/5 border-white/10 text-white pl-18 placeholder:text-gray-500 focus:border-primary/50"
                              placeholder="0.1"
                              {...field}
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none text-gray-400 border-r border-white/10">
                              STRK
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                
              </div>

              

              {/* Media Upload Section - Combined song and cover art */}
              <div className="backdrop-blur-[20px] bg-white/2 border border-white/10 rounded-xl p-8 hover:border-white/20 transition-all duration-300">
                <div className="text-sm text-gray-300 mb-6 flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-primary" />
                  <span className="font-medium">Upload Media</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Audio Upload */}
                  <div>
                    <div className="text-sm text-gray-300 mb-4 flex items-center gap-2">
                      <Music className="h-5 w-5 text-primary" />
                      <span className="font-medium">Song File</span>
                    </div>
                    
                    <div 
                      className="flex flex-col items-center justify-center aspect-square py-12 cursor-pointer hover:bg-white/5 rounded-lg transition-colors border-2 border-dashed border-white/10 hover:border-primary/50 relative"
                      onClick={() => audioInputRef.current?.click()}
                    >
                      {audioFile ? (
                        <>
                          <div className="absolute top-3 right-3 z-10">
                            <button 
                              onClick={removeAudioFile}
                              className="bg-black/40 hover:bg-black/60 p-1.5 rounded-full transition-colors"
                            >
                              <X className="h-4 w-4 text-white" />
                            </button>
                          </div>
                          <Music className="h-12 w-12 text-primary mb-4" />
                          <p className="text-base text-gray-300 text-center max-w-[90%] truncate">
                            {audioFile.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-12 w-12 text-primary mb-4" />
                          <p className="text-base text-gray-300">
                            Drag and drop your audio file here, or {" "}
                            <span className="text-primary font-medium">browse</span>
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
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

                  {/* Cover Image Upload */}
                  <div>
                    <div className="text-sm text-gray-300 mb-4 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      <span className="font-medium">Cover Image</span>
                    </div>
                    
                    <div 
                      className="aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 rounded-lg transition-colors border-2 border-dashed border-white/10 hover:border-primary/50 relative overflow-hidden"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      {coverImagePreview ? (
                        <>
                          <div className="absolute top-3 right-3 z-10">
                            <button 
                              onClick={removeCoverImage}
                              className="bg-black/40 hover:bg-black/60 p-1.5 rounded-full transition-colors"
                            >
                              <X className="h-4 w-4 text-white" />
                            </button>
                          </div>
                          <Image
                            src={coverImagePreview}
                            alt="Cover"
                            width={500}
                            height={500}
                            className="w-full h-full object-cover"
                          />
                          {coverImage && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-2 px-3">
                              <p className="text-xs text-white truncate">{coverImage.name}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-12 w-12 text-primary mb-4" />
                          <p className="text-sm text-gray-300 text-center">
                            Upload cover art
                            <br />
                            <span className="text-gray-500 text-xs">JPG, PNG, GIF (1:1 ratio)</span>
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
              </div>

              {!address ? (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <p className="text-amber-500 text-sm">Please connect your wallet to upload a song</p>
                </div>
              ) : null}
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white cursor-pointer py-6 text-lg font-medium rounded-xl transition-all duration-300"
                disabled={isUploading || !address || isWaitingForReceipt || isTransactionPending}
              >
                {isUploading || isWaitingForReceipt || isTransactionPending ? (
                  <div className="flex items-center gap-3">
                    {transactionConfirmed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    )}
                    {uploadStep || 'Processing...'}
                  </div>
                ) : !address ? (
                  "Connect Wallet to Upload"
                ) : (
                  "Upload Song"
                )}
              </Button>
              
              {uploadResult && (
                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-white font-medium mb-2">Upload Results</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-400">Audio File:</p>
                      <p className="text-primary font-mono text-xs truncate">{uploadResult.audioIpfs?.hash}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Cover Image:</p>
                      <p className="text-primary font-mono text-xs truncate">{uploadResult.coverIpfs?.hash}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Metadata:</p>
                      <p className="text-primary font-mono text-xs truncate">{uploadResult.metadataIpfs?.hash}</p>
                    </div>
                    {uploadResult.transactionHash && (
                      <div>
                        <p className="text-gray-400">Transaction Hash:</p>
                        <p className="text-primary font-mono text-xs truncate">{uploadResult.transactionHash}</p>
                        {transactionConfirmed && (
                          <p className="text-green-500 text-xs flex items-center gap-1 mt-1">
                            <CheckCircle2 className="h-3 w-3" /> Confirmed
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Upload;


