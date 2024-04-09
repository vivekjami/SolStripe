"use client"
import * as React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  DocumentTextIcon,
  CubeTransparentIcon,
} from "@heroicons/react/outline";

// although it's better practice to import your API key as an environment variable, i've instantiated the API key as a constant variable for demo purposes
const HELIUS_API_KEY = "b956a5d5-4c8f-4caa-9956-3c36d31d17bc";

const page = () => {
  // react state variables
  const [parseHistoryUrl, setParseHistoryUrl] = React.useState<string>("");
  const [listOfTxs, setListOfTxs] = React.useState<any[]>([]);
  const [displayDetails, setDisplayDetails] = React.useState<boolean>(false);
  const [transactionDetails, setTransactionDetails] = React.useState<{}>({});

  const { connection } = useConnection(); // grab wallet connection string
  const { publicKey } = useWallet(); // grab wallet pubkey

  // only parses NFT, Jupiter, and SPL related transactions so far
  const parseTransactionHistory = async (event: {
    preventDefault: () => void;
  }) => {
    // prevent app from reloading
    event.preventDefault();

    // make sure user's wallet is connected
    if (!publicKey || !connection) {
      toast.error("Please connect wallet!");
      throw "Wallet not connected";
    }

    // api call to get tx history for wallet
    const response = await fetch(parseHistoryUrl);
    console.log(response, "this is respose");

    const data = await response.json();

    // set state of tx sigs
    setListOfTxs(data);

    console.log("parsed transaction history", data);
  };

  // retrieve the specific transaction user wants to view
  const handleTransactionDetails = (signature: string) => {
    const transaction = listOfTxs.find((tx) => tx.signature === signature);
    setTransactionDetails(transaction);
    setDisplayDetails(true);
  };

  // update url endpoints whenever wallet changes / set cluster of tx url
  React.useEffect(() => {
    setParseHistoryUrl(
      `https://api.helius.xyz/v0/addresses/${publicKey}/transactions?api-key=${HELIUS_API_KEY}`
    );
  }, [connection, publicKey]);

  return (
    <main>
      <style>{`
        main {
          max-width: 1792px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          padding: 16px;
          color: white;
        }
        form {
          border-radius: 8px;
          min-height: fit-content;
          background-color: #2a302f;
          padding: 16px;
        }
        form > div {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        h2 {
          font-size: 16px;
          font-weight: 600;
        }
        form button {
          background-color: #512da8;;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 600;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }
        form button:hover {
          border-color: #512da8;;
          background-color: transparent;
        }
        form button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        form > div + div {
          font-size: 12px;
          font-weight: 600;
          margin-top: 32px;
          background-color: #222524;
          border: 2px solid #808080;
          border-radius: 8px;
          padding: 8px;
        }
        form > div + div ul {
          padding: 8px;
        }
        form > div + div li {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        form > div + div li:not(:first-child) {
          margin-top: 16px;
        }
        form > div + div li p {
          letter-spacing: 0.04em;
        }
        form > div + div li button {
          display: flex;
          color: #80ebff;
          font-style: italic;
          transition: all 0.2s ease;
        }
        form > div + div li button:hover {
          color: white;
        }
        form > div + div li button svg {
          width: 20px;
          margin-left: 4px;
        }
      `}</style>
      <TransactionDetails
        transactionDetails={transactionDetails}
        displayDetails={displayDetails}
        setDisplayDetails={setDisplayDetails}
      />
      <form onSubmit={(event) => parseTransactionHistory(event)}>
        <div>
          <h2>Transaction Viewer 👀</h2>
          <button type="submit">Call Transactions</button>
        </div>

        {listOfTxs.length > 0 && (
          <div>
            <ul>
              {listOfTxs.map(({ signature }, index) => (
                <li key={signature}>
                  <p>Transaction:</p>
                  <button onClick={() => handleTransactionDetails(signature)}>
                    {signature.slice(0, 14)}...
                    <DocumentTextIcon />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </main>
  );
};

type TransactionDetailsProps = {
  transactionDetails: any; // Consider defining a more specific type
  displayDetails: boolean;
  setDisplayDetails: (displayDetails: boolean) => void; // Adjust as needed
};

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transactionDetails,
  displayDetails,
  setDisplayDetails,
}) => {
  return (
    <Transition.Root show={displayDetails} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setDisplayDetails}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              backdropFilter: "blur(4px)",
              transition: "opacity 0.3s ease",
            }}
          />
        </Transition.Child>

        <div
          style={{ position: "fixed", zIndex: 10, inset: 0, overflowY: "auto" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100%",
              padding: "16px",
            }}
          >
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-4"
            >
              <Dialog.Panel
                style={{
                  position: "relative",
                  backgroundColor: "#e4e4e4",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "left",
                  overflow: "hidden",

                  boxShadow: "0 0 16px rgba(0, 0, 0, 0.5)",
                  transform: "scale(1)",
                  transition: "all 0.3s ease",
                }}
              >
                <div>
                  <div
                    style={{
                      margin: "0 auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "48px",
                      width: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#eebcb2",
                      border: "2px solid #e44a2a",
                    }}
                  >
                    <CubeTransparentIcon
                      style={{
                        height: "24px",
                        width: "24px",
                        color: "#512da8;",
                      }}
                      aria-hidden="true"
                    />
                  </div>
                  <div style={{ textAlign: "center", marginTop: "12px" }}>
                    <Dialog.Title
                      as="h3"
                      style={{
                        fontSize: "16px",
                        lineHeight: "24px",
                        fontWeight: 500,
                        color: "#333",
                      }}
                    >
                      Scroll to view transaction details
                    </Dialog.Title>
                    <div
                      style={{
                        marginTop: "16px",
                        textAlign: "left",
                        height: "160px",
                        overflow: "scroll",
                        borderRadius: "8px",
                        padding: "8px",
                        border: "2px solid #d4d4d4",
                      }}
                    >
                      {Object.entries(transactionDetails).map(
                        ([key, value], index) =>
                          ((value !== null && typeof value !== "object") ||
                            !Array.isArray(value)) && (
                            <p key={index}>
                              <div
                                style={{
                                  border: "2px solid #e49f91",
                                  backgroundColor: "#eebcb2",
                                  borderRadius: "4px",
                                  margin: "16px 0",
                                  padding: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <p style={{ fontWeight: "bold" }}>{key}:</p>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <span style={{ fontWeight: "bold" }}>
                                      {value !== null
                                        ? typeof value === "string" ||
                                          typeof value === "number"
                                          ? value.toString().length > 10
                                            ? `${value
                                                .toString()
                                                .slice(0, 10)}...`
                                            : value
                                          : "Not Available"
                                        : "Not Available"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </p>
                          )
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "20px" }}>
                  <button
                    type="button"
                    style={{
                      display: "inline-flex",
                      justifyContent: "center",
                      width: "100%",
                      borderRadius: "4px",
                      border: "2px solid black",
                      boxShadow: "0 0 4px rgba(0, 0, 0, 0.5)",
                      padding: "8px 16px",
                      backgroundColor: "black",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => setDisplayDetails(false)}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default page;


