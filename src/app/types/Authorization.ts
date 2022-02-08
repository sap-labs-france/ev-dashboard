
export interface AuthorizationDefinition {
  superAdmin: AuthorizationDefinitionRole;
  admin: AuthorizationDefinitionRole;
  basic: AuthorizationDefinitionRole;
  demo: AuthorizationDefinitionRole;
  siteAdmin: AuthorizationDefinitionRole;
  siteOwner: AuthorizationDefinitionRole;
}
export interface AuthorizationDefinitionRole {
  grants: AuthorizationDefinitionGrant[];
  $extend?: Record<string, unknown>;
}

export interface AuthorizationDefinitionGrant {
  resource: Entity;
  action: Action | Action[];
  args?: Record<string, unknown>;
  condition?: AuthorizationDefinitionCondition;
  attributes?: string[];
}

export interface AuthorizationDefinitionCondition {
  Fn: string;
  args: AuthorizationDefinitionConditionArgs|AuthorizationDefinitionConditionArgs[]|AuthorizationDefinitionCondition[]|Record<string, unknown>;
}

export interface AuthorizationDefinitionConditionArgs {
  filters?: string[];
  asserts?: string[];
  metadata?: Record<string, AuthorizationDefinitionFieldMetadata>;
}

export interface AuthorizationDefinitionFieldMetadata {
  visible: boolean;
  enabled: boolean;
  mandatory: boolean;
  values: string[]|boolean[]|number[];
  defaultValue: string|boolean|number;
}

export interface AuthorizationFilter {
  filters: Record<string, unknown>;
  project: string[];
}


export enum Entity {
  SITE = 'Site',
  SITE_AREA = 'SiteArea',
  COMPANY = 'Company',
  CHARGING_STATION = 'ChargingStation',
  TENANT = 'Tenant',
  TRANSACTION = 'Transaction',
  REPORT = 'Report',
  USER = 'User',
  USERS_SITES = 'UsersSites',
  LOGGING = 'Logging',
  PRICING = 'Pricing',
  PRICING_DEFINITION = 'PricingDefinition',
  BILLING = 'Billing',
  SETTING = 'Setting',
  ASYNC_TASK = 'AsyncTask',
  OCPI_ENDPOINT = 'OcpiEndpoint',
  OICP_ENDPOINT = 'OicpEndpoint',
  CONNECTION = 'Connection',
  ASSET = 'Asset',
  CAR_CATALOG = 'CarCatalog',
  CAR = 'Car',
  INVOICE = 'Invoice',
  TAX = 'Tax',
  REGISTRATION_TOKEN = 'RegistrationToken',
  CHARGING_PROFILE = 'ChargingProfile',
  NOTIFICATION = 'Notification',
  TAG = 'Tag',
  PAYMENT_METHOD = 'PaymentMethod',
  SOURCE = 'Source',
}

export enum Action {
  READ = 'Read',
  CREATE = 'Create',
  UPDATE = 'Update',
  UPDATE_BY_VISUAL_ID = 'UpdateByVisualID',
  REPLACE = 'Replace',
  REVOKE = 'Revoke',
  DELETE = 'Delete',
  LOGOUT = 'Logout',
  LOGIN = 'Login',
  LIST = 'List',
  IN_ERROR = 'InError',
  RESET = 'Reset',
  ASSIGN = 'Assign',
  UNASSIGN = 'Unassign',
  CLEAR_CACHE = 'ClearCache',
  TRIGGER_DATA_TRANSFER = 'DataTransfer',
  SYNCHRONIZE = 'Synchronize',
  GET_CONFIGURATION = 'GetConfiguration',
  CHANGE_CONFIGURATION = 'ChangeConfiguration',
  SYNCHRONIZE_CAR_CATALOGS = 'SynchronizeCarCatalogs',
  REMOTE_START_TRANSACTION = 'RemoteStartTransaction',
  REMOTE_STOP_TRANSACTION = 'RemoteStopTransaction',
  START_TRANSACTION = 'StartTransaction',
  STOP_TRANSACTION = 'StopTransaction',
  UNLOCK_CONNECTOR = 'UnlockConnector',
  AUTHORIZE = 'Authorize',
  SET_CHARGING_PROFILE = 'SetChargingProfile',
  GET_COMPOSITE_SCHEDULE = 'GetCompositeSchedule',
  CLEAR_CHARGING_PROFILE = 'ClearChargingProfile',
  GET_DIAGNOSTICS = 'GetDiagnostics',
  UPDATE_FIRMWARE = 'UpdateFirmware',
  EXPORT = 'Export',
  CHANGE_AVAILABILITY = 'ChangeAvailability',
  REFUND_TRANSACTION = 'RefundTransaction',
  SYNCHRONIZE_BILLING_USER = 'SynchronizeBillingUser',
  BILLING_SETUP_PAYMENT_METHOD = 'BillingSetupPaymentMethod',
  BILLING_PAYMENT_METHODS = 'BillingPaymentMethods',
  BILLING_DELETE_PAYMENT_METHOD = 'BillingDeletePaymentMethod',
  BILLING_CHARGE_INVOICE = 'BillingChargeInvoice',
  CHECK_CONNECTION = 'CheckConnection',
  CLEAR_BILLING_TEST_DATA = 'ClearBillingTestData',
  RETRIEVE_CONSUMPTION = 'RetrieveConsumption',
  READ_CONSUMPTION = 'ReadConsumption',
  CREATE_CONSUMPTION = 'CreateConsumption',
  PING = 'Ping',
  GENERATE_LOCAL_TOKEN = 'GenerateLocalToken',
  REGISTER = 'Register',
  TRIGGER_JOB = 'TriggerJob',
  DOWNLOAD = 'Download',
  IMPORT = 'Import',
  ASSIGN_USERS_TO_SITE = 'AssignUsers',
  UNASSIGN_USERS_FROM_SITE = 'UnassignUsers',
  ASSIGN_ASSETS_TO_SITE_AREA = 'AssignAssets',
  UNASSIGN_ASSETS_FROM_SITE_AREA = 'UnassignAssets',
  READ_ASSETS_FROM_SITE_AREA = 'ReadAssets',
  ASSIGN_CHARGING_STATIONS_TO_SITE_AREA = 'AssignChargingStations',
  UNASSIGN_CHARGING_STATIONS_FROM_SITE_AREA = 'UnassignChargingStations',
  READ_CHARGING_STATIONS_FROM_SITE_AREA = 'ReadChargingStationsFromSiteArea',
  EXPORT_OCPP_PARAMS = 'ExportOCPPParams',
  GENERATE_QR = 'GenerateQrCode',
  MAINTAIN_PRICING_DEFINITIONS = 'MaintainPricingDefinitions',
}

