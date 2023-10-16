import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParamsWithAuth, SitesAuthorizations } from '../../../../types/Authorization';
import { Site, SiteButtonAction } from '../../../../types/Site';
import { TableActionDef } from '../../../../types/Table';
import { TableViewAction } from '../table-view-action';

export interface TableViewSiteActionDef extends TableActionDef {
  action: (
    siteDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Site, SitesAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableViewSiteAction extends TableViewAction {
  public getActionDef(): TableViewSiteActionDef {
    return {
      ...super.getActionDef(),
      id: SiteButtonAction.VIEW_SITE,
      action: this.viewSite,
    };
  }

  private viewSite(
    siteDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Site, SitesAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.view(siteDialogComponent, dialog, dialogParams, refresh);
  }
}
