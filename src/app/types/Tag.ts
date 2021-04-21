import { TableData } from './Table';
import { User } from './User';

export interface Tag extends TableData {
  id: string;
  issuer: boolean;
  active: boolean;
  userID?: string;
  description?: string;
  transactionsCount?: number;
  lastChangedBy?: Partial<User>;
  lastChangedOn?: Date;
  user?: User;
  default?: boolean;
}

export const TagRequiredImportProperties = [
  'id'
];
export const TagOptionalImportProperties = [
  'description'
];
