import { Data } from './Table';

export interface Log extends Data {
  id: string;
  level: string;
  source: string;
  host?: string;
  process?: string;
  module: string;
  method: string;
  timestamp: Date;
  action: string;
  type: string;
  message: string;
  user: string;
  actionOnUser: string;
  detailedMessages: string[];
}

export enum LogButtonAction {
  EXPORT_LOGS = 'export_logs',
}

