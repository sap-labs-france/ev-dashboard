import { MatDialog } from '@angular/material/dialog';
import { SiteDialogComponent } from 'app/pages/organization/sites/site/site-dialog.component';
import { Site, SiteButtonAction } from 'app/types/Site';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

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
