import { Vehicle } from './vehicle';

export class VehicleManufacturer {
  id: String;
  logo: String;
  name: String;
  vehicles: Vehicle[];
  createdBy: String;
  createdOn: Date;
  lastChangedBy: String;
  lastChangedOn: Date;
}
