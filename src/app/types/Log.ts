import { ServerAction } from './Server';
import { TableData } from './Table';
import { User } from './User';

export interface Log extends TableData {
  id: string;
  level: string;
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

export interface LogAction extends TableData {
  action: ServerAction;
}

export enum LogButtonAction {
  EXPORT_LOGS = 'export_logs',
  NAVIGATE_TO_LOGS = 'navigate_to_logs',
}
