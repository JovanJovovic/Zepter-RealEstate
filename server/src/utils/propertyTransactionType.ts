import type { PropertyTransactionType } from "../models/Property.js";

export const PROPERTY_TRANSACTION_TYPE_ERROR =
  'transactionType must be either "rent" or "sale".';

export const normalizePropertyTransactionType = (
  value: unknown,
  fallback: PropertyTransactionType = "rent"
): PropertyTransactionType => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (value === "rent" || value === "sale") {
    return value;
  }

  throw new Error(PROPERTY_TRANSACTION_TYPE_ERROR);
};
