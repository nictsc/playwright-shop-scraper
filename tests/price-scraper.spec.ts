import { test } from '@playwright/test';
import { readProducts } from '../utils/excelReader';
import { initExcel, writeRow } from '../utils/excelWriter';
import { wowProductPage } from '../pages/productPage';

/*
Scrapes product pages and writes to Excel.
- Read input from data/products.xlsx (columns: product name, URL).
- Writes output to results/YYYY-MM-DD-WOW.xlsx.
- Columns in output are extract date, product name, product price, stock status and product URL.
*/

test('Scrape product prices from spreadsheet', async ({ page }) => {
  const products = await readProducts('data/products.xlsx');
  await initExcel();

  const productPage = new wowProductPage(page);
  const extractDate = new Date().toISOString().split('T')[0];

  for (const product of products) {
    await productPage.goto(product.url);

    const name = await productPage.getProductName();
    const { price, stockStatus } = await productPage.getPriceAndStock();

    await writeRow({
      extractDate,
      productName: name,
      productPrice: price,
      productURL: product.url,
      stockStatus
    });

    console.log(`${extractDate} | ${name} | ${price} | ${stockStatus} | ${product.url}`);
  }
});
