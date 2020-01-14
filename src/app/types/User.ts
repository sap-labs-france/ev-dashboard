import { Address } from './Address';
import { Data } from './Table';
import { Tag } from './Tag';

export interface User extends Data {
  id: string;
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
  image: string|null;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
  role: string;
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
  sendSmtpAuthError: boolean;
  sendUserAccountInactivity: boolean;
  sendPreparingSessionNotStarted: boolean;
  sendOfflineChargingStations: boolean;
  sendBillingUserSynchronizationFailed: boolean;
}

export interface UserToken {
  id?: string;
  role?: string;
  name?: string;
  firstName?: string;
  locale?: string;
  language?: string;
  currency?: string;
  tagIDs?: string[];
  tenantID: string;
  tenantName?: string;
  userHashID?: string;
  tenantHashID?: string;
  scopes?: readonly string[];
  companies?: string[];
  sites?: string[];
  sitesAdmin?: string[];
  activeComponents?: string[];
  sitesOwner?: string[];
}
