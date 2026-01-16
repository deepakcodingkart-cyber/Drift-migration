// import csv from "csv-parser";
// import { Readable } from "stream";

// export default function parseCsv(buffer) {
//   return new Promise((resolve, reject) => {
//     const rows = [];

//     Readable.from(buffer)
//       .pipe(csv())
//       .on("data", (data) => rows.push(data))
//       .on("end", () => resolve(rows))
//       .on("error", reject);
//   });
// }
