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
  EDIT_TENANT = 'edit_tenant',
  CREATE_TENANT = 'create_tenant',
  DELETE_TENANT = 'delete_tenant',
}
