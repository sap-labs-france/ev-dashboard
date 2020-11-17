import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { Asset, AssetButtonAction } from '../../../../types/Asset';
import { TableActionDef } from '../../../../types/Table';
import { TableViewAction } from '../table-view-action';

export interface TableViewAssetActionDef extends TableActionDef {
  action: (assetDialogComponent: ComponentType<unknown>, asset: Asset, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableViewAssetAction extends TableViewAction {
  public getActionDef(): TableViewAssetActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.VIEW_ASSET,
      action: this.viewAsset,
    };
  }

  private viewAsset(assetDialogComponent: ComponentType<unknown>, asset: Asset, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.view(assetDialogComponent, asset.id, dialog, refresh);
  }
}
