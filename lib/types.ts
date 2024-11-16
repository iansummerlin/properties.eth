import { z } from "zod";

export enum Networks {
  Hardhat = 31337,
}

const AttributeSchema = z.object({
  trait_type: z.string(),
  value: z.union([z.string(), z.number()]),
});

export const PropertySchema = z.object({
  name: z.string(),
  address: z.string(),
  description: z.string(),
  image: z.string(),
  id: z.string(),
  attributes: z.array(AttributeSchema),
});

export type Property = z.infer<typeof PropertySchema>;
