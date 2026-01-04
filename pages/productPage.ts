import { Page } from '@playwright/test';

export class wowProductPage {
  constructor(private page: Page) {}

  async goto(url: string) {
    await this.page.goto(url, { waitUntil: 'commit', timeout: 10000 });
  }

  async getProductName(): Promise<string> {
    const locator = this.page.locator(
      '.product-title_component_title-container__XGNlk'
    );
    await locator.waitFor({ state: 'visible', timeout: 5000 });
    return (await locator.innerText()).trim();
  }

  // Tells what locator to use for in-stock or out-of-stock products
  async getPriceAndStock(): Promise<{ price: string; stockStatus: string }> {
    const priceLocator = this.page.locator('#product-price-sr');
    const outOfStockLocator = this.page.locator(
      '.product-label_component_out-of-stock-with-restock-date__aDXDl'
    );

    // Wait for either price OR out-of-stock label (max 5s)
    await Promise.race([
      priceLocator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
      outOfStockLocator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
    ]);

    if (await priceLocator.isVisible()) {
      const text = await priceLocator.innerText(); // "Price $7.50"
      const match = text.match(/\$([\d.]+)/);
      if (!match) throw new Error(`Unexpected price format: ${text}`);
      return { price: Number(match[1]).toFixed(2), stockStatus: 'In Stock' };
    }

    if (await outOfStockLocator.isVisible()) {
      return { price: '', stockStatus: 'Out of Stock' };
    }

    return { price: '', stockStatus: 'Unknown' };
  }
}
