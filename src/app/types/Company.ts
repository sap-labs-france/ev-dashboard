import { Address } from './Address';
import { Data } from './Table';

export interface Company extends Data {
  id: string;
  name: string;
  address: Address;
  logo: string;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export enum CompanyButtonAction {
  VIEW_COMPANY = 'view_company',
  EDIT_COMPANY = 'edit_company',
  CREATE_COMPANY = 'create_company',
  DELETE_COMPANY = 'delete_company',
}

export enum CompanyLogo {
  NO_LOGO = 'assets/img/theme/no-logo.png',
}
