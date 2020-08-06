import { Address } from './Address';
import { Data } from './Table';

export interface Tenant extends Data {
  id: string;
  name: string;
  email: string;
  address: Address;
  subdomain: string;
  components?: any;
  logo: string;
}

export enum TenantButtonAction {
  VIEW_TENANT = 'view_tenant',
  EDIT_TENANT = 'edit_tenant',
  CREATE_TENANT = 'create_tenant',
  DELETE_TENANT = 'delete_tenant',
}

export enum TenantLogo {
  NO_LOGO = 'assets/img/theme/no-logo.png',
}
