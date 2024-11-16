import { useContext } from "react";
import { EthContext } from "@/lib/store/ethProvider";

export function useEth() {
  const context = useContext(EthContext);
  if (context === undefined) {
    throw new Error("useEth must be used within an EthProvider");
  }

  return context;
}
