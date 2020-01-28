import { Injectable } from '@angular/core';
import { Actions, Entities, Roles } from 'app/types/Authorization';
import { SiteArea } from 'app/types/SiteArea';
import { UserToken } from 'app/types/User';
import { Constants } from '../utils/Constants';
import { CentralServerService } from './central-server.service';
import { ComponentService, ComponentType } from './component.service';

@Injectable()
export class AuthorizationService {
  private loggedUser!: UserToken | null;

  constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService) {

    this.centralServerService.getCurrentUserSubject().subscribe((user) => {
      this.loggedUser = user;
    });
  }

  public cleanUserAndUserAuthorization() {
    this.loggedUser = null;
  }

  public canUpdateChargingStation(): boolean {
    return this.canAccess(Entities.CHARGING_STATION, Actions.UPDATE);
  }

  public canUpdateCompany(): boolean {
    return this.canAccess(Entities.COMPANY, Actions.UPDATE);
  }

  public canUpdateSite(): boolean {
    return this.canAccess(Entities.SITE, Actions.UPDATE);
  }

  public canUpdateSiteArea(): boolean {
    return this.canAccess(Entities.SITE_AREA, Actions.UPDATE);
  }

  public canListSettings(): boolean {
    return this.canAccess(Entities.SETTINGS,
      Actions.LIST);
  }

  public canUpdateUser(): boolean {
    return this.canAccess(Entities.USER, Actions.UPDATE);
  }

  public canSynchronizeUsers(): boolean {
    return this.canAccess(Entities.BILLING, Actions.SYNCHRONIZE_USERS_BILLING);
  }

  public canAccess(resource: string, action: string): boolean {
    return !!this.loggedUser && !!this.loggedUser.scopes && this.loggedUser.scopes.includes(`${resource}:${action}`);
  }

  public canStopTransaction(siteArea: SiteArea, badgeID: string) {
    if (this.canAccess(Entities.CHARGING_STATION, Actions.REMOTE_STOP_TRANSACTION)) {
      if (!!this.loggedUser && !!this.loggedUser.tagIDs && this.loggedUser.tagIDs.includes(badgeID)) {
        return true;
      }
      if (this.componentService.isActive(ComponentType.ORGANIZATION)) {
        return siteArea && this.isSiteAdmin(siteArea.siteID);
      }
      return this.isAdmin();
    }
    return false;
  }

  public canStartTransaction(siteArea: SiteArea) {
    if (this.canAccess(Entities.CHARGING_STATION, Actions.REMOTE_START_TRANSACTION)) {
      if (this.componentService.isActive(ComponentType.ORGANIZATION)) {
        if (!siteArea) {
          return false;
        }
        return !siteArea.accessControl || this.isSiteAdmin(siteArea.siteID) ||
          (!!this.loggedUser && !!this.loggedUser.sites && this.loggedUser.sites.includes(siteArea.siteID));
      }
      return true;
    }
    return false;
  }

  public canReadTransaction(siteArea: SiteArea, badgeID: string) {
    if (this.canAccess(Entities.TRANSACTION, Actions.READ)) {
      if (!!this.loggedUser && !!this.loggedUser.tagIDs && this.loggedUser.tagIDs.includes(badgeID)) {
        return true;
      }
      if (this.componentService.isActive(ComponentType.ORGANIZATION) && siteArea) {
        return this.isSiteAdmin(siteArea.siteID) || (this.isDemo() && this.isSiteUser(siteArea.siteID));
      }
      return this.isAdmin() || this.isDemo();
    }
    return false;
  }

  public isSiteAdmin(siteID: string): boolean {
    if (this.isAdmin()) {
      return true;
    }
    return !!this.loggedUser && !!this.loggedUser.sitesAdmin && this.loggedUser.sitesAdmin.includes(siteID);
  }

  public isSiteOwner(siteID: string): boolean {
    return !!this.loggedUser && !!this.loggedUser.sitesOwner && this.loggedUser.sitesOwner.includes(siteID);
  }

  public isSiteUser(siteID: string): boolean {
    if (this.isAdmin()) {
      return true;
    }
    if (this.canAccess(Entities.SITE, Actions.READ)) {
      return !!this.loggedUser && !!this.loggedUser.sites && this.loggedUser.sites.includes(siteID);
    }
    return false;
  }

  public isAdmin(): boolean {
    if (this.loggedUser) {
      return this.loggedUser.role === Roles.ADMIN;
    }
    return false;
  }

  public hasSitesAdminRights(): boolean {
    if (this.canAccess(Entities.SITE, Actions.UPDATE)) {
      return !!this.loggedUser && !!this.loggedUser.sitesAdmin && this.loggedUser.sitesAdmin.length > 0;
    }
    return false;
  }

  public getSitesAdmin(): ReadonlyArray<string> {
    return !!this.loggedUser && this.loggedUser.sitesAdmin ? this.loggedUser.sitesAdmin : [];
  }

  public isSuperAdmin(): boolean {
    if (this.loggedUser) {
      return this.loggedUser.role === Roles.SUPER_ADMIN;
    }
    return false;
  }

  public isBasic(): boolean {
    if (this.loggedUser) {
      return this.loggedUser.role === Roles.BASIC;
    }
    return false;
  }

  public isDemo(): boolean {
    if (this.loggedUser) {
      return this.loggedUser.role === Roles.DEMO;
    }
    return false;
  }
}
