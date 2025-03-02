import { test, expect, chromium } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const baseUrl = process.env.HEALTH_CHECK_SERVICE_BASE_URL;
const username = process.env.HEALTH_CHECK_SERVICE_USERNAME;
const password = process.env.HEALTH_CHECK_SERVICE_PASSWORD;

test('Авторизация через базовую аутентификацию и проверка UI Health Checks', async ({ browser }) => {
    // Создаем новый контекст с учетными данными
    const context = await browser.newContext({
        httpCredentials: {
            username,
            password
        }
    });

    // Открываем новую страницу в этом контексте
    const page = await context.newPage();
    await page.goto(baseUrl);

    // Проверяем заголовок страницы
    await expect(page.locator('h1')).toHaveText('Health Checks Status');

    // Закрываем контекст
    await context.close();
});

test('Проверка наличия хотя бы одного статуса "Healthy"', async ({ browser }) => {

    const context = await browser.newContext({
        httpCredentials: {
            username,
            password
        }
    });

    const page = await context.newPage();
    await page.goto(baseUrl);

    const checkIcon = page.locator('i.material-icons', { hasText: 'check_circle' }).first();
    await expect(checkIcon).toBeVisible();

    await context.close();
});
