import { Address } from './Address';
import { AuthorizationActions } from './Authorization';
import CreatedUpdatedProps from './CreatedUpdatedProps';
import { Data } from './Table';

export interface Company extends Data, CreatedUpdatedProps, AuthorizationActions {
  id: string;
  name: string;
  address: Address;
  logo: string;
  issuer: boolean;
}

export enum CompanyButtonAction {
  VIEW_COMPANY = 'view_company',
  EDIT_COMPANY = 'edit_company',
  CREATE_COMPANY = 'create_company',
  DELETE_COMPANY = 'delete_company',
}
