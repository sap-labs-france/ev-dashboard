import { Data } from './Table';
import { User } from './User';

export interface Tag extends Data {
  id: string;
  issuer: boolean;
  userID?: string;
  description?: string;
  deleted?: boolean;
  lastChangedBy?: Partial<User>;
  lastChangedOn?: Date;
}
