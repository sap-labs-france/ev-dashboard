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
  args:
  | AuthorizationDefinitionConditionArgs
  | AuthorizationDefinitionConditionArgs[]
  | AuthorizationDefinitionCondition[]
  | Record<string, unknown>;
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
  values: string[] | boolean[] | number[];
  defaultValue: string | boolean | number;
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
  CONNECTOR = 'Connector',
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
  BILLING_PLATFORM = 'BillingPlatform',
  BILLING_ACCOUNT = 'BillingAccount',
  BILLING_TRANSFER = 'BillingTransfer',
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
  CHARGING_STATION_TEMPLATE = 'ChargingStationTemplate',
  RESERVATION = 'Reservation',
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
  BILLING_FINALIZE_TRANSFER = 'BillingFinalizeTransfer',
  BILLING_SEND_TRANSFER = 'BillingSendTransfer',
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
  ASSIGN_USERS_TO_SITE = 'AssignUsersToSite',
  UNASSIGN_USERS_FROM_SITE = 'UnassignUsersFromSite',
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
  canUpdate?: boolean;
  canDelete?: boolean;
}

// Data Result: Common Authorization Action
export interface DataResultAuthorizationActions {
  canCreate?: boolean;
}

// Basic Data Result Authorizations
export interface DataResultAuthorizations
  extends AuthorizationAttributes,
  DataResultAuthorizationActions {}

export interface CarsAuthorizations extends AuthorizationAttributes, CarsAuthorizationActions {}

export interface CarsAuthorizationActions extends DataResultAuthorizationActions {
  canListUsers?: boolean;
  canListCarCatalog?: boolean;
}

export interface CarAuthorizationActions extends AuthorizationActions {
  canListUsers?: boolean;
}

export interface CarCatalogsAuthorizations
  extends AuthorizationAttributes,
  CarCatalogsAuthorizationActions {}

export interface CarCatalogsAuthorizationActions extends DataResultAuthorizationActions {
  canSync?: boolean;
}

export interface TagsAuthorizations extends AuthorizationAttributes, TagsAuthorizationActions {}

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

export interface UsersAuthorizations extends AuthorizationAttributes, UsersAuthorizationActions {}

export interface UsersAuthorizationActions extends DataResultAuthorizationActions {
  canImport?: boolean;
  canExport?: boolean;
  canListTags?: boolean;
  canListSites?: boolean;
}

export interface UserAuthorizationActions extends AuthorizationActions {
  canAssignUnassignSites?: boolean;
  canListUserSites?: boolean;
  canListTags?: boolean;
  canListCompletedTransactions?: boolean;
  canSynchronizeBillingUser?: boolean;
}

export interface UserSitesAuthorizations
  extends AuthorizationAttributes,
  UserSitesAuthorizationActions {
  canUpdateUserSites?: boolean;
}

export interface UserSitesAuthorizationActions extends DataResultAuthorizationActions {}

export interface UserSiteAuthorizationActions extends AuthorizationActions {}

export interface SiteUsersAuthorizations
  extends AuthorizationAttributes,
  SiteUsersAuthorizationActions {
  canUpdateSiteUsers?: boolean;
}

export interface SiteUsersAuthorizationActions extends DataResultAuthorizationActions {}

export interface SiteUserAuthorizationActions extends AuthorizationActions {}

// ASSETS
export interface AssetsAuthorizations extends AuthorizationAttributes, AssetsAuthorizationActions {}

export interface AssetsAuthorizationActions extends DataResultAuthorizationActions {
  canListSites?: boolean;
  canListSiteAreas?: boolean;
}

export interface AssetAuthorizationActions extends AuthorizationActions {
  canRetrieveConsumption?: boolean;
  canReadConsumption?: boolean;
  canCheckConnection?: boolean;
}

export interface SiteAreasAuthorizations
  extends AuthorizationAttributes,
  DataResultAuthorizationActions {}

export interface CompaniesAuthorizations
  extends AuthorizationAttributes,
  DataResultAuthorizationActions {}

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

export interface SitesAuthorizations extends AuthorizationAttributes, SitesAuthorizationActions {}

export interface SitesAuthorizationActions extends DataResultAuthorizationActions {
  canListCompanies: boolean;
}

