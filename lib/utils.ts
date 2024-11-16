import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Property } from "./types";

// ShadCN utils
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Property
export function isPrice(trait: Property["attributes"][0]["trait_type"]) {
  return trait === "Listing Price" || trait === "List Price";
}

export function getPrice(property: Property) {
  const price =
    property.attributes.find(
      (attr) =>
        attr.trait_type === "Listing Price" || attr.trait_type === "List Price"
    )?.value || "Make offer";
  if (price === "Make offer") return price;

  const formatedPrice = price.toString().replace("$", "").replace("€", "");

  return `$${formatedPrice}`;
}

// String
export function truncate(str: string, length: number) {
  return str.length > length ? str.substring(0, length) + "..." : str;
}
