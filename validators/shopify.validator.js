import { checkCustomerExists } from "../services/customer.service.js";
import { getStoreSupportedCurrencies } from "../services/storeCurrency.service.js";
import { checkVariantExists } from "../services/variant.service.js";

export async function shopifyValidation(row, rowIndex) {

  const errors = [];
  const rowNumber = rowIndex + 1;

  /* ---------- CUSTOMER CHECK ---------- */
  const customerId = row["Customer ID"];
  const customerExists = await checkCustomerExists(customerId);

  if (!customerExists) {
    errors.push({
      row: rowNumber,
      field: "Customer ID",
      message: "Customer does not exist in this Shopify store"
    });
  }

  /* ---------- CURRENCY CHECK (only if format is valid) ---------- */
  const currency = row["Currency Code"]?.toUpperCase();

  if (typeof currency === "string" && currency.length === 3) {
    const storeCurrencies = await getStoreSupportedCurrencies();

    if (!storeCurrencies.includes(currency)) {
      errors.push({
        row: rowNumber,
        field: "Currency Code",
        message: `Currency ${currency} is not supported by this store`
      });
    }
  }

  /* ---------- VARIANT CHECK ---------- */
  const variantId = row["Variant ID"];
  const variantExists = await checkVariantExists(variantId);

  if (!variantExists) {
    errors.push({
      row: rowNumber,
      field: "Variant ID",
      message: "Variant does not exist in this Shopify store"
    });
  }

  return errors;
}
