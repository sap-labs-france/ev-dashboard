export class User {
  id: String;
  name: String;
  firstName: String;
  fullName: String;
  tagIDs: String;
  email: String;
  phone: Date;
  mobile: String;
  address: {
    address1: String;
    address2: String;
    postalCode: String;
    city: String;
    department: String;
    region: String;
    country: String;
    latitude: Number;
    longitude: Number;
  };
  iNumber: String;
  costCenter: Boolean;
  status: String;
  image: String;
  createdBy: String;
  createdOn: Date;
  lastChangedBy: String;
  lastChangedOn: Date;
  role: String;
  locale: String;
  auths: any;
}
