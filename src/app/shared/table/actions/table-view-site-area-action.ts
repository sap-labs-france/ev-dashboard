import { SiteArea, SiteAreaButtonAction } from 'app/types/SiteArea';

import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { SiteAreaDialogComponent } from 'app/pages/organization/site-areas/site-area/site-area-dialog.component';
import { TableActionDef } from 'app/types/Table';
import { TableViewAction } from './table-view-action';

export class TableViewSiteAreaAction extends TableViewAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.VIEW_SITE_AREA,
      action: this.viewSiteArea,
    };
  }

  private viewSiteArea(siteArea: SiteArea, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.view(SiteAreaDialogComponent, siteArea, dialog, refresh);
  }
}
