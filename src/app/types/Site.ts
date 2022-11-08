import { Address } from './Address';
import { SiteAuthorizationActions } from './Authorization';
import { BillingAccountData } from './Billing';
import { Company } from './Company';
import CreatedUpdatedProps from './CreatedUpdatedProps';
import { SiteArea } from './SiteArea';
import { TableData } from './Table';
import { User } from './User';

export interface Site extends TableData, CreatedUpdatedProps, SiteAuthorizationActions {
  id: string;
  name: string;
  companyID: string;
  company: Company;
  issuer: boolean;
  tariffID?: string;
  ownerName?: string;
  autoUserSiteAssignment: boolean;
  siteAreas: SiteArea[];
  address: Address;
  image: string;
  images: Record<string, unknown>[];
  gps: string;
  consumptionData: Record<string, unknown>;
  occupationData: Record<string, unknown>;
  userIDs: string[];
  users: User[];
  public?: boolean;
  accountData?: BillingAccountData;
}

export interface UserSite extends TableData {
  site: Site;
  userID: string;
  siteAdmin: boolean;
  siteOwner: boolean;
}

export enum SiteButtonAction {
  VIEW_SITE = 'view_site',
  EDIT_SITE = 'edit_site',
  CREATE_SITE = 'create_site',
  DELETE_SITE = 'delete_site',
  ASSIGN_USERS_TO_SITE = 'assign_users_to_site',
  VIEW_USERS_OF_SITE = 'view_users_of_site',
}