export interface SiteAuthorizationActions extends AuthorizationActions {
  canAssignUnassignUsers?: boolean;
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

export interface BillingAccountsAuthorizations extends DataResultAuthorizationActions {
  canListUsers?: boolean;
}
export interface BillingInvoicesAuthorizations
  extends AuthorizationAttributes,
  BillingInvoicesAuthorizationActions {}

export interface BillingTaxesAuthorizations
  extends AuthorizationAttributes,
  BillingTaxesAuthorizationActions {}

export interface BillingTransfersAuthorizations
  extends AuthorizationAttributes,
  BillingTransfersAuthorizationActions {}

export interface BillingInvoicesAuthorizationActions extends DataResultAuthorizationActions {
  canListUsers?: boolean;
}

export interface BillingTaxesAuthorizationActions extends DataResultAuthorizationActions {}

export interface BillingTransfersAuthorizationActions extends DataResultAuthorizationActions {
  canListUsers?: boolean;
}

export interface BillingInvoiceAuthorizationActions extends AuthorizationActions {
  canDownload?: boolean;
}

export interface BillingPaymentMethodsAuthorizationActions extends DataResultAuthorizationActions {}

export interface BillingPaymentMethodAuthorizationActions extends AuthorizationActions {}

export interface ChargingStationTemplateAuthorizations
  extends AuthorizationAttributes,
  ChargingStationTemplateAuthorizationActions {}

export interface ChargingStationTemplateAuthorizationActions
  extends DataResultAuthorizationActions {}
export interface ChargingStationsAuthorizations
  extends AuthorizationAttributes,
  ChargingStationsAuthorizationActions {}

export interface ChargingProfilesAuthorizations
  extends AuthorizationAttributes,
  DataResultAuthorizationActions {
  canListChargingStations?: boolean;
}

export interface ChargingStationsAuthorizationActions extends DataResultAuthorizationActions {
  canListUsers?: boolean;
  canListSites?: boolean;
  canListSiteAreas?: boolean;
  canListCompanies?: boolean;
  canExport?: boolean;
}

export interface ChargingStationAuthorizationActions extends AuthorizationActions {
  canExport?: boolean;
  canListCompanies?: boolean;
  canListSites?: boolean;
  canListSiteAreas?: boolean;
  canListUsers?: boolean;
  canReserveNow?: boolean;
  canReset?: boolean;
  canClearCache?: boolean;
  canGetConfiguration?: boolean;
  canChangeConfiguration?: boolean;
  canSetChargingProfile?: boolean;
  canGetCompositeSchedule?: boolean;
  canClearChargingProfile?: boolean;
  canGetDiagnostics?: boolean;
  canUpdateFirmware?: boolean;
  canRemoteStopTransaction?: boolean;
  canStopTransaction?: boolean;
  canStartTransaction?: boolean;
  canChangeAvailability?: boolean;
  canRemoteStartTransaction?: boolean;
  canUnlockConnector?: boolean;
  canDataTransfer?: boolean;
  canGenerateQrCode?: boolean;
  canMaintainPricingDefinitions?: boolean;
  canUpdateOCPPParams?: boolean;
  canLimitPower?: boolean;
  canDeleteChargingProfile?: boolean;
  canGetOCPPParams?: boolean;
  canUpdateChargingProfile?: boolean;
  canGetConnectorQRCode?: boolean;
  canListCompletedTransactions?: boolean;
}

export interface ChargingProfileAuthorizationActions extends AuthorizationActions {
  canReadSiteArea?: boolean;
}

export interface TransactionsAuthorizations
  extends AuthorizationAttributes,
  TransactionsAuthorizationActions {}

export interface TransactionsAuthorizationActions extends DataResultAuthorizationActions {
  canListUsers?: boolean;
  canListSites?: boolean;
  canListSiteAreas?: boolean;
  canListChargingStations?: boolean;
  canListTags?: boolean;
  canExport?: boolean;
  canDelete?: boolean;
  canSyncRefund?: boolean;
  canRefund?: boolean;
  canReadSetting?: boolean;
}

export interface TransactionAuthorizationActions extends AuthorizationActions {
  canSynchronizeRefundedTransaction?: boolean;
  canRefundTransaction?: boolean;
  canPushTransactionCDR?: boolean;
  canGetAdvenirConsumption?: boolean;
  canRemoteStopTransaction?: boolean;
  canGetChargingStationTransactions?: boolean;
  canExportOcpiCdr?: boolean;
  canListLogs?: boolean;
  canReadChargingStation?: boolean;
}

export interface SettingsAuthorizations
  extends AuthorizationAttributes,
  SettingsAuthorizationActions {}

export interface SettingsAuthorizationActions extends DataResultAuthorizationActions {}

export interface SettingAuthorizationActions extends AuthorizationActions {
  canSyncRefund?: boolean;
  canCheckBillingConnection?: boolean;
  canActivateBilling?: boolean;
  canCheckSmartChargingConnection?: boolean;
  canCheckAssetConnection?: boolean;
}

export interface OcpiEndpointsAuthorizations
  extends AuthorizationAttributes,
  OcpiEndpointsAuthorizationActions {}

export interface OcpiEndpointsAuthorizationActions extends DataResultAuthorizationActions {
  canPing?: boolean;
  canGenerateLocalToken?: boolean;
}

export interface OcpiEndpointAuthorizationActions extends AuthorizationActions {
  canPing?: boolean;
  canGenerateLocalToken?: boolean;
  canRegister?: boolean;
  canTriggerJob?: boolean;
}

export interface StatisticsAuthorizations
  extends AuthorizationAttributes,
  StatisticsAuthorizationActions {
  canListUsers?: boolean;
  canListChargingStations?: boolean;
  canListSites?: boolean;
  canListSiteAreas?: boolean;
  canExport?: boolean;
}

export interface StatisticsAuthorizationActions extends AuthorizationActions {}

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

export interface BillingAccountAuthorizationActions extends AuthorizationActions {
  canOnboard?: boolean;
}

export interface BillingTransferAuthorizationActions extends AuthorizationActions {
  canTransfer?: boolean;
  canDownload?: boolean;
}

export interface ReservationsAuthorizationActions
  extends AuthorizationActions,
  DataResultAuthorizationActions {
  canCancel?: boolean;
  canExport?: boolean;
  canListUsers?: boolean;
  canListSites?: boolean;
  canListSiteAreas?: boolean;
  canListTags?: boolean;
  canListChargingStations?: boolean;
  canListCompanies?: boolean;
}

export interface ReservationsAuthorizations
  extends AuthorizationAttributes,
  ReservationsAuthorizationActions {}
