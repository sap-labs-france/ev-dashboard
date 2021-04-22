import { TableData } from './Table';

export interface IntegrationConnection extends TableData {
  id: string;
  connectorId: string;
  createdAt: Date;
  validUntil: Date;
}

export interface UserConnection {
  connectorId: string;
  userId: string;
  data: {
    [key: string]: string;
  };
}
