export interface User {
  id: string;
  name: string;
  firstName: string;
  fullName: string;
  tagIDs: string;
  email: string;
  phone: Date;
  mobile: string;
  address: {
    address1: string;
    address2: string;
    postalCode: string;
    city: string;
    department: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  iNumber: string;
  costCenter: boolean;
  status: string;
  image: string;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
  role: string;
  locale: string;
  auths: any;
  language: string;
  numberOfSites: number;
}
