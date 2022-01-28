import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParams } from '../../../../types/Authorization';
import { ScreenSize } from '../../../../types/GlobalType';
import { SiteArea, SiteAreaButtonAction } from '../../../../types/SiteArea';
import { TableActionDef } from '../../../../types/Table';
import { TableEditAction } from '../table-edit-action';

export interface TableEditSiteAreaActionDef extends TableActionDef {
  action: (siteAreaDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<SiteArea>, refresh?: () => Observable<void>) => void;
}

export class TableEditSiteAreaAction extends TableEditAction {
  public getActionDef(): TableEditSiteAreaActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.EDIT_SITE_AREA,
      action: this.editSiteArea,
    };
  }

  private editSiteArea(siteAreaDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<SiteArea>, refresh?: () => Observable<void>) {
    super.edit(siteAreaDialogComponent, dialog, dialogParams, refresh, {
      minWidth: ScreenSize.L,
      maxWidth: ScreenSize.XXL,
      width: ScreenSize.XL,
      minHeight: ScreenSize.L,
      maxHeight: ScreenSize.XXL,
      height: ScreenSize.XLXXL
    });
  }
}
