import { Data } from './Table';

export interface Tenant extends Data {
  id: string;
  name: string;
  email: string;
  subdomain: string;
  components?: any;
}

export enum TenantButtonAction {
  VIEW_TENANT = 'view_tenant',
  EDIT_TENANT = 'edit_tenant',
  CREATE_TENANT = 'create_tenant',
  DELETE_TENANT = 'delete_tenant',
}
