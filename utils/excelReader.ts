import ExcelJS from 'exceljs';

export interface ProductInput {
  url: string;
  productName: string;
}

export async function readProducts(
  filePath: string
): Promise<ProductInput[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.worksheets[0];
  const products: ProductInput[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const url = row.getCell(1).text.trim();
    const productName = row.getCell(2).text.trim();

    if (!url) return;

    products.push({ url, productName });
  });

  return products;
}
