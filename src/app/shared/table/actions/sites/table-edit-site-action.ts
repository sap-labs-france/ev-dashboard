import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParams } from '../../../../types/Authorization';
import { ScreenSize } from '../../../../types/GlobalType';
import { Site, SiteButtonAction } from '../../../../types/Site';
import { TableActionDef } from '../../../../types/Table';
import { TableEditAction } from '../table-edit-action';

export interface TableEditSiteActionDef extends TableActionDef {
  action: (siteDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Site>, refresh?: () => Observable<void>) => void;
}

export class TableEditSiteAction extends TableEditAction {
  public getActionDef(): TableEditSiteActionDef {
    return {
      ...super.getActionDef(),
      id: SiteButtonAction.EDIT_SITE,
      action: this.editSite,
    };
  }

  private editSite(siteDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Site>, refresh?: () => Observable<void>) {
    super.edit(siteDialogComponent, dialog, dialogParams, refresh, {
      minWidth: ScreenSize.L,
      maxWidth: ScreenSize.XXL,
      width: ScreenSize.XL,
      minHeight: ScreenSize.L,
      maxHeight: ScreenSize.XXL,
      height: ScreenSize.XL
    });
  }
}
