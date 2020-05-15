import { MatDialog } from '@angular/material/dialog';
import { SiteAreaDialogComponent } from 'app/pages/organization/site-areas/site-area/site-area-dialog.component';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { SiteArea, SiteAreaButtonAction } from 'app/types/SiteArea';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

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
