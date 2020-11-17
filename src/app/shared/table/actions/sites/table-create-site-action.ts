import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { SiteButtonAction } from '../../../../types/Site';
import { TableActionDef } from '../../../../types/Table';
import { TableCreateAction } from '../table-create-action';

export interface TableCreateSiteActionDef extends TableActionDef {
  action: (siteDialogComponent: ComponentType<unknown>, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableCreateSiteAction extends TableCreateAction {
  public getActionDef(): TableCreateSiteActionDef {
    return {
      ...super.getActionDef(),
      id: SiteButtonAction.CREATE_SITE,
      action: this.createSite,
    };
  }

  private createSite(siteDialogComponent: ComponentType<unknown>, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.create(siteDialogComponent, dialog, refresh);
  }
}
