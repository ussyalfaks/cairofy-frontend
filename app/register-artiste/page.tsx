"use client";
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { 
  UserPlus,
  Info,
  Loader2,
  CheckCircle2,
  UploadCloud,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useAccount, useContract, useSendTransaction, useTransactionReceipt } from '@starknet-react/core';
import { CAIROFY_CONTRACT_ADDRESS, CAIROFY_ABI } from '@/constants/contrat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { shortString } from 'starknet';
import { uploadToIPFS, IPFSResponse } from '@/lib/ipfs';
import Image from 'next/image';
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

// Updated form schema with length validation
const formSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(31, { message: "Name must be less than 32 characters." }),
  description: z.string()
    .min(10, { message: "Description must be at least 10 characters." })
    .max(500, { message: "Description must be less than 500 characters." }),
});

// Utility function to format string for Cairo ByteArray
const formatDescriptionForCairo = (description: string): string[] => {
  const MAX_LENGTH = 31;
  const chunks: string[] = [];
  
  // Split the string into chunks of MAX_LENGTH
  for (let i = 0; i < description.length; i += MAX_LENGTH) {
    const chunk = description.slice(i, i + MAX_LENGTH);
    chunks.push(shortString.encodeShortString(chunk));
  }
  
  // Format as Cairo ByteArray structure
  // First value is the array length (number of chunks)
  const result = [chunks.length.toString()];
  
  // Add each chunk
  result.push(...chunks);
  
  // Add pending_word (0 as felt) and pending_word_len (0 as u32)
  result.push("0"); // pending_word
  result.push("0"); // pending_word_len
  
  return result;
};