export interface AuthorizationContext {
  tagIDs?: string[];
  tagID?: string;
  owner?: string;
  site?: string;
  sites?: string[];
  sitesAdmin?: string[];
  user?: string;
  UserID?: string;
  sitesOwner?: string[];
  company?: string;
  companies?: string[];
  asset?: string;
  assets?: string[];
}

export interface AuthorizationAttributes {
  projectFields?: string[];
  metadata?: Record<string, AuthorizationDefinitionFieldMetadata>;
}
// ENTITY: COMMON AUTH ACTION
export interface AuthorizationActions {
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}
// DATA RESULT: COMMON AUTH ACTION
export interface DataResultAuthorizationActions {
  canCreate?: boolean;
}
// BASIC DATA RESULT AUTHORIZATIONS
export interface DataResultAuthorizations extends AuthorizationAttributes, DataResultAuthorizationActions {
}
// CARS
export interface CarsAuthorizations extends AuthorizationAttributes, CarsAuthorizationActions {
}
export interface CarsAuthorizationActions extends DataResultAuthorizationActions{
  canListUsers?: boolean;
  canListCarCatalog?: boolean;
}
// CAR
export interface CarAuthorizationActions extends AuthorizationActions {
  canListUsers?: boolean;
}
// CAR CATALOGS
export interface CarCatalogsAuthorizations extends AuthorizationAttributes, CarCatalogsAuthorizationActions {
}
export interface CarCatalogsAuthorizationActions extends DataResultAuthorizationActions {
  canSync?: boolean;
}
// TAGS
export interface TagsAuthorizations extends AuthorizationAttributes, TagsAuthorizationActions {
}
export interface TagsAuthorizationActions extends DataResultAuthorizationActions {
  canAssign?: boolean;
  canDelete?: boolean;
  canImport?: boolean;
  canExport?: boolean;
  canUnassign?: boolean;
  canListUsers?: boolean;
  canListSources?: boolean;
}
// TAG
export interface TagAuthorizationActions extends AuthorizationActions {
  canUnassign?: boolean;
  canAssign?: boolean;
  canListUsers?: boolean;
  canUpdateByVisualID?: boolean;
}
// USERS
export interface UsersAuthorizations extends AuthorizationAttributes, UsersAuthorizationActions {
}
export interface UsersAuthorizationActions extends DataResultAuthorizationActions {
  canImport?: boolean;
  canExport?: boolean;
}
// ASSETS
export interface AssetsAuthorizations extends AuthorizationAttributes, AssetsAuthorizationActions {
}
export interface AssetsAuthorizationActions extends DataResultAuthorizationActions {
  canListSites: boolean;
  canListSiteAreas: boolean;
}
// ASSET
export interface AssetAuthorizationActions extends AuthorizationActions {
  canRetrieveConsumption?: boolean;
  canReadConsumption?: boolean;
  canCheckConnection?: boolean;
}
// SITE AREA
export interface SiteAreaAuthorizationActions extends AuthorizationActions {
  canAssignAssets?: boolean;
  canUnassignAssets?: boolean;
  canReadAssets?: boolean;
  canAssignChargingStations?: boolean;
  canUnassignChargingStations?: boolean;
  canReadChargingStations?: boolean;
  canExportOCPPParams?: boolean;
  canGenerateQrCode?: boolean;
}
// SITE
export interface SiteAuthorizationActions extends AuthorizationActions {
  canAssignUsers?: boolean;
  canUnassignUsers?: boolean;
  canReadUsers?: boolean;
  canExportOCPPParams?: boolean;
  canGenerateQrCode?: boolean;
  canMaintainPricingDefinitions?: boolean;
}
// REGISTRATION TOKEN
export interface RegistrationTokenAuthorizationActions extends AuthorizationActions {
  canRevoke?: boolean;
}
// LOGS
export interface LogsAuthorizationActions extends AuthorizationActions {
  canExport?: boolean;
}

export enum DialogMode {
  EDIT = 'E',
  CREATE = 'C',
  VIEW = 'V',
}

export interface DialogData {
  id: string | number;
  projectFields?: string[];
  metadata?: Record<string, AuthorizationDefinitionFieldMetadata>;
}

export interface DialogParams<T extends DialogData> {
  dialogData?: T;
  dialogMode?: DialogMode;
}

// Additional auth parameter from DialogParams
export interface DialogParamsWithAuth<T extends DialogData, U extends AuthorizationAttributes>
  extends DialogParams<T> {
  authorizations?: U;
}
