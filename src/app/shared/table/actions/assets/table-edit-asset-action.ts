import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { Asset, AssetButtonAction } from '../../../../types/Asset';
import { TableActionDef } from '../../../../types/Table';
import { TableEditAction } from '../table-edit-action';

export interface TableEditAssetActionDef extends TableActionDef {
  action: (assetDialogComponent: ComponentType<unknown>, asset: Asset, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableEditAssetAction extends TableEditAction {
  public getActionDef(): TableEditAssetActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.EDIT_ASSET,
      action: this.editAsset,
    };
  }

  private editAsset(assetDialogComponent: ComponentType<unknown>, asset: Asset, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.edit(assetDialogComponent, asset, dialog, refresh);
  }
}
