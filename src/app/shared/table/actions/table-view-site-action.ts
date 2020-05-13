import { MatDialog } from '@angular/material/dialog';
import { SiteDialogComponent } from 'app/pages/organization/sites/site/site-dialog.component';
import { Site, SiteButtonAction } from 'app/types/Site';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

import { TableViewAction } from './table-view-action';

export class TableViewSiteAction extends TableViewAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: SiteButtonAction.VIEW_SITE,
      action: this.viewSite,
    };
  }

  private viewSite(site: Site, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.view(SiteDialogComponent, site.id, dialog, refresh);
  }
}
