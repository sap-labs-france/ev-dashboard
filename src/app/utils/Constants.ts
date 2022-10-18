
export class Constants {
  public static readonly URL_PATTERN = /^(?:https?|wss?):\/\/((?:[\w-]+)(?:\.[\w-]+)*)(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?$/;

  public static readonly CSV_SEPARATOR = ',';
  public static readonly CR_LF = '\r\n';

  public static readonly MAX_PAGE_SIZE = Number.MAX_SAFE_INTEGER;
  public static readonly DEFAULT_PAGE_SIZE = 50;
  public static readonly INFINITE_RECORDS = -1;

  public static readonly MAX_LIMIT = Number.MAX_SAFE_INTEGER;

  public static readonly REST_RESPONSE_SUCCESS = 'Success';

  /* Data Service */
  public static readonly DEFAULT_LIMIT = Constants.DEFAULT_PAGE_SIZE;
  public static readonly DEFAULT_SKIP = 0;
  public static readonly FIRST_ITEM_PAGING = {limit: 1, skip: Constants.DEFAULT_SKIP};
  public static readonly DEFAULT_PAGING = {limit: Constants.DEFAULT_LIMIT, skip: Constants.DEFAULT_SKIP};
  public static readonly MAX_PAGING = {limit: Constants.MAX_PAGE_SIZE, skip: Constants.DEFAULT_SKIP};

  public static readonly USER_NO_PICTURE = 'assets/img/theme/no-photo.png';
  public static readonly NO_IMAGE = 'assets/img/theme/no-image.png';
  public static readonly MASTER_TENANT_LOGO = '/assets/img/logo-low.gif';

  /* RegEx validation rule */
  public static readonly REGEX_VALIDATION_LATITUDE = /^-?([1-8]?[1-9]|[1-9]0)\.{0,1}[0-9]*$/;
  public static readonly REGEX_VALIDATION_LONGITUDE = /^-?([1]?[0-7][0-9]|[1]?[0-8][0]|[1-9]?[0-9])\.{0,1}[0-9]*$/;
  public static readonly REGEX_VALIDATION_FLOAT = /^((\d+(\.\d+)?))$/;
  public static readonly REGEX_VALIDATION_NUMBER = /^\d+$/;

  /* Language and Locales */
  /* Make sure to maintain app.module.ts ==> e.g.: registerLocaleData(localeEnAU); */
  public static readonly SUPPORTED_LOCALES = Object.freeze(['en_US', 'fr_FR', 'es_ES', 'de_DE', 'pt_PT', 'it_IT', 'cs_CZ', 'en_AU']);
  public static readonly SUPPORTED_LANGUAGES = Object.freeze(['en', 'fr', 'es', 'de', 'pt', 'it', 'cs']);
  public static readonly DEFAULT_LOCALE = 'en_US';
  public static readonly DEFAULT_LANGUAGE = 'en';

  /* Default Currency */
  public static readonly DEFAULT_CURRENCY_CODE = 'EUR';

  public static readonly SELECT_ALL = 'A';

  /* App Info for STRIPE */
  public static readonly STRIPE_APP_NAME = 'Open e-Mobility';
  public static readonly STRIPE_PARTNER_ID = 'TECH-000685';
}
