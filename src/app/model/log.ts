export interface Log {
  level: string;
  source: string;
  module: string;
  method: string;
  timestamp: Date;
  action: string;
  type: string;
  message: string;
  user: string,
  actionOnUser: string,
  detailedMessages: string[];
}
