import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { SiteArea, SiteAreaButtonAction } from '../../../../types/SiteArea';
import { TableActionDef } from '../../../../types/Table';
import { TableEditAction } from '../table-edit-action';

export interface TableEditSiteAreaActionDef extends TableActionDef {
  action: (siteAreaDialogComponent: ComponentType<unknown>, siteArea: SiteArea, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableEditSiteAreaAction extends TableEditAction {
  public getActionDef(): TableEditSiteAreaActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.EDIT_SITE_AREA,
      action: this.editSiteArea,
    };
  }

  private editSiteArea(siteAreaDialogComponent: ComponentType<unknown>, siteArea: SiteArea, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.edit(siteAreaDialogComponent, siteArea, dialog, refresh);
  }
}
