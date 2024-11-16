"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Types
import { Networks, PropertySchema, Property as PropertyType } from "../types";

// HooksWS
import { useEth } from "./useEth";

// ABIs
import Property from "../abis/Property.json";
import Escrow from "../abis/Escrow.json";

// Config
import config from "../config.json";

export const useData = () => {
  const { provider } = useEth();
  const [escrow, setEscrow] = useState<ethers.Contract | null>(null);
  const [properties, setProperties] = useState<PropertyType[]>([]);
  console.log("🚀 ~ useData ~ properties:", properties);

  useEffect(() => {
    const loadData = async () => {
      if (!provider) {
        console.log("no provider");
        return;
      }
      const network = await provider.getNetwork();
      console.log("🚀 ~ loadData ~ network:", network);
      // ⬇️ Below we cast to Networks as the config is parsed as const and complains about a string value
      const chainId = network.chainId as unknown as Networks;
      console.log("🚀 ~ loadData ~ chainId:", chainId);
      const escrowAddress = config[chainId].escrow.address;
      const propertyAddress = config[chainId].property.address;

      // Handle escrow contract
      const escrowContract = new ethers.Contract(
        escrowAddress,
        Escrow,
        provider
      );
      setEscrow(escrowContract);

      // Handle property data
      const propertyContract = new ethers.Contract(
        propertyAddress,
        Property,
        provider
      );
      const totalSupply = await propertyContract.totalSupply();

      const propertyData: PropertyType[] = [];

      for (let i = 1; i <= totalSupply; i++) {
        let metadata;
        try {
          const tokenURI = await propertyContract.tokenURI(i);
          const response = await fetch(tokenURI);
          metadata = await response.json();
        } catch (error) {
          // TODO: handle error
          console.error(error);
        }

        try {
          const parsedMetadata = PropertySchema.parse(metadata);
          propertyData.push(parsedMetadata);
        } catch (error) {
          // TODO: handle error
          console.error(error);
        }
      }

      setProperties(propertyData);
    };

    loadData();
  }, [provider]);

  return {
    escrow,
    properties,
  };
};
