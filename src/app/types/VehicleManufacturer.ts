import { Vehicle } from './Vehicle';

export interface VehicleManufacturer {
  id: string;
  logo: string;
  name: string;
  vehicles: Vehicle[];
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}
