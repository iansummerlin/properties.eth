"use client";
import Dialog from "@/components/dialog";
import { createContext, ReactNode, useState } from "react";

// Handle open state for the dialog
type OpenProps = {
  title: string;
  content: ReactNode;
  footer?: ReactNode;
};
type HandleOpen = (props: OpenProps) => void;

// Context props for the dialog
type DialogContextProps = Readonly<{
  handleOpen: HandleOpen;
}>;

// Initial state for the dialog
const initialState: DialogContextProps = {
  handleOpen: () => {},
};

// Context for the dialog
export const DialogContext = createContext(initialState);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<ReactNode | null>(null);
  const [footer, setFooter] = useState<ReactNode | null>(null);

  const handleOpen = (props: OpenProps) => {
    setTitle(props.title);
    setContent(props.content);
    setFooter(props.footer);
    setOpen(true);
  };

  return (
    <DialogContext.Provider
      value={{
        handleOpen,
      }}
    >
      {children}
      <Dialog
        open={open}
        setOpen={setOpen}
        title={title}
        content={content}
        footer={footer}
      />
    </DialogContext.Provider>
  );
};
