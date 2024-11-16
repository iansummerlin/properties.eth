"use client";
import { ethers } from "ethers";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Connected ethereum provider via metamask
type Provider = ethers.BrowserProvider | null;

// Connected ethereum account via metamask
type Account = string | null;

// Setter for the connected ethereum account state
type SetAccount = Dispatch<SetStateAction<Account>>;

// Context props for the connected ethereum account
type EthContextProps = Readonly<{
  provider: Provider;
  account: Account;
  setAccount: SetAccount;
}>;

// Initial state for the connected ethereum account
const initialState: EthContextProps = {
  provider: null,
  account: null,
  setAccount: () => {},
};

// Context for the connected ethereum account
export const EthContext = createContext(initialState);

// Provider for the connected ethereum account
export const EthProvider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<Provider>(null);
  const [account, setAccount] = useState<Account>(null);

  useEffect(() => {
    const loadProvider = async () => {
      if (!window.ethereum) {
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      // Handle account change listener
      window.ethereum.on("accountsChanged", async () => {
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
      });
    };

    loadProvider();
  }, []);

  return (
    <EthContext.Provider
      value={{
        provider,
        account,
        setAccount,
      }}
    >
      {children}
    </EthContext.Provider>
  );
};
