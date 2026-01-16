
// // Only these two are optional
// const OPTIONAL_FIELDS = [
//   "Delivery company",
//   "Delivery address 2"
// ];

// // Used for interval relationship check
// const INTERVAL_IN_DAYS = {
//   DAY: 1,
//   WEEK: 7,
//   MONTH: 30,
//   YEAR: 365
// };

// function isEmpty(val) {
//   return val === null || val === undefined || val === "";
// }

// function isPositiveInt(val) {
//   return Number.isInteger(Number(val)) && Number(val) > 0;
// }

// export async function validateSubscriptionRow(row, index) {
//   console.log("inside the validator")
//   const errors = [];
//   const rowNumber = index + 1;

//   /* ---------- REQUIRED FIELD CHECK ---------- */
//   Object.keys(row).forEach((field) => {
//     if (OPTIONAL_FIELDS.includes(field)) return;

//     if (isEmpty(row[field])) {
//       errors.push({
//         row: rowNumber,
//         field,
//         message: `${field} is required and cannot be null`
//       });
//     }
//   });

//   /* ---------- STATUS ---------- */
//   if (
//     row.Status &&
//     !STATUS_VALUES.includes(row.Status.toLowerCase())
//   ) {
//     errors.push({
//       row: rowNumber,
//       field: "Status",
//       message: "Status must be one of: active, paused, cancelled"
//     });
//   }

//   /* ---------- BILLING INTERVAL ---------- */
//   const billingType = row["Billing interval type"]?.toUpperCase();
//   const billingCount = row["Billing interval count"];

//   if (!INTERVALS.includes(billingType)) {
//     errors.push({
//       row: rowNumber,
//       field: "Billing interval type",
//       message: "Billing interval type must be DAY, WEEK, MONTH, or YEAR"
//     });
//   }

//   if (!isPositiveInt(billingCount)) {
//     errors.push({
//       row: rowNumber,
//       field: "Billing interval count",
//       message: "Billing interval count must be a positive integer"
//     });
//   }

//   /* ---------- DELIVERY INTERVAL ---------- */
//   const deliveryType = row["Delivery interval type"]?.toUpperCase();
//   const deliveryCount = row["Delivery interval count"];

//   if (!INTERVALS.includes(deliveryType)) {
//     errors.push({
//       row: rowNumber,
//       field: "Delivery interval type",
//       message: "Delivery interval type must be DAY, WEEK, MONTH, or YEAR"
//     });
//   }

//   if (!isPositiveInt(deliveryCount)) {
//     errors.push({
//       row: rowNumber,
//       field: "Delivery interval count",
//       message: "Delivery interval count must be a positive integer"
//     });
//   }

//   /* ---------- BILLING vs DELIVERY RELATIONSHIP ---------- */
//   if (
//     INTERVAL_IN_DAYS[billingType] &&
//     INTERVAL_IN_DAYS[deliveryType] &&
//     isPositiveInt(billingCount) &&
//     isPositiveInt(deliveryCount)
//   ) {
//     const billingDays =
//       INTERVAL_IN_DAYS[billingType] * Number(billingCount);

//     const deliveryDays =
//       INTERVAL_IN_DAYS[deliveryType] * Number(deliveryCount);

//     // ❌ Billing cannot be more frequent than delivery
//     if (billingDays < deliveryDays) {
//       errors.push({
//         row: rowNumber,
//         field: "Billing/Delivery interval",
//         message:
//           "Billing frequency cannot be more frequent than delivery frequency"
//       });
//     }
//   }

//   /* ---------- VARIANT ---------- */
//   if (!isPositiveInt(row["Variant quantity"])) {
//     errors.push({
//       row: rowNumber,
//       field: "Variant quantity",
//       message: "Variant quantity must be a positive integer"
//     });
//   }

//   if (isNaN(Number(row["Variant price"]))) {
//     errors.push({
//       row: rowNumber,
//       field: "Variant price",
//       message: "Variant price must be a valid number"
//     });
//   }

//   /* ---------- CURRENCY ---------- */
//   /* ---------- CURRENCY ---------- */
//   const currency = row["Currency Code"]?.toUpperCase();

//   // STEP 1: basic ISO format check
//   if (
//     typeof currency !== "string" ||
//     currency.length !== 3
//   ) {
//     errors.push({
//       row: rowNumber,
//       field: "Currency Code",
//       message: "Currency Code must be a valid 3-letter ISO code (e.g. USD)"
//     });

//   } else {
//     // STEP 2: allowed currency list check (ONLY if format is valid)
//     if (!ALLOWED_CURRENCIES.includes(currency)) {
//       errors.push({
//         row: rowNumber,
//         field: "Currency Code",
//         message: `Currency ${currency} is not allowed`
//       });
//     }
//   }
//   /* ---------- COUNTRY CODE ---------- */
//   /* ---------- COUNTRY + ZIP + PROVINCE VALIDATION ---------- */

//   const countryCodeRaw = row["Delivery country code"];

//   const zipCode = row["Delivery zip"];
//   const provinceCode = row["Delivery province code"]?.toUpperCase();

//   /* STEP 0: NULL / EMPTY CHECK */
//   if (!countryCodeRaw) {
//     errors.push({
//       row: rowNumber,
//       field: "Delivery country code",
//       message: "Delivery country code is required"
//     });

//   } else {
//     const countryCode = countryCodeRaw.toUpperCase();

//     /* STEP 1: LENGTH CHECK */
//     if (countryCode.length !== 2) {
//       errors.push({
//         row: rowNumber,
//         field: "Delivery country code",
//         message: "Country Code must be a valid 2-letter ISO code (e.g. IN, US)"
//       });

//     }
//     /* STEP 2: ALLOWED COUNTRY CHECK */
//     else if (!ALLOWED_COUNTRY_CODES.includes(countryCode)) {
//       errors.push({
//         row: rowNumber,
//         field: "Delivery country code",
//         message: `Country Code ${countryCode} is not allowed`
//       });
//     }
//     /* STEP 3: ZIP + PROVINCE CHECK (ONLY IF ABOVE 3 PASS) */
//     // else if (zipCode && provinceCode) {

//     //   const zipData = await validateZipAndProvince(countryCode, zipCode);

//     //   /* ZIP INVALID */
//     //   if (!zipData) {
//     //     errors.push({
//     //       row: rowNumber,
//     //       field: "Delivery zip",
//     //       message: `ZIP code ${zipCode} is not valid for country ${countryCode}`
//     //     });
//     //   } 
//     //   /* ZIP VALID → CHECK PROVINCE */
//     //   else {
//     //     const apiStates =
//     //       zipData.places?.map(p => p["state abbreviation"]) || [];

//     //     if (!apiStates.includes(provinceCode)) {
//     //       errors.push({
//     //         row: rowNumber,
//     //         field: "Delivery province code",
//     //         message: `Province code ${provinceCode} does not match ZIP ${zipCode}`
//     //       });
//     //     }
//     //   }
//     // }
//     /* STEP 3: ZIP + PROVINCE CHECK (ONLY IF ABOVE PASS) */
//     else if (zipCode && provinceCode) {

//       const result = await validateZipAndProvince({
//         countryCode,
//         zipCode,
//         provinceCode
//       });

//       if (!result.valid) {
//         errors.push({
//           row: rowNumber,
//           field: "Delivery zip",
//           message: result.error
//         });
//       }
//     }

//   }

//   return errors;
// }

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