const RegisterArtiste = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [transactionConfirmed, setTransactionConfirmed] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<string>('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageIpfs, setProfileImageIpfs] = useState<IPFSResponse | null>(null);
  
  const { address } = useAccount();
  const { contract } = useContract({
    address: CAIROFY_CONTRACT_ADDRESS,
    abi: CAIROFY_ABI,
  });
  
  const { sendAsync } = useSendTransaction({ calls: [] });
  const { data: receipt } = useTransactionReceipt({ hash: transactionHash, watch: true });
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (receipt && transactionHash && !transactionConfirmed) {
      setTransactionConfirmed(true);
      setRegistrationStep('Transaction confirmed!');
      toast.success(
        <div className="space-y-2">
          <p>Artist registered successfully on the blockchain!</p>
          <p className="text-xs font-mono break-all">Transaction: {transactionHash}</p>
        </div>
      );
    }
  }, [receipt, transactionHash, transactionConfirmed]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "" },
  });

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image file must be less than 10MB');
        return;
      }
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const removeProfileImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfileImage(null);
    setProfileImagePreview(null);
    setProfileImageIpfs(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // Helper to extract a valid felt-compatible IPFS hash
  const extractValidFelt = (ipfsHash: string): string => {
    // IPFS hashes can be too long for a felt252 (31 char max)
    // We'll use either:
    // 1. Just the base CID without the Qm prefix
    // 2. A truncated version of the hash as last resort
    
    // Remove any ipfs:// prefix if present
    let cleanHash = ipfsHash;
    if (cleanHash.startsWith('ipfs://')) {
      cleanHash = cleanHash.substring(7);
    }
    
    // If still too long, trim it
    if (cleanHash.length > 31) {
      console.warn(`IPFS hash too long (${cleanHash.length} chars), using truncated version`);
      return cleanHash.substring(0, 31);
    }
    
    return cleanHash;
  };

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    if (!address) return toast.error("Connect your wallet first");
    if (!profileImage) return toast.error("Upload a profile image");

    try {
      setIsRegistering(true);
      setTransactionConfirmed(false);

      console.log("Starting artist registration process");
      
      // Step 1: Upload the image to IPFS first
      setRegistrationStep('Uploading image to IPFS...');
      const ipfsResponse = await uploadToIPFS(profileImage);
      if (!ipfsResponse) {
        toast.error("Failed to upload image to IPFS");
        setIsRegistering(false);
        return;
      }
      
      setProfileImageIpfs(ipfsResponse);
      console.log("Profile image uploaded to IPFS:", ipfsResponse);
      
      // Step 2: Now prepare and send the transaction
      if (!contract) {
        toast.error("Contract not initialized");
        setIsRegistering(false);
        return;
      }
      
      // Convert name to felt252 (max 31 chars)
      const nameAsFelt = shortString.encodeShortString(formData.name);
      
      // Make sure the hash is valid for a felt252
      const validHash = extractValidFelt(ipfsResponse.hash);
      let profileImageUriFelt;
      
      try {
        profileImageUriFelt = shortString.encodeShortString(validHash);
        console.log("Successfully encoded hash:", validHash);
      } catch (error) {
        console.error("Hash encoding error:", error);
        // Emergency fallback
        const emergencyHash = validHash.substring(0, 30);
        console.log("Emergency hash truncation:", emergencyHash);
        profileImageUriFelt = shortString.encodeShortString(emergencyHash);
      }
      
      // Format description as ByteArray for Cairo
      const descriptionArray = formatDescriptionForCairo(formData.description);
      
      // Create the contract call with all parameters properly formatted
      const call = {
        contractAddress: CAIROFY_CONTRACT_ADDRESS,
        entrypoint: 'register_artiste',
        calldata: [
          nameAsFelt,
          ...descriptionArray, // Spread the description ByteArray
          profileImageUriFelt
        ]
      };
      
      // Debug logs
      console.log("Sending transaction with call:", call);
      console.log("Description array:", descriptionArray);
      
      setRegistrationStep('Waiting for wallet confirmation...');
      toast.loading("Please confirm in your wallet...", { id: "transaction-pending" });
      
      try {
        // Send the transaction - awaiting the full result
        const response = await sendAsync([call]);
        
        if (response.transaction_hash) {
          setTransactionHash(response.transaction_hash);
          setRegistrationStep('Transaction submitted!');
          setIsRegistering(false);
          
          toast.success(`Transaction submitted! Hash: ${response.transaction_hash}`, {
            id: "transaction-pending",
          });
          
          console.log("Transaction successful:", response);
        } else {
          throw new Error("No transaction hash returned");
        }
      } catch (txError) {
        console.error('Transaction error:', txError);
        handleTransactionError(txError);
        setIsRegistering(false);
      }
    } catch (error) {
      console.error("Registration process error:", error);
      setIsRegistering(false);
      setRegistrationStep('');
      toast.error("Registration failed. Please try again.");
    }
  };

  // Helper to handle transaction errors
  const handleTransactionError = (txError: unknown) => {
    if (txError instanceof Error) {
      console.error('Error details:', txError.message);
      
      // Check for specific error patterns
      if (txError.message.includes('INVALID_ARGUMENT_FELT252')) {
        toast.error('Invalid format for one of the parameters', { id: "transaction-pending" });
      } else if (txError.message.includes('ARRAY_OUT_OF_BOUNDS')) {
        toast.error('Array format error in description', { id: "transaction-pending" });
      } else if (txError.message.includes('too long')) {
        toast.error('IPFS hash is too long for direct encoding. Try a shorter hash.', { id: "transaction-pending" });
      } else if (txError.message.includes('User rejected')) {
        toast.error('Transaction was rejected in the wallet', { id: "transaction-pending" });
      } else {
        toast.error(`Transaction failed: ${txError.message}`, { id: "transaction-pending" });
      }
    } else {
      toast.error('Unknown transaction error', { id: "transaction-pending" });
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <main className="flex-grow px-4 py-12 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 cal-sans">Register as Artist</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Join the platform to share your music</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <label className="text-lg text-white font-medium">Artist Name</label>
                          <div className="relative ml-2 group">
                            <Info className="h-4 w-4 text-gray-400" />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-2 bg-black/90 text-xs text-gray-300 rounded hidden group-hover:block">
                              Your public artist name on the platform (max 31 characters)
                            </div>
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm">{field.value.length}/31</span>
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your artist name"
                          className="bg-black/20 border-white/10 text-white focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </div>
                  </FormItem>
                )}
              />
              
              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <label className="text-lg text-white font-medium">Artist Bio</label>
                          <div className="relative ml-2 group">
                            <Info className="h-4 w-4 text-gray-400" />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-2 bg-black/90 text-xs text-gray-300 rounded hidden group-hover:block">
                              Tell your fans about yourself and your music
                            </div>
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm">{field.value.length}/500</span>
                      </div>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe your style, influences, and achievements"
                          className="min-h-32 bg-black/20 border-white/10 text-white focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </div>
                  </FormItem>
                )}
              />
              
              {/* Profile Image Upload */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <h3 className="text-lg text-white font-medium">Profile Image</h3>
                  <div className="relative ml-2 group">
                    <Info className="h-4 w-4 text-gray-400" />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-2 bg-black/90 text-xs text-gray-300 rounded hidden group-hover:block">
                      Upload a high-quality profile image in JPG, PNG or GIF format (max 10MB)
                    </div>
                  </div>
                </div>
                
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    profileImagePreview
                      ? 'border-white/10 bg-white/5'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {profileImagePreview ? (
                    <div className="relative w-full">
                      <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg">
                        <Image
                          src={profileImagePreview}
                          alt="Profile preview"
                          width={400}
                          height={400}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeProfileImage}
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                      >
                        <X className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 p-3 bg-white/10 rounded-full">
                        <UploadCloud className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-white font-medium mb-1">
                        Click to upload profile image
                      </p>
                      <p className="text-gray-400 text-sm text-center">
                        JPG, PNG or GIF (max. 10MB)
                      </p>
                    </>
                  )}
                </div>
                
                {profileImageIpfs && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">
                        Image uploaded to IPFS
                      </p>
                      <div className="text-gray-400 text-xs truncate">
                        {profileImageIpfs.ipfsUrl}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-black font-medium py-6 px-8 rounded-full flex items-center gap-2 disabled:opacity-50"
                  disabled={isRegistering || !address}
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{registrationStep || 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      <span>Register Artist</span>
                    </>
                  )}
                </Button>
              </div>

              {transactionHash && (
                <div className="backdrop-blur-[20px] bg-white/2 border border-white/10 rounded-xl p-6 mt-8">
                  <div className="flex items-start gap-4">
                    {transactionConfirmed ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500 mt-1" />
                    ) : (
                      <Loader2 className="h-6 w-6 text-primary animate-spin mt-1" />
                    )}
                    <div>
                      <h3 className="text-white font-medium mb-2">
                        {transactionConfirmed ? 'Success' : 'Processing'}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">
                        {transactionConfirmed 
                          ? 'Registration confirmed on blockchain' 
                          : 'Processing registration...'}
                      </p>
                      <div className="bg-white/5 rounded p-3 font-mono text-xs text-gray-300 break-all">
                        {transactionHash}
                      </div>
                    </div>
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

export default RegisterArtiste;