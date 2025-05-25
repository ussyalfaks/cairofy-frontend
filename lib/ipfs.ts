const JWT = process.env.PINATA_JWT;
const PINATA_API_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

export interface IPFSResponse {
  ipfsUrl: string;    // ipfs:// format
  gatewayUrl: string; // https:// format
  hash: string;
}

export async function uploadToIPFS(file: File): Promise<IPFSResponse | null> {
  try {
    if (!JWT) throw new Error("Pinata JWT not found");

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(PINATA_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Failed to upload to IPFS: ${res.statusText}`);
    }

    const result = await res.json();
    const hash = result.IpfsHash;
    return {
      ipfsUrl: `ipfs://${hash}`,
      gatewayUrl: `https://ipfs.io/ipfs/${hash}`,
      hash: hash,
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return null;
  }
}