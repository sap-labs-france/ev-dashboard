import { Data } from './Table';
import { User } from './User';

export interface Tag extends Data {
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
