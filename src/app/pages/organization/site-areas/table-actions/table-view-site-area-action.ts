import { MatDialog } from '@angular/material/dialog';
import { SiteAreaDialogComponent } from 'app/pages/organization/site-areas/site-area/site-area-dialog.component';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { SiteArea, SiteAreaButtonAction } from 'app/types/SiteArea';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

export class TableViewSiteAreaAction extends TableViewAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.VIEW_SITE_AREA,
      action: this.viewSiteArea,
    };
  }

  private viewSiteArea(siteArea: SiteArea, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.view(SiteAreaDialogComponent, siteArea.id, dialog, refresh);
  }
}
