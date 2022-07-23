import { Address } from './Address';
import { BillingAccountData } from './Billing';
import CreatedUpdatedProps from './CreatedUpdatedProps';
import { TableData } from './Table';

export interface Company extends TableData, CreatedUpdatedProps {
  id: string;
  name: string;
  address: Address;
  logo: string;
  issuer: boolean;
  accountData?: BillingAccountData;
}

export enum CompanyButtonAction {
  VIEW_COMPANY = 'view_company',
  EDIT_COMPANY = 'edit_company',
  CREATE_COMPANY = 'create_company',
  DELETE_COMPANY = 'delete_company',
}
