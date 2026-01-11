import { Page } from '@playwright/test';

export class wowProductPage {
  constructor(private page: Page) {}

  async goto(url: string) {
    try {
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 10000 
      });
      // Wait 1 second after DOM is loaded for rendering content
      await this.page.waitForTimeout(1000);
    } catch (error) {
      // Retry with a more lenient wait condition
      console.warn(`Navigation failed, retrying with networkidle...`, error);
      await this.page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 10000
      });
      // Wait 1 second after DOM is loaded for rendering content
      await this.page.waitForTimeout(1000);
    }
  }

  async getProductName(): Promise<string> {
    const title = await this.page.title();
    return title.replace(/\s*\|\s*Woolworths\s*$/, '').trim();
  }

  // Tells what locator to use for in-stock or out-of-stock products
  async getPriceAndStock(): Promise<{ price: string; stockStatus: string }> {
    const priceLocator = this.page.locator('#product-price-sr');
    
    // Multiple strategies to detect out-of-stock status (ordered by specificity)
    const outOfStockLocator = this.page.locator(
      '[class*="out-of-stock"], ' +  // Targets CSS module classes containing "out-of-stock"
      '[class*="unavailable"], ' +   // Fallback for availability classes
      ':text-matches("Est. Restock|Out of Stock", "i")'  // Fallback to text content
    );

    // Wait for either price OR out-of-stock label (max 10s)
    await Promise.race([
      priceLocator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
      outOfStockLocator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
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
