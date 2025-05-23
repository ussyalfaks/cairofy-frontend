import { NextRequest, NextResponse } from 'next/server';
import PinataSDK from '@pinata/sdk';
import { Readable } from 'stream';

const pinata = new PinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_API_SECRET
});

// Helper to create readable streams
const bufferToStream = (buffer: Buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to IPFS with proper content type
    const result = await pinata.pinFileToIPFS(bufferToStream(buffer), {
      pinataMetadata: { name: file.name },
      pinataOptions: { cidVersion: 0 }
    });

    // Use multiple gateway formats
    const gateways = [
      `https://${process.env.PINATA_GATEWAY}/ipfs/${result.IpfsHash}`,
      `https://ipfs.io/ipfs/${result.IpfsHash}`,
      `https://cloudflare-ipfs.com/ipfs/${result.IpfsHash}`
    ];

    return NextResponse.json({
      success: true,
      cid: result.IpfsHash,
      gateways,
      mimeType: file.type
    });

  } catch (error) {
    console.error('IPFS Upload Error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get('cid');
    const mimeType = searchParams.get('mimeType');

    if (!cid) {
      return NextResponse.json(
        { error: 'Missing CID parameter' },
        { status: 400 }
      );
    }

    // Generate gateway URLs with cache-busting
    const gateways = [
      `https://${process.env.PINATA_GATEWAY || 'amber-voluntary-possum-989.mypinata.cloud'}/ipfs/${cid}?${Date.now()}`,
      `https://ipfs.io/ipfs/${cid}?${Date.now()}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}?${Date.now()}`,
      `https://dweb.link/ipfs/${cid}?${Date.now()}`
    ];

    return NextResponse.json({
      success: true,
      cid,
      gateways,
      mimeType
    });

  } catch (error) {
    console.error('IPFS Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to resolve CID', details: String(error) },
      { status: 500 }
    );
  }
}