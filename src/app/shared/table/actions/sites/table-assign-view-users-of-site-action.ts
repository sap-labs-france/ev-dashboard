import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import {
  DialogMode,
  DialogParamsWithAuth,
  SitesAuthorizations,
} from '../../../../types/Authorization';
import { Site, SiteButtonAction } from '../../../../types/Site';
import { TableActionDef } from '../../../../types/Table';
import { TableAssignAction } from '../table-assign-action';

export interface TableViewAssignedUsersOfSiteActionDef extends TableActionDef {
  action: (
    siteUsersDialogComponent: ComponentType<unknown>,
    site: DialogParamsWithAuth<Site, SitesAuthorizations>,
    dialog: MatDialog,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableViewAssignedUsersOfSiteAction extends TableAssignAction {
  public getActionDef(): TableViewAssignedUsersOfSiteActionDef {
    return {
      ...super.getActionDef(),
      id: SiteButtonAction.VIEW_USERS_OF_SITE,
      icon: 'person_search',
      name: 'sites.display_users',
      tooltip: 'general.tooltips.display_users',
      action: this.viewAssignedUsersOfSite,
    };
  }

  private viewAssignedUsersOfSite(
    siteUsersDialogComponent: ComponentType<unknown>,
    site: DialogParamsWithAuth<Site, SitesAuthorizations>,
    dialog: MatDialog,
    refresh?: () => Observable<void>
  ) {
    super.assign(siteUsersDialogComponent, dialog, site, DialogMode.VIEW, refresh);
  }
}
