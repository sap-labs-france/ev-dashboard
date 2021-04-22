import { Address } from './Address';
import { TableData } from './Table';

export interface Tenant extends TableData {
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
