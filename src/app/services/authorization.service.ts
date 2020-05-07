import { Injectable } from '@angular/core';
import { Action, Entity, Role } from 'app/types/Authorization';
import { SiteArea } from 'app/types/SiteArea';
import TenantComponents from 'app/types/TenantComponents';
import { UserToken } from 'app/types/User';

import { CentralServerService } from './central-server.service';
import { ComponentService } from './component.service';

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
    return this.canAccess(Entity.CHARGING_STATION, Action.UPDATE);
  }

  public canUpdateCompany(): boolean {
    return this.canAccess(Entity.COMPANY, Action.UPDATE);
  }

  public canUpdateAsset(): boolean {
    return this.canAccess(Entity.ASSET, Action.UPDATE);
  }

  public canUpdateSite(): boolean {
    return this.canAccess(Entity.SITE, Action.UPDATE);
  }

  public canUpdateSiteArea(): boolean {
    return this.canAccess(Entity.SITE_AREA, Action.UPDATE);
  }

  public canListSettings(): boolean {
    return this.canAccess(Entity.SETTINGS,
      Action.LIST);
  }

  public canUpdateUser(): boolean {
    return this.canAccess(Entity.USER, Action.UPDATE);
  }

  public canSynchronizeUsers(): boolean {
    return this.canAccess(Entity.BILLING, Action.SYNCHRONIZE_USERS);
  }

  public canSynchronizeInvoices(): boolean {
    return this.canAccess(Entity.INVOICES, Action.SYNCHRONIZE_INVOICES);
  }

  public canAccess(resource: string, action: string): boolean {
    return !!this.loggedUser && !!this.loggedUser.scopes && this.loggedUser.scopes.includes(`${resource}:${action}`);
  }

  public canStopTransaction(siteArea: SiteArea, badgeID: string) {
    if (this.canAccess(Entity.CHARGING_STATION, Action.REMOTE_STOP_TRANSACTION)) {
      if (!!this.loggedUser && !!this.loggedUser.tagIDs && this.loggedUser.tagIDs.includes(badgeID)) {
        return true;
      }
      if (this.componentService.isActive(TenantComponents.ORGANIZATION)) {
        return siteArea && (this.isSiteAdmin(siteArea.siteID) || this.isAdmin());
      }
      return this.isAdmin();
    }
    return false;
  }

  public canStartTransaction(siteArea: SiteArea) {
    if (this.canAccess(Entity.CHARGING_STATION, Action.REMOTE_START_TRANSACTION)) {
      if (this.componentService.isActive(TenantComponents.ORGANIZATION)) {
        if (!siteArea) {
          return false;
        }
        return !siteArea.accessControl || this.isSiteAdmin(siteArea.siteID) || this.isAdmin() ||
          (!!this.loggedUser && !!this.loggedUser.sites && this.loggedUser.sites.includes(siteArea.siteID));
      }
      return true;
    }
    return false;
  }

  public canReadTransaction(siteArea: SiteArea, badgeID: string) {
    if (this.canAccess(Entity.TRANSACTION, Action.READ)) {
      if (!!this.loggedUser && !!this.loggedUser.tagIDs && this.loggedUser.tagIDs.includes(badgeID)) {
        return true;
      }
      if (this.componentService.isActive(TenantComponents.ORGANIZATION) && siteArea) {
        return this.isAdmin() || this.isSiteAdmin(siteArea.siteID) || (this.isDemo() && this.isSiteUser(siteArea.siteID));
      }
      return this.isAdmin() || this.isDemo();
    }
    return false;
  }

  public isSiteAdmin(siteID: string): boolean {
    return !!this.loggedUser && !!this.loggedUser.sitesAdmin && this.loggedUser.sitesAdmin.includes(siteID);
  }

  public isSiteOwner(siteID: string): boolean {
    return !!this.loggedUser && !!this.loggedUser.sitesOwner && this.loggedUser.sitesOwner.includes(siteID);
  }

  public isSiteUser(siteID: string): boolean {
    if (this.isAdmin()) {
      return true;
    }
    if (this.canAccess(Entity.SITE, Action.READ)) {
      return !!this.loggedUser && !!this.loggedUser.sites && this.loggedUser.sites.includes(siteID);
    }
    return false;
  }

  public isAdmin(): boolean {
    if (this.loggedUser) {
      return this.loggedUser.role === Role.ADMIN;
    }
    return false;
  }

  public hasSitesAdminRights(): boolean {
    if (this.canAccess(Entity.SITE, Action.UPDATE)) {
      return !!this.loggedUser && !!this.loggedUser.sitesAdmin && this.loggedUser.sitesAdmin.length > 0;
    }
    return false;
  }

  public getSitesAdmin(): ReadonlyArray<string> {
    return !!this.loggedUser && this.loggedUser.sitesAdmin ? this.loggedUser.sitesAdmin : [];
  }

  public isSuperAdmin(): boolean {
    if (this.loggedUser) {
      return this.loggedUser.role === Role.SUPER_ADMIN;
    }
    return false;
  }

  public isBasic(): boolean {
    if (this.loggedUser) {
      return this.loggedUser.role === Role.BASIC;
    }
    return false;
  }

  public isDemo(): boolean {
    if (this.loggedUser) {
      return this.loggedUser.role === Role.DEMO;
    }
    return false;
  }
}
