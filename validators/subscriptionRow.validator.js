const INTERVALS = ["DAY", "WEEK", "MONTH", "YEAR"];
const STATUS_VALUES = ["active", "paused", "cancelled"];
import { ALLOWED_CURRENCIES } from "../constants/allowedCurrencies.js";
import { ALLOWED_COUNTRY_CODES } from "../constants/allowedCountryCodes.js";
import { validateZipAndProvince } from "../services/zipValidation.service.js";

function isEmpty(val) {
  return val === null || val === undefined || val === "";
}

function isPositiveInt(val) {
  return Number.isInteger(Number(val)) && Number(val) > 0;
}

const OPTIONAL_FIELDS = [
  "Delivery company",
  "Delivery address 2"
];

function validateRequiredFields(row, rowNumber, errors) {
  Object.keys(row).forEach((field) => {
    if (OPTIONAL_FIELDS.includes(field)) return;

    if (isEmpty(row[field])) {
      errors.push({
        row: rowNumber,
        field,
        message: `${field} is required and cannot be null`
      });
    }
  });
}

function validateStatus(row, rowNumber, errors) {
  if (
    row.Status &&
    !STATUS_VALUES.includes(row.Status.toLowerCase())
  ) {
    errors.push({
      row: rowNumber,
      field: "Status",
      message: "Status must be one of: active, paused, cancelled"
    });
  }
}

function validateInterval({
  type,
  count,
  typeField,
  countField,
  rowNumber,
  errors
}) {
  if (!INTERVALS.includes(type)) {
    errors.push({
      row: rowNumber,
      field: typeField,
      message: `${typeField} must be DAY, WEEK, MONTH, or YEAR`
    });
  }

  if (!isPositiveInt(count)) {
    errors.push({
      row: rowNumber,
      field: countField,
      message: `${countField} must be a positive integer`
    });
  }
}

function validateBillingDeliveryRelation(
  billingType,
  billingCount,
  deliveryType,
  deliveryCount,
  rowNumber,
  errors
) {
  // Safety check
  if (
    !billingType ||
    !deliveryType ||
    !isPositiveInt(billingCount) ||
    !isPositiveInt(deliveryCount)
  ) {
    return;
  }

  // ❌ Rule 1: Interval type must be same
  if (billingType !== deliveryType) {
    errors.push({
      row: rowNumber,
      field: "Billing/Delivery interval",
      message:
        "Billing interval type and delivery interval type must be the same"
    });
    return;
  }

  // ❌ Rule 2: Delivery cannot be greater than billing
  if (deliveryCount > billingCount) {
    errors.push({
      row: rowNumber,
      field: "Billing/Delivery interval",
      message:
        "Delivery interval count cannot be greater than billing interval count"
    });
    return;
  }

  // ❌ Rule 3: Billing must be divisible by delivery
  if (billingCount % deliveryCount !== 0) {
    errors.push({
      row: rowNumber,
      field: "Billing/Delivery interval",
      message:
        "Delivery interval count must evenly divide the billing interval count"
    });
  }
}

function validateVariant(row, rowNumber, errors) {
  if (!isPositiveInt(row["Variant quantity"])) {
    errors.push({
      row: rowNumber,
      field: "Variant quantity",
      message: "Variant quantity must be a positive integer"
    });
  }

  if (isNaN(Number(row["Variant price"]))) {
    errors.push({
      row: rowNumber,
      field: "Variant price",
      message: "Variant price must be a valid number"
    });
  }
}

function validateCurrency(row, rowNumber, errors) {
  const currency = row["Currency Code"]?.toUpperCase();

  if (
    typeof currency !== "string" ||
    currency.length !== 3
  ) {
    errors.push({
      row: rowNumber,
      field: "Currency Code",
      message: "Currency Code must be a valid 3-letter ISO code (e.g. USD)"
    });
    return;
  }

  if (!ALLOWED_CURRENCIES.includes(currency)) {
    errors.push({
      row: rowNumber,
      field: "Currency Code",
      message: `Currency ${currency} is not allowed`
    });
  }
}

async function validateCountryZipProvince(row, rowNumber, errors) {
  const countryCodeRaw = row["Delivery country code"];
  const zipCode = row["Delivery zip"];
  const provinceCode = row["Delivery province code"]?.toUpperCase();

  if (!countryCodeRaw) {
    errors.push({
      row: rowNumber,
      field: "Delivery country code",
      message: "Delivery country code is required"
    });
    return;
  }

  const countryCode = countryCodeRaw.toUpperCase();

  if (countryCode.length !== 2) {
    errors.push({
      row: rowNumber,
      field: "Delivery country code",
      message: "Country Code must be a valid 2-letter ISO code (e.g. IN, US)"
    });
    return;
  }

  if (!ALLOWED_COUNTRY_CODES.includes(countryCode)) {
    errors.push({
      row: rowNumber,
      field: "Delivery country code",
      message: `Country Code ${countryCode} is not allowed`
    });
    return;
  }

  if (zipCode && provinceCode) {
    const result = await validateZipAndProvince({
      countryCode,
      zipCode,
      provinceCode
    });

    if (!result.valid) {
      errors.push({
        row: rowNumber,
        field: "Delivery zip",
        message: result.error
      });
    }
  }
}

export async function validateSubscriptionRow(row, index) {
  const errors = [];
  const rowNumber = index + 1;

  validateRequiredFields(row, rowNumber, errors);
  validateStatus(row, rowNumber, errors);

  const billingType = row["Billing interval type"]?.toUpperCase();
  const billingCount = row["Billing interval count"];

  const deliveryType = row["Delivery interval type"]?.toUpperCase();
  const deliveryCount = row["Delivery interval count"];

  validateInterval({
    type: billingType,
    count: billingCount,
    typeField: "Billing interval type",
    countField: "Billing interval count",
    rowNumber,
    errors
  });

  validateInterval({
    type: deliveryType,
    count: deliveryCount,
    typeField: "Delivery interval type",
    countField: "Delivery interval count",
    rowNumber,
    errors
  });

  validateBillingDeliveryRelation(
    billingType,
    billingCount,
    deliveryType,
    deliveryCount,
    rowNumber,
    errors
  );

  validateVariant(row, rowNumber, errors);
  validateCurrency(row, rowNumber, errors);
  await validateCountryZipProvince(row, rowNumber, errors);

  return errors;
}
