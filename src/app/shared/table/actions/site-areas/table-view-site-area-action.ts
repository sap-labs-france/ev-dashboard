import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { SiteArea, SiteAreaButtonAction } from '../../../../types/SiteArea';
import { TableActionDef } from '../../../../types/Table';
import { TableViewAction } from '../table-view-action';

export interface TableViewSiteAreaActionDef extends TableActionDef {
  action: (siteAreaDialogComponent: ComponentType<unknown>, siteArea: SiteArea, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableViewSiteAreaAction extends TableViewAction {
  public getActionDef(): TableViewSiteAreaActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.VIEW_SITE_AREA,
      action: this.viewSiteArea,
    };
  }

  private viewSiteArea(siteAreaDialogComponent: ComponentType<unknown>, siteArea: SiteArea, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.view(siteAreaDialogComponent, siteArea.id, dialog, refresh);
  }
}
