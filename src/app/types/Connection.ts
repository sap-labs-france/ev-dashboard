import { Data } from './Table';

export interface IntegrationConnection extends Data {
  connectorId: string;
  createdAt: Date;
  validUntil: Date;
}

export interface UserConnection {
  connectorId: string;
  settingId: string;
  userId: string;
  data: {
    [key: string]: string;
  };
}
