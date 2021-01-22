
export class Constants {
  public static readonly URL_PATTERN = /^(?:https?|wss?):\/\/((?:[\w-]+)(?:\.[\w-]+)*)(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?$/;

  public static readonly CSV_SEPARATOR = '\t';

  public static readonly MAX_PAGE_SIZE = Number.MAX_SAFE_INTEGER;
  public static readonly DEFAULT_PAGE_SIZE = 100;
  public static readonly INFINITE_RECORDS = -1;

  public static readonly MAX_LIMIT = Number.MAX_SAFE_INTEGER;

  /* Data Service */
  public static readonly DEFAULT_LIMIT = 100;
  public static readonly DEFAULT_SKIP = 0;
  public static readonly FIRST_ITEM_PAGING = {limit: 1, skip: Constants.DEFAULT_SKIP};
  public static readonly DEFAULT_PAGING = {limit: Constants.DEFAULT_LIMIT, skip: Constants.DEFAULT_SKIP};
  public static readonly MAX_PAGING = {limit: Constants.MAX_PAGE_SIZE, skip: Constants.DEFAULT_SKIP};

  public static readonly USER_NO_PICTURE = 'assets/img/theme/no-photo.png';
  public static readonly NO_IMAGE = 'assets/img/theme/no-image.png';
  public static readonly NO_CAR_IMAGE = 'assets/img/theme/no-car.png';
  public static readonly TENANT_DEFAULT_LOGO = '/assets/img/logo-low.gif';

  /* RegEx validation rule */
  public static readonly REGEX_VALIDATION_LATITUDE = /^-?([1-8]?[1-9]|[1-9]0)\.{0,1}[0-9]*$/;
  public static readonly REGEX_VALIDATION_LONGITUDE = /^-?([1]?[0-7][0-9]|[1]?[0-8][0]|[1-9]?[0-9])\.{0,1}[0-9]*$/;
}
