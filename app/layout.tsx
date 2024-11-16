import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { EthProvider } from "@/lib/store/ethProvider";
import { DialogProvider } from "@/lib/store/dialogProvider";
import { MainNavigation } from "@/components/main-nav";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "properties.eth",
  description:
    "A collection of properties for sale and rent on the blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <EthProvider>
          <DialogProvider>
            <MainNavigation />
            {children}
          </DialogProvider>
        </EthProvider>
        <Footer />
      </body>
    </html>
  );
}
