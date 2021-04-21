import { SiteArea } from './SiteArea';
import { TableData } from './Table';

export interface RegistrationToken extends TableData {
  id: string;
  description?: string;
  createdOn: Date;
  expirationDate: Date;
  revocationDate?: Date;
  siteAreaID: string;
  siteArea?: SiteArea;
  ocpp15SOAPUrl?: string;
  ocpp16SOAPUrl?: string;
  ocpp16JSONUrl?: string;
  ocpp15SOAPSecureUrl?: string;
  ocpp16SOAPSecureUrl?: string;
  ocpp16JSONSecureUrl?: string;
}


export enum RegistrationTokenButtonAction {
  CREATE_TOKEN = 'create_token',
  REVOKE_TOKEN = 'revoke_token',
  DELETE_TOKEN = 'delete_token',
  COPY_TOKEN = 'copy_token',
  EDIT_TOKEN = 'edit_token',
  COPY_URL = 'copy'
}
