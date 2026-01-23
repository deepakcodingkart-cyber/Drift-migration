/**
 * Build Shopify CustomerPaymentMethodRemoteInput
 * based on ACTUAL CSV structures
 */
export function buildRemotePaymentReference(file_type, row) {

  // ========================
  // STRIPE
  // ========================
  if (file_type === "stripe_payment_csv") {
    console.log("row in stripe", row);  
    const stripeCustomerId = row["id"];          // cus_xxx
    const stripePaymentMethodId = row["Card ID"]; // pm_xxx

    if (!stripeCustomerId || !stripePaymentMethodId) {
      throw new Error("Missing Stripe customer id or card id");
    }

    console.log("stripeCustomerId", stripeCustomerId);
    console.log("stripePaymentMethodId", stripePaymentMethodId);

    return {
      provider: "stripe",
      external_payment_id: stripePaymentMethodId,
      remoteReference: {
        stripePaymentMethod: {
          customerId: stripeCustomerId,
          paymentMethodId: stripePaymentMethodId
        }
      }
    };
  }

  // ========================
  // PAYPAL
  // ========================
  if (file_type === "paypal_payment_csv") {
    console.log("row in paypal", row);  
    const paypalId = row["Paypal ID"];

    if (!paypalId) {
      throw new Error("Missing Paypal ID");
    }

    return {
      provider: "paypal",
      external_payment_id: paypalId,
      remoteReference: {
        paypalBillingAgreement: {
          billingAgreementId: paypalId
        }
      }
    };
  }

  // ========================
  // BRAINTREE
  // ========================
  if (file_type === "payment_braintree_csv") {
    console.log("row in braintree", row);  
    const braintreeCustomerId = row["id"];
    const paymentToken = row["Payment Method Token"];

    if (!braintreeCustomerId || !paymentToken) {
      throw new Error("Missing Braintree customer id or payment token");
    }

    return {
      provider: "braintree",
      external_payment_id: paymentToken,
      remoteReference: {
        braintreePaymentMethod: {
          customerId: braintreeCustomerId,
          paymentMethodToken: paymentToken
        }
      }
    };
  }

  // ========================
  // AUTHORIZE.NET
  // ========================
  if (file_type === "authorizedotnet_payment_csv") {
    console.log("row in authorize.net", row);  
    const customerProfileId = row["Customer Profile Id"];
    const customerPaymentProfileId = row["Customer Payment Profile Id"];

    if (!customerProfileId || !customerPaymentProfileId) {
      throw new Error("Missing Authorize.Net profile ids");
    }

    return {
      provider: "authorizedotnet",
      external_payment_id: customerPaymentProfileId,
      remoteReference: {
        authorizeNetCustomerPaymentProfile: {
          customerProfileId,
          customerPaymentProfileId
        }
      }
    };
  }

  // ========================
  // UNSUPPORTED
  // ========================
  throw new Error(`Unsupported payment file_type: ${file_type}`);
}
