


// TypeScript
"use client"
// TypeScript
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { LimitOrderProvider, Order } from "@jup-ag/limit-order-sdk";
import { Decimal } from "decimal.js";
import {
  AddressLookupTableAccount,
  Connection,
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { getQuote, getSwapIx } from "./jupiterApi";
import { Wallet, BN } from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { config } from "dotenv";
import { getTakerFee } from "./fee";


const page = () => {
  return (
    <div>
      <MainComponent/>
    </div>
  )
}

export default page
config();

export function MainComponent() {
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!publicKey) {
      console.log("Please connect a wallet");
      return;
    }

    const main = async () => {
      try {
        const connection = new Connection(
          `https://api.helius.xyz/v0/addresses/${publicKey}/transactions?api-key=b956a5d5-4c8f-4caa-9956-3c36d31d17bc` || "https://api.mainnet-beta.solana.com"
        );
        const limitOrder = new LimitOrderProvider(connection);
        const fee = await limitOrder.getFee();

        while (true) {
      // get open orders
      let pendingOrders = await limitOrder.getOrders();
      let filterOrders: { publicKey: PublicKey; account: Order }[] = [];

      // group orders according to pair
      const pendingOrderGroup = pendingOrders.reduce((group:any , order) => {
        const {
          account: { inputMint, outputMint },
        } = order;
        const pair = inputMint.toBase58() + outputMint.toBase58();

        group[pair] = group[pair] || [];
        group[pair].push(order);
        return group;
      }, {});

      // filter top order from each pair
      // Object.values(pendingOrderGroup).forEach(
      //   (orders: { publicKey: PublicKey; account: Order }[]) => {
      //     const sortOrders = orders.sort((a, b) => {
      //       a.account.takingAmount.cmp;
      //       const aPrice = new Decimal(a.account.takingAmount.toString()).div(
      //         a.account.makingAmount.toString()
      //       );
      //       const bPrice = new Decimal(b.account.takingAmount.toString()).div(
      //         b.account.makingAmount.toString()
      //       );
      //       return aPrice.cmp(bPrice);
      //     });

      //     filterOrders = [...sortOrders.slice(0, 1), ...filterOrders];
      //   }
      // );

      for (let order of pendingOrders) {
        const {
          account: {
            makingAmount,
            takingAmount,
            inputMint,
            outputMint,
            makerOutputAccount,
          },
          publicKey,
        } = order;

        console.log("Try to execute order", publicKey.toBase58());

        // return if maker output token account has closed
        const makerOutputAccountInfo = await connection.getAccountInfo(
          makerOutputAccount
        );
        if (!makerOutputAccountInfo) return;

        // get route from Jupiter quote api
        const route = await getQuote(
          inputMint,
          outputMint,
          makingAmount.toString()
        );
        if (!route) return;
        const quoteOutAmount = new BN(route.outAmount);

        // calculate taking amount with taker fee
        const takerFee = getTakerFee(inputMint, outputMint, fee);
        const takingAmountWithTakerFee = takingAmount
          .muln(10000 + takerFee)
          .divn(10000);

        // execute if jupiter quote out amount is greater than taking amount with taker fee
        if (quoteOutAmount.gte(takingAmountWithTakerFee)) {
          // get swap transaction from jupiter api and deserialize
          let { swapTransaction: rawTx } = await getSwapIx(
            publicKey, // Access the publicKey property of the wallet object
            route
          );

          const swapTransactionBuf = Buffer.from(rawTx, "base64");
          const swapTransaction =
            VersionedTransaction.deserialize(swapTransactionBuf);

          const swapALT = await Promise.all(
            swapTransaction.message.addressTableLookups.map(async (lookup) => {
              return new AddressLookupTableAccount({
                key: lookup.accountKey,
                state: AddressLookupTableAccount.deserialize(
                  await connection
                    .getAccountInfo(lookup.accountKey)
                    .then((res) => res!.data)
                ),
              });
            })
          );
          const txMessage = TransactionMessage.decompile(
            swapTransaction.message,
            {
              addressLookupTableAccounts: swapALT,
            }
          );

          // get execute limit order transaction
          const limitOrderTx = await limitOrder.fillOrder({
            owner: publicKey,
            orderAccount: order,
            amount: makingAmount,
            expectedOutAmount: takingAmount,
          });

          // combine limit order and swap transaction
          txMessage.instructions.push(...limitOrderTx.instructions);
          txMessage.recentBlockhash = (
            await connection.getLatestBlockhash()
          ).blockhash;
          swapTransaction.message = txMessage.compileToV0Message([...swapALT]);

          swapTransaction.sign([Wallet.local().payer]);

          const txid = await connection.sendRawTransaction(
            swapTransaction.serialize()
          );

          console.log({ txid });
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
      } catch (err) {
        console.error({ err });
      }
    };

    main();
  }, [publicKey]);

  return null;
}