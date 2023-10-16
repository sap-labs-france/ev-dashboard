import { Address } from './Address';
import { UserAuthorizationActions } from './Authorization';
import { BillingUserData } from './Billing';
import { Car } from './Car';
import CreatedUpdatedProps from './CreatedUpdatedProps';
import { TableData } from './Table';
import { Tag } from './Tag';
import { SmartChargingRuntimeSessionParameters, StartTransactionErrorCode } from './Transaction';

export interface User extends TableData, CreatedUpdatedProps, UserAuthorizationActions {
  id: string;
  issuer: boolean;
  name: string;
  firstName: string;
  fullName: string;
  tags: Tag[];
  plateID: string;
  email: string;
  phone: Date;
  mobile: string;
  notificationsActive: boolean;
  notifications: UserNotifications;
  address: Address;
  iNumber: string;
  costCenter: boolean;
  status: string;
  image: string | null;
  role: UserRole;
  locale: string;
  language: string;
  numberOfSites: number;
  activeComponents?: string[];
  scopes: string[];
  companies: string[];
  sites: string[];
  sitesAdmin: string[];
  sitesOwner: string[];
  userHashID: number;
  tenantHashID: number;
  eulaAcceptedHash: string;
  eulaAcceptedVersion: number;
  eulaAcceptedOn: Date;
  billingData: BillingUserData;
  technical: boolean;
  freeAccess: boolean;
}

export interface UserNotifications {
  sendSessionStarted: boolean;
  sendOptimalChargeReached: boolean;
  sendEndOfCharge: boolean;
  sendEndOfSession: boolean;
  sendUserAccountStatusChanged: boolean;
  sendNewRegisteredUser: boolean;
  sendUnknownUserBadged: boolean;
  sendChargingStationStatusError: boolean;
  sendChargingStationRegistered: boolean;
  sendOcpiPatchStatusError: boolean;
  sendOicpPatchStatusError: boolean;
  sendUserAccountInactivity: boolean;
  sendPreparingSessionNotStarted: boolean;
  sendOfflineChargingStations: boolean;
  sendBillingSynchronizationFailed: boolean;
  sendBillingPeriodicOperationFailed: boolean;
  sendSessionNotStarted: boolean;
  sendCarCatalogSynchronizationFailed: boolean;
  sendComputeAndApplyChargingProfilesFailed: boolean;
  sendEndUserErrorNotification: boolean;
  sendBillingNewInvoice: boolean;
  sendAdminAccountVerificationNotification: boolean;
}

export interface UserSessionContext {
  car?: Car;
  tag?: Tag;
  errorCodes?: StartTransactionErrorCode[];
  smartChargingSessionParameters?: SmartChargingRuntimeSessionParameters;
}

export interface UserToken {
  id?: string;
  role?: string;
  name?: string;
  email?: string;
  mobile?: string;
  firstName?: string;
  locale?: string;
  language?: string;
  currency?: string;
  tagIDs?: string[];
  tenantID: string;
  tenantName?: string;
  tenantSubdomain?: string;
  userHashID?: string;
  tenantHashID?: string;
  scopes?: readonly string[];
  companies?: string[];
  sites?: string[];
  sitesAdmin?: string[];
  sitesOwner?: string[];
  activeComponents?: string[];
}

export interface SiteUser extends TableData {
  user: User;
  siteID: string;
  siteAdmin: boolean;
  siteOwner: boolean;
}

export enum UserButtonAction {
  EDIT_USER = 'edit_user',
  CREATE_USER = 'create_user',
  DELETE_USER = 'delete_user',
  SYNCHRONIZE_BILLING_USER = 'billing_synchronize_user',
  BILLING_FORCE_SYNCHRONIZE_USER = 'billing_force_synchronize_user',
  BILLING_CREATE_PAYMENT_METHOD = 'billing_create_payment_method',
  ASSIGN_SITES_TO_USER = 'assign_sites_to_user',
  EXPORT_USERS = 'export_users',
  IMPORT_USERS = 'import_users',
  NAVIGATE_TO_USER = 'navigate_to_user',
  VIEW_SITES_OF_USER = 'view_sites_of_user',
}

export enum UserStatus {
  PENDING = 'P',
  ACTIVE = 'A',
  DELETED = 'D',
  INACTIVE = 'I',
  BLOCKED = 'B',
  LOCKED = 'L',
  UNKNOWN = 'U',
}

export enum UserRole {
  SUPER_ADMIN = 'S',
  ADMIN = 'A',
  BASIC = 'B',
  DEMO = 'D',
  UNKNOWN = 'U',
}

export const UserRequiredImportProperties = ['email', 'firstName', 'name'];

export const UserOptionalImportProperties = ['siteIDs'];
