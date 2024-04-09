// TypeScript
"use client"

import { useState } from 'react';
import { MoonPayProvider, MoonPayBuyWidget } from '@moonpay/moonpay-react';
import styles from '../page.module.css';

export default function App() {
  const [asset, setAsset] = useState('SOL');
  const [visible, setVisible] = useState(false);

  const handleAssetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAsset(event.target.value);
  };

  return (
    <MoonPayProvider apiKey="pk_test_mSFFXVMlJ8AvN9focV5wCPmyLQyWCb" debug>
      <div className={styles.container}>
        <h1 className={styles.title}>Buy Crypto</h1>
        <div className={styles.selectContainer}>
          <select
            value={asset}
            onChange={handleAssetChange}
            className={styles.select}
          >
            <option value="SOL">Solana</option>
            <option value="USDC">USDC on Solana</option>
            <option value="USDT">USDT on Solana</option>
          </select>
        </div>
        <MoonPayBuyWidget
          variant="overlay"
          baseCurrencyCode="usd"
          baseCurrencyAmount="100"
          defaultCurrencyCode={asset}
          visible={visible}
          onCloseOverlay={() => {}}
        />
        <button className={styles.button} onClick={() => setVisible(!visible)}>
          Toggle widget
        </button>
      </div>
    </MoonPayProvider>
  );
}