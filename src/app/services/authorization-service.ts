import { Injectable } from '@angular/core';
import { User } from '../common.types';
import { Constants } from '../utils/Constants';
import { CentralServerService } from './central-server.service';

@Injectable()
export class AuthorizationService {
  private loggedUser: User;

  constructor(
    private centralServerService: CentralServerService) {

    this.centralServerService.getCurrentUserSubject().subscribe(user => {
      this.loggedUser = user;
    });
  }

  public cleanUserAndUserAuthorization() {
    this.loggedUser = null;
  }

  public canUpdateChargingStation(): boolean {
    return this.canAccess(Constants.ENTITY_CHARGING_STATION, Constants.ACTION_UPDATE);
  }

  public canUpdateCompany(): boolean {
    return this.canAccess(Constants.ENTITY_COMPANY, Constants.ACTION_UPDATE);
  }

  public canUpdateSite(): boolean {
    return this.canAccess(Constants.ENTITY_SITE, Constants.ACTION_UPDATE);
  }

  public canUpdateSiteArea(): boolean {
    return this.canAccess(Constants.ENTITY_SITE_AREA, Constants.ACTION_UPDATE);
  }

  public canListSettings(): boolean {
    return this.canAccess(Constants.ENTITY_SETTINGS,
      Constants.ACTION_LIST);
  }

  public canUpdateUser(): boolean {
    return this.canAccess(Constants.ENTITY_USER, Constants.ACTION_UPDATE);
  }

  public canAccess(resource: String, action: String): boolean {
    return this.loggedUser && this.loggedUser.scopes && this.loggedUser.scopes.includes(`${resource}:${action}`);
  }

  public isSiteAdmin(siteID: string): boolean {
    if (this.isAdmin()) {
      return true;
    }
    if (this.canAccess(Constants.ENTITY_SITE, Constants.ACTION_UPDATE)) {
      return this.loggedUser.sitesAdmin && this.loggedUser.sitesAdmin.includes(siteID);
    }
    return false;
  }

  public isAdmin(): boolean {
    if (this.loggedUser) {
      return this.loggedUser.role === Constants.ROLE_ADMIN;
    }
    return false;
  }

  public isSuperAdmin(): boolean {
    if (this.loggedUser) {
      return this.loggedUser.role === Constants.ROLE_SUPER_ADMIN;
    }
    return false;
  }

  public isBasic(): boolean {
    if (this.loggedUser) {
      return this.loggedUser.role === Constants.ROLE_BASIC;
    }
    return false;
  }

  public isDemo(): boolean {
    if (this.loggedUser) {
      return this.loggedUser.role === Constants.ROLE_DEMO;
    }
    return false;
  }
}
