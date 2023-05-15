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

export interface TableAssignUsersToSiteActionDef extends TableActionDef {
  action: (
    siteUsersDialogComponent: ComponentType<unknown>,
    site: DialogParamsWithAuth<Site, SitesAuthorizations>,
    dialog: MatDialog,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableAssignUsersToSiteAction extends TableAssignAction {
  public getActionDef(): TableAssignUsersToSiteActionDef {
    return {
      ...super.getActionDef(),
      id: SiteButtonAction.ASSIGN_USERS_TO_SITE,
      icon: 'people',
      name: 'general.edit',
      tooltip: 'general.tooltips.edit_users',
      action: this.assignUsersToSite,
    };
  }

  private assignUsersToSite(
    siteUsersDialogComponent: ComponentType<unknown>,
    site: DialogParamsWithAuth<Site, SitesAuthorizations>,
    dialog: MatDialog,
    refresh?: () => Observable<void>
  ) {
    super.assign(siteUsersDialogComponent, dialog, site, DialogMode.EDIT, refresh);
  }
}
