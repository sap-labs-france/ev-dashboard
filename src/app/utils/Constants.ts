
export class Constants {
  public static URL_PATTERN = /^(?:https?|wss?):\/\/((?:[\w-]+)(?:\.[\w-]+)*)(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?$/;

  public static CSV_SEPARATOR = '\t';

  public static MAX_PAGE_SIZE = Number.MAX_SAFE_INTEGER;
  public static DEFAULT_PAGE_SIZE = 100;
  public static INFINITE_RECORDS = -1;
  public static DEFAULT_POLLING_MILLIS = 10000;

  public static readonly MAX_LIMIT = Number.MAX_SAFE_INTEGER;

  /* Data Service */
  public static DEFAULT_LIMIT = 100;
  public static DEFAULT_SKIP = 0;
  public static FIRST_ITEM_PAGING = {limit: 1, skip: Constants.DEFAULT_SKIP};
  public static DEFAULT_PAGING = {limit: Constants.DEFAULT_LIMIT, skip: Constants.DEFAULT_SKIP};
  public static MAX_PAGING = {limit: Constants.MAX_PAGE_SIZE, skip: Constants.DEFAULT_SKIP};

  public static USER_NO_PICTURE = 'assets/img/theme/no-photo.png';

  /* RegEx validation rule */
  public static REGEX_VALIDATION_LATITUDE = /^-?([1-8]?[1-9]|[1-9]0)\.{0,1}[0-9]*$/;
  public static REGEX_VALIDATION_LONGITUDE = /^-?([1]?[0-7][0-9]|[1]?[0-8][0]|[1-9]?[0-9])\.{0,1}[0-9]*$/;
}
