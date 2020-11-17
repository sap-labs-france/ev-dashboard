import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { Site, SiteButtonAction } from '../../../../types/Site';
import { TableActionDef } from '../../../../types/Table';
import { TableViewAction } from '../table-view-action';

export interface TableViewSiteActionDef extends TableActionDef {
  action: (siteDialogComponent: ComponentType<unknown>, site: Site, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableViewSiteAction extends TableViewAction {
  public getActionDef(): TableViewSiteActionDef {
    return {
      ...super.getActionDef(),
      id: SiteButtonAction.VIEW_SITE,
      action: this.viewSite,
    };
  }

  private viewSite(siteDialogComponent: ComponentType<unknown>, site: Site, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.view(siteDialogComponent, site.id, dialog, refresh);
  }
}
