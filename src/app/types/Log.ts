import { ServerAction } from './Server';
import { Data } from './Table';
import { User } from './User';

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
  user: User;
  actionOnUser: User;
  detailedMessages: string[];
}

export interface LogAction extends Data {
  action: ServerAction;
}

export enum LogButtonAction {
  EXPORT_LOGS = 'export_logs',
  NAVIGATE_TO_LOGS = 'navigate_to_logs',
}

