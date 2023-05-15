import 'expect-puppeteer';

import { Page } from 'puppeteer';

import { LoginHelper } from '../helper/integration/LoginHelper';
import { UserTokenHelper } from '../helper/integration/UserTokenHelper';

jest.setTimeout(60000);

let activePage: Page;

beforeEach(async () => {
  // Reset jest puppeteer for each test (Start fresh)
  await jestPuppeteer.resetPage();
  // Set active tab (page) and put it in foreground
  const pageList = await browser.pages();
  if (pageList.length === 0) {
    activePage = await context.newPage();
  } else {
    activePage = pageList[pageList.length - 1];
  }
  // Usefull for debug with none headless browser
  await activePage.bringToFront();
  // Configure mock, IMPORTANT: jestPuppeteer.resetPage() reset the mocks
  await LoginHelper.configureMocks(activePage, UserTokenHelper.generateAdmin());
});

describe('Login successfull', () => {
  afterEach(async () => {
    // Logout
    await LoginHelper.logout(activePage);
  });

  it('Form is filled step by step in order', async () => {
    // Go to login URL
    await activePage.goto(LoginHelper.DASHBOARD_BASE_URL, { waitUntil: 'networkidle0' });
    // Perform step by step login actions
    await LoginHelper.inputLogin(activePage, 'test@sap.com');
    await LoginHelper.inputPassword(activePage, 'password');
    await LoginHelper.selectTermsCheckBox(activePage);
    await LoginHelper.submitLoginForm(activePage);
  });

  it('Form is filled step by step in inverse order', async () => {
    // Go to login URL
    await activePage.goto(LoginHelper.DASHBOARD_BASE_URL, { waitUntil: 'networkidle0' });
    // Perform step by step login actions
    await LoginHelper.inputLogin(activePage, 'test@sap.com');
    await LoginHelper.selectTermsCheckBox(activePage);
    await LoginHelper.inputPassword(activePage, 'password');
    await LoginHelper.submitLoginForm(activePage);
  });

  it('Form is filled with LoginHelper login wrapper', async () => {
    await LoginHelper.login(activePage, 'test@sap.com', 'password');
  });
});

describe('Login not possible due to incomplete form', () => {
  beforeEach(async () => {
    // Go to login URL
    await activePage.goto(LoginHelper.DASHBOARD_BASE_URL, { waitUntil: 'networkidle0' });
  });

  it('Empty login form', async () => {
    await LoginHelper.checkSubmitButtonDisabled(activePage);
  });

  it('Did not agree to terms', async () => {
    await LoginHelper.inputLogin(activePage, 'test@sap.com');
    await LoginHelper.inputPassword(activePage, 'password');
    await LoginHelper.checkSubmitButtonDisabled(activePage);
  });
});

describe('Login not possible due to invalid form', () => {
  beforeEach(async () => {
    // Go to login URL
    await activePage.goto(LoginHelper.DASHBOARD_BASE_URL, { waitUntil: 'networkidle0' });
  });

  it('invalid email', async () => {
    await LoginHelper.inputLogin(activePage, '@sap.com');
    await LoginHelper.inputPassword(activePage, 'password');
    await LoginHelper.selectTermsCheckBox(activePage);
    await LoginHelper.checkSubmitButtonDisabled(activePage);
  });
});
