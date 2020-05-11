import { SiteArea, SiteAreaButtonAction } from 'app/types/SiteArea';

import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { SiteAreaDialogComponent } from 'app/pages/organization/site-areas/site-area/site-area-dialog.component';
import { TableActionDef } from 'app/types/Table';
import { TableEditAction } from './table-edit-action';

export class TableEditSiteAreaAction extends TableEditAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.EDIT_SITE_AREA,
      action: this.editSiteArea,
    };
  }

  private editSiteArea(siteArea: SiteArea, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.edit(SiteAreaDialogComponent, siteArea, dialog, refresh);
  }
}
