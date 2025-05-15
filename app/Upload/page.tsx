"use client";
import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { 
  UploadCloud, 
  Music,
  Image as ImageIcon,
  Info,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Form schema
const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  genre: z.string().min(1, { message: "Please select a genre." }),
  price: z.coerce.number().min(0.1, { message: "Price must be at least 0.1 ETH." }),
});

const Upload = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
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
      const url = URL.createObjectURL(file);
      setCoverImagePreview(url);
    }
    // Reset the input value so the same file can be selected again after removal
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeCoverImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent div's onClick
    setCoverImage(null);
    if (coverImagePreview) {
      URL.revokeObjectURL(coverImagePreview);
      setCoverImagePreview(null);
    }
  };

  const onSubmit = ()=> {
    if (!audioFile) {
      toast.error("Please upload an audio file");
      return;
    }
    
    if (!coverImage) {
      toast.error("Please upload a cover image");
      return;
    }
    
    setIsUploading(true);
    // Simulated upload
    setTimeout(() => {
      setIsUploading(false);
      toast.success("NFT minted successfully!");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      
      <main className="flex-grow px-4 py-12 pt-24"> {/* Added pt-24 to increase top padding */}
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Upload Track</h1>
            <p className="text-gray-400">Share your music as an NFT on the Starknet blockchain</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Audio Upload Section */}
              <div className="border border-dashed border-gray-600 rounded-lg p-8">
                <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  Song File (MP3, WAV)
                </div>
                
                <div 
                  className="flex flex-col items-center justify-center py-8 cursor-pointer hover:bg-white/5 rounded-lg transition-colors"
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

              <div className="grid grid-cols-2 gap-6">
                {/* Cover Image Upload */}
                <div className="border border-dashed border-gray-600 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Cover Image
                  </div>
                  
                  <div 
                    className="aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 rounded-lg transition-colors relative"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    {coverImagePreview ? (
                      <div className="relative w-full h-full">
                        <button
                          onClick={removeCoverImage}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors z-10"
                        >
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                        <Image
                          src={coverImagePreview}
                          alt="Cover"
                          width={500}
                          height={500}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-400 text-center">
                          Upload cover art
                          <br />
                          <span className="text-gray-500">JPG, PNG, GIF (1:1 ratio)</span>
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

                {/* Song Details */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Song Title"
                            className="bg-gray-800/50 border-gray-700 text-white"
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
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select Genre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="electronic" className="text-white">Electronic</SelectItem>
                            <SelectItem value="hiphop" className="text-white">Hip Hop</SelectItem>
                            <SelectItem value="rock" className="text-white">Rock</SelectItem>
                            <SelectItem value="jazz" className="text-white">Jazz</SelectItem>
                            <SelectItem value="classical" className="text-white">Classical</SelectItem>
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
                              className="bg-gray-800/50 border-gray-700 text-white pl-16"
                              {...field}
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none text-gray-400 border-r border-gray-700">
                              ETH
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your song..."
                        className="bg-gray-800/50 border-gray-700 text-white h-32 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NFT Info */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-white">NFT Minting Details</h3>
                    <p className="text-sm text-gray-400">
                      Your song will be minted as an NFT on the Starknet blockchain. You&apos;ll earn rewards when users
                      listen to your music and receive royalties when your NFT is resold.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6"
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Minting NFT...
                  </div>
                ) : (
                  "Upload Track"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Upload;


