import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogMode, DialogParams } from '../../../../types/Authorization';
import { ScreenSize } from '../../../../types/GlobalType';
import { Site, SiteButtonAction } from '../../../../types/Site';
import { TableActionDef } from '../../../../types/Table';
import { TableAssignAction } from '../table-assign-action';

export interface TableViewAssignedUsersOfSiteActionDef extends TableActionDef {
  action: (siteUsersDialogComponent: ComponentType<unknown>, site: DialogParams<Site>,
    dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableViewAssignedUsersOfSiteAction extends TableAssignAction {
  public getActionDef(): TableViewAssignedUsersOfSiteActionDef {
    return {
      ...super.getActionDef(),
      id: SiteButtonAction.VIEW_USERS_OF_SITE,
      icon: 'people',
      name: 'sites.display_users',
      tooltip: 'general.tooltips.display_users',
      action: this.viewAssignedUsersOfSite,
    };
  }

  private viewAssignedUsersOfSite(siteUsersDialogComponent: ComponentType<unknown>, site: DialogParams<Site>,
    dialog: MatDialog, refresh?: () => Observable<void>) {
    super.assign(siteUsersDialogComponent, dialog, site, DialogMode.VIEW, refresh, {
      minWidth: ScreenSize.L,
      maxWidth: ScreenSize.XXL,
      width: ScreenSize.XL,
      minHeight: ScreenSize.L,
      maxHeight: ScreenSize.XXL,
      height: ScreenSize.XL
    });
  }
}
