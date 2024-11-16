"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEth } from "@/lib/hooks";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";

const LOGO_SIZE = 150;

export function MainNavigation() {
  const pathName = usePathname();
  const { provider, account, setAccount } = useEth();
  const isActive = (path: string) => pathName === path;
  const handleConnect = async () => {
    if (!provider) {
      // TODO: Handle no provider
      return;
    }
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  };
  const handleDisconnect = () => {};

  return (
    <header className="sticky top-0 flex items-center gap-4 border-b bg-background px-4 md:px-6">
      <NavigationMenu>
        <Image
          src="/logo.png"
          alt="logo"
          height={LOGO_SIZE}
          width={LOGO_SIZE}
        />
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink
                className={`${navigationMenuTriggerStyle()} ${
                  isActive("/") ? "bg-gray-200" : ""
                }`}
              >
                Buy
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/sell" legacyBehavior passHref>
              <NavigationMenuLink
                className={`${navigationMenuTriggerStyle()} ${
                  isActive("/sell") ? "bg-gray-200" : ""
                }`}
              >
                Sell
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/rent" legacyBehavior passHref>
              <NavigationMenuLink
                className={`${navigationMenuTriggerStyle()} ${
                  isActive("/rent") ? "bg-gray-200" : ""
                }`}
              >
                Rent
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
        <div className="flex flex-1 justify-end">
          <Button onClick={account ? handleDisconnect : handleConnect}>
            {account
              ? account.slice(0, 6) + "..." + account.slice(38, 42)
              : "Connect"}
          </Button>
        </div>
      </NavigationMenu>
    </header>
  );
}
