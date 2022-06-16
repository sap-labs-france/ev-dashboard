
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
  USER_SITE = 'UserSite',
  SITE_USER = 'SiteUser',
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

// Entity: Common Authorization Action
export interface AuthorizationActions {
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

// Data Result: Common Authorization Action
export interface DataResultAuthorizationActions {
  canCreate?: boolean;
}

// Basic Data Result Authorizations
export interface DataResultAuthorizations extends AuthorizationAttributes, DataResultAuthorizationActions {
}

export interface CarsAuthorizations extends AuthorizationAttributes, CarsAuthorizationActions {
}

export interface CarsAuthorizationActions extends DataResultAuthorizationActions{
  canListUsers?: boolean;
  canListCarCatalog?: boolean;
}

export interface CarAuthorizationActions extends AuthorizationActions {
  canListUsers?: boolean;
}

export interface CarCatalogsAuthorizations extends AuthorizationAttributes, CarCatalogsAuthorizationActions {
}

export interface CarCatalogsAuthorizationActions extends DataResultAuthorizationActions {
  canSync?: boolean;
}

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

export interface TagAuthorizationActions extends AuthorizationActions {
  canUnassign?: boolean;
  canAssign?: boolean;
  canListUsers?: boolean;
  canUpdateByVisualID?: boolean;
}

export interface UsersAuthorizations extends AuthorizationAttributes, UsersAuthorizationActions {
}

export interface UsersAuthorizationActions extends DataResultAuthorizationActions {
  canImport?: boolean;
  canExport?: boolean;
}

export interface UserAuthorizationActions extends AuthorizationActions {
  canAssignSites?: boolean;
  canUnassignSites?: boolean;
  canListUserSites?: boolean;
  canListTags?: boolean;
  canListTransactions?: boolean;
  canSynchronizeBillingUser?: boolean;
}

export interface UserSitesAuthorizations extends AuthorizationAttributes, UserSitesAuthorizationActions {
  canUpdateUserSites?: boolean;
}

export interface UserSitesAuthorizationActions extends DataResultAuthorizationActions {
}

export interface UserSiteAuthorizationActions extends AuthorizationActions {
}

export interface SiteUsersAuthorizations extends AuthorizationAttributes, SiteUsersAuthorizationActions {
  canUpdateSiteUsers?: boolean;
}

export interface SiteUsersAuthorizationActions extends DataResultAuthorizationActions {
}

export interface SiteUserAuthorizationActions extends AuthorizationActions {
}

// ASSETS
export interface AssetsAuthorizations extends AuthorizationAttributes, AssetsAuthorizationActions {
}

export interface AssetsAuthorizationActions extends DataResultAuthorizationActions {
  canListSites?: boolean;
  canListSiteAreas?: boolean;
}

export interface AssetAuthorizationActions extends AuthorizationActions {
  canRetrieveConsumption?: boolean;
  canReadConsumption?: boolean;
  canCheckConnection?: boolean;
}

export interface SiteAreasAuthorizations extends AuthorizationAttributes, DataResultAuthorizationActions {
}

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

export interface SitesAuthorizations extends AuthorizationAttributes, SitesAuthorizationActions {
}

export interface SitesAuthorizationActions extends DataResultAuthorizationActions {
  canListCompanies: boolean;
}

export interface SiteAuthorizationActions extends AuthorizationActions {
  canAssignUsers?: boolean;
  canUnassignUsers?: boolean;
  canListSiteUsers?: boolean;
  canExportOCPPParams?: boolean;
  canGenerateQrCode?: boolean;
  canMaintainPricingDefinitions?: boolean;
}

export interface RegistrationTokenAuthorizationActions extends AuthorizationActions {
  canRevoke?: boolean;
}

export interface LogsAuthorizationActions extends AuthorizationActions {
  canExport?: boolean;
}

export interface BillingInvoicesAuthorizations extends AuthorizationAttributes, BillingInvoicesAuthorizationActions {
}

export interface BillingInvoicesAuthorizationActions extends DataResultAuthorizationActions {
  canListUsers?: boolean;
}

export interface BillingInvoiceAuthorizationActions extends AuthorizationActions {
  canDownload?: boolean;
}

export interface BillingPaymentMethodsAuthorizationActions extends DataResultAuthorizationActions {
}

export interface BillingPaymentMethodAuthorizationActions extends AuthorizationActions {
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
