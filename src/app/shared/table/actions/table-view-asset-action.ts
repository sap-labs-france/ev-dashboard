import { MatDialog } from '@angular/material/dialog';
import { AssetDialogComponent } from 'app/pages/assets/asset/asset.dialog.component';
import { Asset, AssetButtonAction } from 'app/types/Asset';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

import { TableViewAction } from './table-view-action';

export class TableViewAssetAction extends TableViewAction {
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
