import { MatDialog } from '@angular/material/dialog';
import { AssetDialogComponent } from 'app/pages/assets/asset/asset.dialog.component';
import { Asset, AssetButtonAction } from 'app/types/Asset';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

import { TableEditAction } from './table-edit-action';

export class TableEditAssetAction extends TableEditAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.EDIT_ASSET,
      action: this.editAsset,
    };
  }

  private editAsset(asset: Asset, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.edit(AssetDialogComponent, asset, dialog, refresh);
  }
}
