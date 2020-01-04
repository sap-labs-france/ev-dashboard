import { Data } from './Table';

export interface Tenant extends Data {
  id: string;
  name: string;
  email: string;
  subdomain: string;
  components?: any;
}
