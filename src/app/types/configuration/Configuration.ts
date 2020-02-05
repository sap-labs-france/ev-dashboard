import AdvancedConfiguration from './AdvancedConfiguration';
import AuthorizationConfiguration from './AuthorizationConfiguration';
import CentralSystemServerConfiguration from './CentralSystemServerConfiguration';
import CompanyConfiguration from './CompanyConfiguration';
import FrontEndConfiguration from './FrontEndConfiguration';
import LocalesConfiguration from './LocalesConfiguration';
import SiteAreaConfiguration from './SiteAreaConfiguration';
import SiteConfiguration from './SiteConfiguration';
import UserConfiguration from './UserConfiguration';
import VehicleConfiguration from './VehicleConfiguration';
import VehicleManufacturerConfiguration from './VehicleManufacturerConfiguration';

export interface Configuration {
  Advanced: AdvancedConfiguration;
  Authorization: AuthorizationConfiguration;
  CentralSystemServer: CentralSystemServerConfiguration;
  Company: CompanyConfiguration;
  FrontEnd: FrontEndConfiguration;
  Locales: LocalesConfiguration;
  SiteArea: SiteAreaConfiguration;
  Site: SiteConfiguration;
  User: UserConfiguration;
  Vehicle: VehicleConfiguration;
  VehicleManufacturer: VehicleManufacturerConfiguration;
}
