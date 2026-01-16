import parseFile from "../utils/fileParser.js";
import { validateSubscriptionRow } from "../validators/subscriptionRow.validator.js";
import { shopifyValidation } from "../validators/shopify.validator.js";

// export async function validateCsvController(req, res) {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "File is required"
//       });
//     }

//     const rows = parseFile(req.file.buffer);

//     const allErrors = [];
//     const validRows = [];

//     for (let index = 0; index < rows.length; index++) {
//       const row = rows[index];

//       /* ---------- STEP 1: LOCAL VALIDATION ---------- */
//       const rowErrors = validateSubscriptionRow(row, index);

//       if (rowErrors.length > 0) {
//         allErrors.push(...rowErrors);
//         continue;
//       }

//       /* ---------- STEP 2: SHOPIFY VALIDATION SERVICE ---------- */
//       const shopifyErrors =
//         await shopifyValidation(row, index);

//       if (shopifyErrors.length > 0) {
//         allErrors.push(...shopifyErrors);
//         continue;
//       }

//       /* ---------- STEP 3: FULLY VALID ---------- */
//       validRows.push(row);
//     }

//     return res.json({
//       success: true,
//       totalRows: rows.length,
//       validRows: validRows.length,
//       errorCount: allErrors.length,
//       errors: allErrors,
//       data: validRows
//     });

//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to parse / validate file",
//       error: err.message
//     });
//   }
// }

export async function validateCsvController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required"
      });
    }

    const rows = parseFile(req.file.buffer);

    const allErrors = [];
    const validRows = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];

      /* ---------- STEP 1: LOCAL VALIDATION ---------- */
      const rowErrors = await validateSubscriptionRow(row, index);

      /* ---------- STEP 2: SHOPIFY VALIDATION ---------- */
      const shopifyErrors = await shopifyValidation(row, index);

      /* ---------- COLLECT ALL ERRORS ---------- */
      const combinedErrors = [
        ...rowErrors,
        ...shopifyErrors
      ];

      if (combinedErrors.length > 0) {
        allErrors.push(...combinedErrors);
        continue;
      }

      /* ---------- STEP 3: FULLY VALID ---------- */
      validRows.push(row);
    }

    return res.json({
      success: true,
      totalRows: rows.length,
      validRows: validRows.length,
      errorCount: allErrors.length,
      errors: allErrors,
      data: validRows
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to parse / validate file",
      error: err.message
    });
  }
}
