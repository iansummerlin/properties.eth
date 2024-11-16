import { useContext } from "react";
import { DialogContext } from "../store/dialogProvider";

export function useDialog() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error("useDialog must be used within an DialogProvider");
  }

  return context;
}
