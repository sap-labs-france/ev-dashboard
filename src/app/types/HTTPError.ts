import { StatusCodes } from 'http-status-codes';

export enum HTTPError {
  GENERAL_ERROR = StatusCodes.INTERNAL_SERVER_ERROR,
  NOT_IMPLEMENTED_ERROR = StatusCodes.NOT_IMPLEMENTED,
  MISSING_SETTINGS = 505,
  OBJECT_DOES_NOT_EXIST_ERROR = 550,
  FEATURE_NOT_SUPPORTED_ERROR = 585,

  REFUND_SESSION_OTHER_USER_ERROR = 551,
  REFUND_CONNECTION_ERROR = 552,
  CONCUR_CITY_UNKNOWN_ERROR = 553,
  CANNOT_DELETED_REFUNDED_SESSION = 555,

  PRICING_REQUEST_INVOICE_ERROR = 561,

  CYPHER_INVALID_SENSITIVE_DATA_ERROR = 555,

  EXISTING_TRANSACTION_ERROR = 570,

  SET_CHARGING_PROFILE_ERROR = 554,
  LIMIT_POWER_ERROR = 556,

  USER_EMAIL_ALREADY_EXIST_ERROR = 510,
  USER_EULA_ERROR = 520,
  USER_NO_BADGE_ERROR = 570,

  TAG_ALREADY_EXIST_ERROR = 576,
  TAG_VISUAL_ID_ALREADY_EXIST_ERROR = 577,
  TAG_VISUAL_ID_DOES_NOT_MATCH_TAG_ERROR = 578,
  TAG_INACTIVE = 579,

  USER_ACCOUNT_LOCKED_ERROR = 590,
  USER_ACCOUNT_ALREADY_ACTIVE_ERROR = 591,
  USER_ACCOUNT_PENDING_ERROR = 592,
  USER_ACCOUNT_BLOCKED_ERROR = 593,
  USER_ACCOUNT_INACTIVE_ERROR = 594,
  USER_ACCOUNT_CHANGED = 595,
  TENANT_COMPONENT_CHANGED = 596,
  TENANT_ALREADY_EXIST = 597,
  TECHNICAL_USER_CANNOT_LOG_TO_UI_ERROR = 598,

  INVALID_CAPTCHA = 530,
  INVALID_TOKEN_ERROR = 540,
  CHARGER_WITH_NO_SITE_AREA_ERROR = 525,
  SITE_AREA_WITH_NO_SITE_ERROR = 525,
  USER_WITH_NO_SITE_ERROR = 525,

  BILLING_DELETE_ERROR = 510, // FIXME: override an already defined HTTP status code: Not extended (RFC 2774)

  CLEAR_CHARGING_PROFILE_NOT_SUCCESSFUL = 537,
  SMART_CHARGING_STILL_ACTIVE_FOR_SITE_AREA = 538,

  CAR_ALREADY_EXIST_ERROR = 591,
  USER_NOT_OWNER_OF_THE_CAR = 593,
  USER_ALREADY_ASSIGNED_TO_CAR = 594,
  NO_CAR_FOR_USER = 595,

  TRANSACTION_NOT_FROM_TENANT = 580,
  TRANSACTION_WITH_NO_OCPI_DATA = 581,
  TRANSACTION_CDR_ALREADY_PUSHED = 582,

  THREE_PHASE_CHARGER_ON_SINGLE_PHASE_SITE_AREA = 539,

  CRYPTO_MIGRATION_IN_PROGRESS = 511,
  CRYPTO_ALGORITHM_NOT_SUPPORTED = 512,
  CRYPTO_KEY_LENGTH_INVALID = 513,
  CRYPTO_CHECK_FAILED = 514,

  CANNOT_ACQUIRE_LOCK = 510, // FIXME: override an already defined HTTP status code: Not extended (RFC 2774)
  INVALID_FILE_FORMAT = 583,
  INVALID_FILE_CSV_HEADER_FORMAT = 584,

  CHARGE_POINT_NOT_VALID = 584,

  OCPI_ENDPOINT_ALREADY_REGISTERED = 530,
  OCPI_ENDPOINT_ALREADY_UNREGISTERED = 531,

  SITE_AREA_TREE_ERROR = 540,
  SITE_AREA_TREE_ERROR_SMART_SAME_SITE_AREA = 541,
  SITE_AREA_TREE_ERROR_SITE = 542,
  SITE_AREA_TREE_ERROR_SMART_CHARGING = 543,
  SITE_AREA_TREE_ERROR_SMART_NBR_PHASES = 544,
  SITE_AREA_TREE_ERROR_VOLTAGE = 545,
  SITE_AREA_HIERARCHY_DEPENDENCY_ERROR = 549,

  CANNOT_RETRIEVE_CONSUMPTION = 533,
}

export enum HTTPAuthError {
  UNAUTHORIZED = StatusCodes.UNAUTHORIZED,
  FORBIDDEN = StatusCodes.FORBIDDEN,
}
