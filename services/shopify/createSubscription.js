import { shopifyQuery } from "../../shopify/graphql.js";

/**
 * Create Shopify Subscription (PAUSED)
 * - CSV based input mapping
 */
export async function createSubscription({
  customerId,
  paymentMethodId,
  row
}) {
  console.log("Creating subscription...");
  console.log("customerId:", customerId);
  console.log("paymentMethodId:", paymentMethodId);
  console.log("row:", row);

  if (!customerId) throw new Error("customerId is required");
  if (!paymentMethodId) throw new Error("paymentMethodId is required");

  /* ===============================
     REQUIRED CSV FIELDS
  =============================== */
  if (!row["Variant ID"]) throw new Error("Variant ID is required");
  if (!row["Variant quantity"]) throw new Error("Variant quantity is required");
  if (!row["Variant price"]) throw new Error("Variant price is required");
  if (!row["Currency Code"]) throw new Error("Currency Code is required");
  if (!row["Next order date"]) throw new Error("Next order date is required");

  if (!row["Billing interval type"] || !row["Billing interval count"]) {
    throw new Error("Billing interval info required");
  }

  if (!row["Delivery interval type"] || !row["Delivery interval count"]) {
    throw new Error("Delivery interval info required");
  }

  /* ===============================
     ADDRESS (DELIVERY)
  =============================== */
  const address = {
    firstName: row["Delivery first name"],
    lastName: row["Delivery last name"],
    address1: row["Delivery address 1"],
    city: row["Delivery city"],
    province: row["Delivery province code"],
    country: row["Delivery country code"],
    zip: row["Delivery zip"],
  };
  const localDeliveryOption = {
    phone: row["Delivery phone"]
  };

  for (const [key, val] of Object.entries(address)) {
    if (!val) {
      throw new Error(`Missing address field: ${key}`);
    }
  }

  /* ===============================
     BILLING POLICY
  =============================== */
  const billingPolicy = {
    interval: row["Billing interval type"].toUpperCase(), // WEEK / MONTH
    intervalCount: Number(row["Billing interval count"])
  };

  /* ===============================
     SUBSCRIPTION INPUT
  =============================== */
  const input = {
    customerId,
    nextBillingDate: row["Next order date"],
    currencyCode: row["Currency Code"],

    lines: [
      {
        line: {
          productVariantId: `gid://shopify/ProductVariant/${row["Variant ID"]}`,
          quantity: Number(row["Variant quantity"]),
          currentPrice: Number(row["Variant price"])
        }
      }
    ],

    contract: {
      status: "PAUSED",
      paymentMethodId,

      billingPolicy,

      deliveryPolicy: {
        interval: row["Delivery interval type"].toUpperCase(),
        intervalCount: Number(row["Delivery interval count"])
      },

      deliveryPrice: Number(row["Shipping Price"] || 0),

      deliveryMethod: {
        localDelivery: {
          address,
          localDeliveryOption
        }
      }
    }
  };
  console.log("Shopify Input:", JSON.stringify(input, null, 2));

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
  console.log("Shopify Response:", JSON.stringify(res, null, 2));

  const result = res?.subscriptionContractAtomicCreate;

  if (!result) throw new Error("Empty Shopify response");

  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map(e => e.message).join("; "));
  }

  if (!result.contract?.id) {
    throw new Error("Subscription ID missing");
  }

  console.log("✅ Subscription created:", result.contract.id);
  return result.contract.id;
}
