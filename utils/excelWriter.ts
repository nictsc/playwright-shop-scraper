import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

// ===== File setup =====

// Get today's date (YYYY-MM-DD) in Sydney timezone
const today = new Date().toLocaleString('en-AU', {
  timeZone: 'Australia/Sydney',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).split('/').reverse().join('-');

// Build filename using the date
const OUTPUT_PATH = path.resolve('results', `${today}-WOW.xlsx`);

export interface ScrapedProduct {
  extractDate: string;
  productName: string;
  productPrice: string;   // "5.25" or "N/A"
  productURL: string;
  stockStatus: 'In Stock' | 'Out of Stock';
}

let workbook: ExcelJS.Workbook;
let sheet: ExcelJS.Worksheet;
// Initialise workbook (call once before writing rows)
export async function initExcel() {
  workbook = new ExcelJS.Workbook();

  if (fs.existsSync(OUTPUT_PATH)) {
    await workbook.xlsx.readFile(OUTPUT_PATH);
    sheet = workbook.getWorksheet('Scraped Products')!;
  } else {
    sheet = workbook.addWorksheet('Scraped Products');

    sheet.columns = [
      { header: 'Extract Date', key: 'extractDate', width: 15 },
      { header: 'Product Name', key: 'productName', width: 40 },
      { header: 'Product Price', key: 'productPrice', width: 15 },
      { header: 'Product URL', key: 'productURL', width: 50 },
      { header: 'Stock Status', key: 'stockStatus', width: 15 },
    ];

    await workbook.xlsx.writeFile(OUTPUT_PATH);
  }
}

// Append a single scraped row
export async function writeRow(data: ScrapedProduct) {
  sheet.addRow({
    extractDate: data.extractDate,
    productName: data.productName,
    productPrice: data.productPrice,
    productURL: data.productURL,
    stockStatus: data.stockStatus,
  });

  await workbook.xlsx.writeFile(OUTPUT_PATH);
}
