import { shopifyQuery } from "../../shopify/graphql.js";

/**
 * Create Shopify Subscription (PAUSED)
 * - Shopify API ke ALL required fields included
 * - ONLY minCycles / maxCycles optional
 */
export async function createSubscription({
  customerId,
  paymentMethodId,
  row
}) {
  if (!customerId) throw new Error("customerId is required");
  if (!paymentMethodId) throw new Error("paymentMethodId is required");

  // REQUIRED CSV FIELDS (as per Shopify API usage)
  if (!row.VariantId) throw new Error("VariantId is required");
  if (!row.Quantity) throw new Error("Quantity is required");
  if (!row.Price) throw new Error("Price is required");
  if (!row.Currency) throw new Error("Currency is required");
  if (!row.NextBillingDate) throw new Error("NextBillingDate is required");

  if (!row.BillingInterval || !row.BillingIntervalCount) {
    throw new Error("Billing interval info required");
  }

  if (!row.DeliveryInterval || !row.DeliveryIntervalCount) {
    throw new Error("Delivery interval info required");
  }

  // ADDRESS (REQUIRED)
  const address = {
    firstName: row.FirstName,
    lastName: row.LastName,
    address1: row.Address1,
    city: row.City,
    province: row.Province,
    country: row.Country,
    zip: row.Zip
  };

  for (const [key, val] of Object.entries(address)) {
    if (!val) {
      throw new Error(`Missing address field: ${key}`);
    }
  }

  /* ===============================
     BILLING POLICY
     (ONLY min/max optional)
  =============================== */
  const billingPolicy = {
    interval: row.BillingInterval,              // MONTH
    intervalCount: Number(row.BillingIntervalCount)
  };

  if (row.MinCycles) {
    billingPolicy.minCycles = Number(row.MinCycles);
  }

  if (row.MaxCycles) {
    billingPolicy.maxCycles = Number(row.MaxCycles);
  }

  /* ===============================
     SUBSCRIPTION INPUT (FULL)
  =============================== */
  const input = {
    customerId,
    nextBillingDate: row.NextBillingDate,
    currencyCode: row.Currency,

    lines: [
      {
        line: {
          productVariantId: row.VariantId,
          quantity: Number(row.Quantity),
          currentPrice: Number(row.Price)
        }
      }
    ],

    contract: {
      status: "PAUSED",
      paymentMethodId,

      billingPolicy,

      deliveryPolicy: {
        interval: row.DeliveryInterval,
        intervalCount: Number(row.DeliveryIntervalCount)
      },

      deliveryPrice: Number(row.DeliveryPrice),

      deliveryMethod: {
        shipping: {
          address
        }
      }
    }
  };

  /* ===============================
     GRAPHQL MUTATION
  =============================== */
  const mutation = `
    mutation subscriptionCreate(
      $input: SubscriptionContractAtomicCreateInput!
    ) {
      subscriptionContractAtomicCreate(input: $input) {
        contract {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await shopifyQuery(mutation, { input });

  const result = res?.subscriptionContractAtomicCreate;

  if (!result) {
    throw new Error("Empty Shopify response");
  }

  if (result.userErrors?.length) {
    throw new Error(
      result.userErrors.map(e => e.message).join("; ")
    );
  }

  if (!result.contract?.id) {
    throw new Error("Subscription ID missing");
  }

  return result.contract.id;
}
