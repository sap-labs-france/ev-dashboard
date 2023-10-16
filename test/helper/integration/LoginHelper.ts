import 'expect-puppeteer';

import { Page } from 'puppeteer';

import * as config from '../../config';

export class LoginHelper {
  public static DASHBOARD_BASE_URL = `${config.get('frontEndServer.scheme')}://${config.get(
    'frontEndServer.host'
  )}:${config.get('frontEndServer.port')}`;

  private static EMAIL_FIELD_SELECTOR = '#email-field';
  private static PASSWORD_FIELD_SELECTOR = '#password-field';
  private static LICENSE_AGREEMENT_SELECTOR = '.mat-checkbox-inner-container';
  private static SUBMIT_BUTTON_SELECTOR = '#sign-in-button';
  private static LOGIN_SUCCESS_SELECTOR = '.user-info';
  private static LOGOUT_SUCCESS_SELECTOR = LoginHelper.EMAIL_FIELD_SELECTOR;

  public static async inputLogin(page: Page, login: string) {
    await page.waitForSelector(this.EMAIL_FIELD_SELECTOR);
    await expect(page).toFill(this.EMAIL_FIELD_SELECTOR, login);
  }

  public static async inputPassword(page: Page, password: string) {
    await page.waitForSelector(this.PASSWORD_FIELD_SELECTOR);
    await expect(page).toFill(this.PASSWORD_FIELD_SELECTOR, password);
  }

  public static async selectTermsCheckBox(page: Page) {
    await page.waitForSelector(this.LICENSE_AGREEMENT_SELECTOR);
    await expect(page).toClick(this.LICENSE_AGREEMENT_SELECTOR);
  }

  public static async submitLoginForm(page: Page) {
    await LoginHelper.checkSubmitButtonEnabled(page);
    await expect(page).toClick(this.SUBMIT_BUTTON_SELECTOR);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    // Wait for profile to be displayed
    await page.waitForSelector(this.LOGIN_SUCCESS_SELECTOR);
  }

  public static async checkSubmitButtonDisabled(page: Page) {
    await page.waitForSelector(this.SUBMIT_BUTTON_SELECTOR);
    await expect(page).toMatchElement(this.SUBMIT_BUTTON_SELECTOR + '[disabled]');
  }

  public static async checkSubmitButtonEnabled(page: Page) {
    await page.waitForSelector(this.SUBMIT_BUTTON_SELECTOR);
    await expect(page).toMatchElement(this.SUBMIT_BUTTON_SELECTOR + ':not([disabled])');
  }

  public static async login(page: Page, user: string, password: string) {
    // Go to login URL
    await page.goto(LoginHelper.DASHBOARD_BASE_URL, { waitUntil: 'networkidle0' });
    await LoginHelper.inputLogin(page, user);
    await LoginHelper.inputPassword(page, password);
    await LoginHelper.selectTermsCheckBox(page);
    await LoginHelper.submitLoginForm(page);
  }

  public static async logout(page: Page) {
    await page.waitForSelector(this.LOGIN_SUCCESS_SELECTOR);
    await page.click(this.LOGIN_SUCCESS_SELECTOR);
    // Wait for logout button to be ready
    await page.waitForFunction(() => {
      const collapseDetailsShow = document.querySelector('#collapseDetails.collapse.show');
      if (collapseDetailsShow) {
        const profileDetails = document.querySelectorAll(
          '#collapseDetails.collapse.show li span i'
        );
        let logoutFound = false;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < profileDetails.length; i++) {
          if (profileDetails[i].innerHTML === 'lock') {
            logoutFound = true;
          }
        }
        return logoutFound;
      }
      return false;
    });
    const button = await page.waitForXPath('//span[contains(., "Sign out")]', {
      visible: true,
      hidden: false,
    });
    await button.click();
    // Wait for success logout selector
    await page.waitForSelector(this.LOGOUT_SUCCESS_SELECTOR);
  }

  public static async configureMocks(page: Page, loginToken: string) {
    // Init request interceptor
    await page.setRequestInterception(true);
    // Build API response objects
    const responsesByEndpoint = {
      '/v1/auth/signin': {
        GET: [{ headers: { status: 200 } }],
        POST: [
          {
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ token: loginToken }),
          },
        ],
        OPTIONS: [
          {
            headers: { status: 204 },
            body: JSON.stringify({ token: loginToken }),
          },
        ],
      },
      '/v1/auth/signout': {
        GET: [
          {
            headers: { 'Access-Control-Allow-Origin': '*', status: 200 },
            body: JSON.stringify({}),
          },
        ],
      },
    };
    // Listen to requests and return a mock when available, otherwise treat request as valid
    page.on('request', async (request) => {
      const urlPath = new URL(request.url()).pathname;
      let mockResponse;
      if (responsesByEndpoint[urlPath]) {
        mockResponse = responsesByEndpoint[urlPath][request.method()]?.shift();
      }
      if (mockResponse) {
        // Return mocked response
        // const stringDebug = 'Request: ' + request.method() + ' ' + urlPath;
        // console.log(stringDebug + ' --MOCKED--');
        await request.respond(mockResponse);
      } else {
        // Continue request if no mock found
        await request.continue();
      }
    });
  }
}
