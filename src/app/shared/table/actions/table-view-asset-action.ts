import { Asset, AssetButtonAction } from 'app/types/Asset';

import { AssetDialogComponent } from 'app/pages/assets/asset/asset.dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TableActionDef } from 'app/types/Table';
import { TableViewAction } from './table-view-action';

export class TableDisplayAssetAction extends TableViewAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.VIEW_ASSET,
      action: this.viewAsset,
    };
  }

  private viewAsset(asset: Asset, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.view(AssetDialogComponent, asset, dialog, refresh);
  }
}
