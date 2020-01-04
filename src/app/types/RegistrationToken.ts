import { Data } from './Table';

export interface RegistrationToken extends Data {
  id: string;
  description?: string;
  createdOn: Date;
  expirationDate: Date;
  revocationDate?: Date;
  siteAreaID: string;
  ocpp15Url: string;
  ocpp16Url: string;
}
