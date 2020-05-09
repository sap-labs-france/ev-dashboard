import { Asset, AssetButtonAction } from 'app/types/Asset';

import { AssetDialogComponent } from 'app/pages/assets/asset/asset.dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TableActionDef } from 'app/types/Table';
import { TableEditAction } from './table-edit-action';

export class TableEditAssetAction extends TableEditAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.EDIT_ASSET,
      action: this.editAsset,
    }
  }

  private editAsset(asset: Asset, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.edit(AssetDialogComponent, asset, dialog, refresh);
  }
}
