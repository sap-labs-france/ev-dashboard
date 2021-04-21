import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogParams } from 'types/Authorization';
import { Site } from 'types/Site';

import { SiteAreaButtonAction } from '../../../../types/SiteArea';
import { TableActionDef } from '../../../../types/Table';
import { TableCreateAction } from '../table-create-action';

export interface TableCreateSiteAreaActionDef extends TableActionDef {
  action: (siteAreaDialogComponent: ComponentType<unknown>, dialog: MatDialog, dialogParams: DialogParams<Site>,
    refresh?: () => Observable<void>) => void;
}

export class TableCreateSiteAreaAction extends TableCreateAction {
  public getActionDef(): TableCreateSiteAreaActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.CREATE_SITE_AREA,
      action: this.createSiteArea,
    };
  }

  private createSiteArea(siteAreaDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Site>, refresh?: () => Observable<void>) {
    super.create(siteAreaDialogComponent, dialog, dialogParams, refresh);
  }
}
