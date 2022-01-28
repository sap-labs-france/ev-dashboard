import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogParams } from 'types/Authorization';

import { Asset, AssetButtonAction } from '../../../../types/Asset';
import { ScreenSize } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { TableEditAction } from '../table-edit-action';

export interface TableEditAssetActionDef extends TableActionDef {
  action: (assetDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Asset>, refresh?: () => Observable<void>) => void;
}

export class TableEditAssetAction extends TableEditAction {
  public getActionDef(): TableEditAssetActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.EDIT_ASSET,
      action: this.editAsset,
    };
  }

  private editAsset(assetDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Asset>, refresh?: () => Observable<void>) {
    super.edit(assetDialogComponent, dialog, dialogParams, refresh, {
      minWidth: ScreenSize.L,
      maxWidth: ScreenSize.XXXL,
      width: ScreenSize.XXL,
      minHeight: ScreenSize.S,
      maxHeight: ScreenSize.L,
      height: ScreenSize.M
    });
  }
}
