import { MatDialog } from '@angular/material/dialog';
import { SiteDialogComponent } from 'app/pages/organization/sites/site/site-dialog.component';
import { SiteButtonAction } from 'app/types/Site';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

import { TableCreateAction } from './table-create-action';

export class TableCreateSiteAction extends TableCreateAction {  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: SiteButtonAction.CREATE_SITE,
      action: this.createSite,
    };
  }

                                                                private createSite(dialog: MatDialog, refresh?: () => Observable<void>) {
    super.create(SiteDialogComponent, dialog, refresh);
  }
}
