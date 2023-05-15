import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParamsWithAuth, SiteAreasAuthorizations } from '../../../../types/Authorization';
import { SiteArea, SiteAreaButtonAction } from '../../../../types/SiteArea';
import { TableActionDef } from '../../../../types/Table';
import { TableViewAction } from '../table-view-action';

export interface TableViewSiteAreaActionDef extends TableActionDef {
  action: (
    siteAreaDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<SiteArea, SiteAreasAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableViewSiteAreaAction extends TableViewAction {
  public getActionDef(): TableViewSiteAreaActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.VIEW_SITE_AREA,
      action: this.viewSiteArea,
    };
  }

  private viewSiteArea(
    siteAreaDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<SiteArea, SiteAreasAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.view(siteAreaDialogComponent, dialog, dialogParams, refresh);
  }
}
