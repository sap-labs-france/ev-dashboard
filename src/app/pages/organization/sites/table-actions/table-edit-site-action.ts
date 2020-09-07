import { MatDialog } from '@angular/material/dialog';
import { SiteDialogComponent } from 'app/pages/organization/sites/site/site-dialog.component';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { Site, SiteButtonAction } from 'app/types/Site';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

export interface TableEditSiteActionDef extends TableActionDef {
  action: (site: Site, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableEditSiteAction extends TableEditAction {
  public getActionDef(): TableEditSiteActionDef {
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
