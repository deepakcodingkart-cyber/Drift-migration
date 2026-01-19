// import { Parser } from "json2csv";

// export function errorsToCsv(errors, rows) {
//   const csvRows = errors.map(err => ({
//     Row: err.row,
//     Field: err.field,
//     "Error Message": err.message,
//     "Original Value":
//       rows[err.row - 1]?.[err.field] ?? ""
//   }));

//   const parser = new Parser({
//     fields: [
//       "Row",
//       "Field",
//       "Error Message",
//       "Original Value"
//     ]
//   });

//   return parser.parse(csvRows);
// }
