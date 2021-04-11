import { Address } from './Address';
import { Company } from './Company';
import CreatedUpdatedProps from './CreatedUpdatedProps';
import { SiteArea } from './SiteArea';
import { Data } from './Table';
import { User } from './User';

export interface Site extends Data, CreatedUpdatedProps {
  id: string;
  name: string;
  companyID: string;
  company: Company;
  issuer: boolean;
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
}

export interface SiteUser extends Data {
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
  ASSIGN_USERS_TO_SITE = 'assign_users_to_site'
}
