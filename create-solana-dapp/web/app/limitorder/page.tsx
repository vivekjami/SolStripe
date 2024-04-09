// TypeScript
"use client"
// TypeScript
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';

export default function LimitOrder() {
  const [asset, setAsset] = useState('SOL');
  const [price, setPrice] = useState(0);
  const [size, setSize] = useState(0);

  const wallet = useWallet();

  const handleAssetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAsset(event.target.value);
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(Number(event.target.value));
  };

  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSize(Number(event.target.value));
  };

  const placeLimitOrder = async () => {
    if (!wallet.connected) {
      console.error('Wallet is not connected');
      return;
    }
  
    const order = {
      market: 'MARKET_SYMBOL', // Replace with the actual market symbol
      side: 'buy', // or 'sell'
      price: price,
      size: size,
      type: 'limit',
    };
  
    try {
      const publicKey = wallet.publicKey;
      if (!publicKey) {
        console.error('Wallet public key is null');
        return;
      }
      
      const response = await axios.post('https://api.jupiter.com/orders', order, {
        headers: {
          'Authorization': `Bearer ${publicKey.toBase58()}`, // Replace with the actual method to get the JWT token
        },
      });
  
      console.log('Order placed:', response.data);
    } catch (error) {
      console.error('Error placing order:', error);
  
      // Handle the error based on its type
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error(error.response.data);
          console.error(error.response.status);
          console.error(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error', error.message);
        }
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error', error as Error);
      }
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#2F76DB' }}>
      <div>
        <label>Asset</label>
        <select value={asset} onChange={handleAssetChange}>
          <option value="SOL">SOL</option>
          <option value="USDC">USDC</option>
          {/* Add more options as needed */}
        </select>
      </div>
      <div>
        <label>Price</label>
        <input type="number" value={price} onChange={handlePriceChange} />
      </div>
      <div>
        <label>Size</label>
        <input type="number" value={size} onChange={handleSizeChange} />
      </div>
      <button style={{ padding: '10px', backgroundColor: '#1F2D5A', color: 'white', border: 'none', borderRadius: '5px' }} onClick={placeLimitOrder}>Place Limit Order</button>
    </div>
  );
}