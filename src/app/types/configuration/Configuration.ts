import AdvancedConfiguration from './AdvancedConfiguration';
import AssetConfiguration from './AssetConfiguration';
import AuthorizationConfiguration from './AuthorizationConfiguration';
import CarConfiguration from './CarConfiguration';
import CentralSystemServerConfiguration from './CentralSystemServerConfiguration';
import CompanyConfiguration from './CompanyConfiguration';
import Debug from './Debug';
import Landscape from './Landscape';
import LocalesConfiguration from './LocalesConfiguration';
import SiteAreaConfiguration from './SiteAreaConfiguration';
import SiteConfiguration from './SiteConfiguration';
import TenantConfiguration from './TenantConfiguration';
import UserConfiguration from './UserConfiguration';

export interface Configuration {
  Advanced: AdvancedConfiguration;
  Authorization: AuthorizationConfiguration;
  CentralSystemServer: CentralSystemServerConfiguration;
  Company: CompanyConfiguration;
  Asset: AssetConfiguration;
  Locales: LocalesConfiguration;
  SiteArea: SiteAreaConfiguration;
  Site: SiteConfiguration;
  User: UserConfiguration;
  Car: CarConfiguration;
  Tenant: TenantConfiguration;
  Debug?: Debug;
  Landscape?: Landscape;
}
