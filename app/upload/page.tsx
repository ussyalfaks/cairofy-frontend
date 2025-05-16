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

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white py-6 cursor-pointer text-lg font-medium rounded-xl transition-all duration-300"
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    UPloading song...
                  </div>
                ) : (
                  "Upload Song"
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


