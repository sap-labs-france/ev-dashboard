import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { Asset, AssetButtonAction } from '../../../../types/Asset';
import { DialogParams } from '../../../../types/Authorization';
import { ScreenSize } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { TableViewAction } from '../table-view-action';

export interface TableViewAssetActionDef extends TableActionDef {
  action: (assetDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Asset>, refresh?: () => Observable<void>) => void;
}

export class TableViewAssetAction extends TableViewAction {
  public getActionDef(): TableViewAssetActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.VIEW_ASSET,
      action: this.viewAsset,
    };
  }

  private viewAsset(assetDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Asset>, refresh?: () => Observable<void>) {
    super.view(assetDialogComponent, dialog, dialogParams, refresh, {
      minWidth: ScreenSize.L,
      maxWidth: ScreenSize.XXL,
      width: ScreenSize.XL,
      minHeight: ScreenSize.S,
      maxHeight: ScreenSize.L,
      height: ScreenSize.M
    });
  }
}
