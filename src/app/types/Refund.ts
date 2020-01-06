import { Data } from './Table';
import { User } from './User';

export interface RefundReport extends Data {
  id: string;
  user: User;
}
