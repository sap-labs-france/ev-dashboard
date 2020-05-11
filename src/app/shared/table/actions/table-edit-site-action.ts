import { Site, SiteButtonAction } from 'app/types/Site';

import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { SiteDialogComponent } from 'app/pages/organization/sites/site/site-dialog.component';
import { TableActionDef } from 'app/types/Table';
import { TableEditAction } from './table-edit-action';

export class TableEditSiteAction extends TableEditAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: SiteButtonAction.EDIT_SITE,
      action: this.editSite,
    };
  }

  private editSite(site: Site, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.edit(SiteDialogComponent, site, dialog, refresh);
  }
}
