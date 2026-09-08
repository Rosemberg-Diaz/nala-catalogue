import { test, expect } from '@playwright/test';

test('static subfolder supports photos, reload, cart and the configured WhatsApp', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const outsideImages: string[] = [];
  page.on('request', request => { if (request.resourceType() === 'image' && new URL(request.url()).pathname.startsWith('/images/')) outsideImages.push(request.url()); });
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tu esencia');
  await expect.poll(() => page.locator('.hero-photo img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.getByRole('link', { name: 'Saltar al contenido' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tu esencia');
  await page.locator('main').getByRole('link', { name: 'Explorar accesorios', exact: true }).click();
  await expect(page).toHaveURL(/\/nala-catalogue\/#\/catalogo$/);
  await page.getByRole('searchbox', { name: 'Buscar accesorios' }).fill('Aretes Sol');
  await page.getByRole('link', { name: 'Aretes Sol', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Aretes Sol', exact: true })).toBeVisible();
  await expect.poll(() => page.locator('.main-photo img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.getByRole('radio', { name: 'Dorado', exact: true }).check();
  await page.getByRole('button', { name: 'Agregar a mi bolsa', exact: true }).click();
  await page.getByRole('link', { name: /Mi bolsa, 1 productos/ }).click();
  await page.reload();
  await expect(page.locator('.summary-total')).toContainText('$28.000');
  await page.getByRole('link', { name: 'Continuar con mi pedido' }).click();
  await page.getByRole('radio', { name: /Recoger en el local/ }).check();
  await page.getByLabel(/^Nombre completo/).fill('Cliente de prueba');
  await page.getByRole('button', { name: 'Revisar mi pedido' }).click();
  await page.getByRole('button', { name: 'Preparar WhatsApp', exact: true }).click();
  const href = await page.getByRole('link', { name: 'Abrir WhatsApp', exact: true }).getAttribute('href');
  const link = new URL(href!);
  expect(link.origin + link.pathname).toBe('https://wa.me/573173560428');
  expect(link.searchParams.get('text')).toContain('Cantidad: 1');
  expect(link.searchParams.get('text')).toContain('$28.000');
  expect(link.searchParams.get('text')).toContain('3 días hábiles');
  expect((await request.get('./catalogo')).status()).toBe(404);
  expect(outsideImages).toEqual([]);
  expect(errors).toEqual([]);
});

test('static admin, direct category links and image fallback work after reload', async ({ page }) => {
  await page.goto('./#/admin');
  await page.getByRole('button', { name: 'Entrar al modo local' }).click();
  await expect(page.locator('.admin-product')).toHaveCount(9);
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.route('**/images/ring.jpg', route => route.abort());
  await page.goto('./#/catalogo?categoria=anillos');
  await page.reload();
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.product-card img')).toHaveAttribute('src', './images/fallback.svg');
  await expect.poll(() => page.locator('.product-card img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  for (const width of [360, 390, 412]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
