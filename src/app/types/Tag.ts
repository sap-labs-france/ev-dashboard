import { Data } from './Table';
import { User } from './User';

export interface Tag extends Data {
  id: string;
  issuer: boolean;
  active: boolean;
  userID?: string;
  description?: string;
  sessionCount?: number;
  lastChangedBy?: Partial<User>;
  lastChangedOn?: Date;
}
