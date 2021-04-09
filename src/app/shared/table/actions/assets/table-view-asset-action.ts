import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogData } from 'types/Authorization';

import { AssetButtonAction } from '../../../../types/Asset';
import { TableActionDef } from '../../../../types/Table';
import { TableViewAction } from '../table-view-action';

export interface TableViewAssetActionDef extends TableActionDef {
  action: (assetDialogComponent: ComponentType<unknown>, dialog: MatDialog, data: DialogData, refresh?: () => Observable<void>) => void;
}

export class TableViewAssetAction extends TableViewAction {
  public getActionDef(): TableViewAssetActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.VIEW_ASSET,
      action: this.viewAsset,
    };
  }

  private viewAsset(assetDialogComponent: ComponentType<unknown>, dialog: MatDialog, data: DialogData, refresh?: () => Observable<void>) {
    super.view(assetDialogComponent, dialog, data, refresh);
  }
}
