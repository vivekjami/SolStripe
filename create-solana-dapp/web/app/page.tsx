'use client'

import { useEffect } from 'react';
import styles from './page.module.css';

function Page() {

  useEffect(() => {
    // Dynamically load the Jupiter script
    const script = document.createElement('script');
    script.src = "https://terminal.jup.ag/main-v2.js";
    script.onload = () => launchJupiter(); // Initialize Jupiter after the script loads
    document.head.appendChild(script);
  }, []);

  function launchJupiter() {
    if (window.Jupiter) {
      window.Jupiter.init({ 
        displayMode: "integrated",
        integratedTargetId: "integrated-terminal",
        endpoint: "https://mainnet.helius-rpc.com/?api-key=b956a5d5-4c8f-4caa-9956-3c36d31d17bc",
        strictTokenList: false,
        defaultExplorer: "Solana Explorer",
        formProps: {
          initialAmount: "888888880000",
          initialInputMint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
          initialOutputMint: "AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR",
        },
      });
    } else {
      console.error("Jupiter script not loaded yet");
    }
  }
  return (
    <div className={styles.body}>

      <div id="integrated-terminal"></div>

    </div>
  );
}

export default Page;