import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { AssetButtonAction } from '../../../../types/Asset';
import { ScreenSize } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { TableCreateAction } from '../table-create-action';

export interface TableCreateAssetActionDef extends TableActionDef {
  action: (assetDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    refresh?: () => Observable<void>) => void;
}

export class TableCreateAssetAction extends TableCreateAction {
  public getActionDef(): TableCreateAssetActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.CREATE_ASSET,
      action: this.createAsset,
    };
  }

  private createAsset(assetDialogComponent: ComponentType<unknown>, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.create(assetDialogComponent, dialog, null, refresh, {
      minWidth: ScreenSize.L,
      maxWidth: ScreenSize.XXXL,
      width: ScreenSize.XXL,
      minHeight: ScreenSize.S,
      maxHeight: ScreenSize.L,
      height: ScreenSize.M
    });
  }
}
