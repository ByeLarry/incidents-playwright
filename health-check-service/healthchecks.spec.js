import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config();

const baseUrl = process.env.HEALTH_CHECK_SERVICE_BASE_URL;
const username = process.env.HEALTH_CHECK_SERVICE_USERNAME;
const password = process.env.HEALTH_CHECK_SERVICE_PASSWORD;

test("Авторизация через базовую аутентификацию и проверка UI Health Checks", async ({
  browser,
}) => {
  // Создаем новый контекст с учетными данными
  const context = await browser.newContext({
    httpCredentials: {
      username,
      password,
    },
  });

  // Открываем новую страницу в этом контексте
  const page = await context.newPage();
  await page.goto(baseUrl);

  // Проверяем заголовок страницы
  await expect(page.locator("h1")).toHaveText("Health Checks Status");

  // Закрываем контекст
  await context.close();
});

test('Проверка наличия хотя бы одного статуса "Healthy"', async ({ browser }) => {
  const context = await browser.newContext({
    httpCredentials: {
      username,
      password,
    },
  });

  const page = await context.newPage();
  await page.goto(baseUrl);

  // Исправляем локатор, чтобы он точно соответствовал вашей HTML структуре
  const checkIcons = page.locator('i.material-icons:has-text("check_circle")');
  
  // Добавим небольшую задержку для уверенности, что страница полностью загрузилась
  await page.waitForTimeout(1000);

  const count = await checkIcons.count();
  
  expect(count).toBeGreaterThan(0);

  await context.close();
});

test('Проверка наличия хотя бы одного статуса "Unhealthy"', async ({ browser }) => {
  const context = await browser.newContext({
    httpCredentials: {
      username,
      password,
    },
  });

  const page = await context.newPage();
  await page.goto(baseUrl);

  // Ждем загрузки всех статусов
  await page.waitForSelector('i.material-icons');

  // Проверяем иконки ошибок
  const errorIcons = page.locator('i.material-icons:has-text("error")');
  const errorCount = await errorIcons.count();

  // Проверяем наличие упавших сервисов
  expect(errorCount).toBeGreaterThan(0, 
    'Должен быть хотя бы один сервис в состоянии ошибки');

  await context.close();
});

test("Проверка деталей состояния сервиса", async ({ browser }) => {
  const context = await browser.newContext({
    httpCredentials: {
      username,
      password,
    },
  });

  const page = await context.newPage();
  await page.goto(baseUrl);

  // Кликаем на первый сервис для просмотра деталей
  await page.locator('i.material-icons.js-toggle-event:has-text("add")').first().click();

  // Проверяем наличие времени последней проверки
  await expect(page.locator('th:has-text("Duration")').first()).toBeVisible();

  await context.close();
});

test("Проверка переключения режима опроса", async ({ browser }) => {
  const context = await browser.newContext({
    httpCredentials: {
      username,
      password,
    },
  });

  const page = await context.newPage();
  await page.goto(baseUrl);

  // Находим и нажимаем кнопку Stop polling
  const stopButton = page.getByText('Stop polling');
  await stopButton.click();

  // Находим и нажимаем кнопку Start polling 
  const startButton = page.getByText('Start polling');
  await startButton.click();

  // Проверяем что кнопка Stop polling снова появилась
  await expect(page.getByText('Stop polling')).toBeVisible();

  await context.close();
});

