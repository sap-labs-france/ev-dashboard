import { MatDialog } from '@angular/material/dialog';
import { AssetDialogComponent } from 'app/pages/assets/asset/asset.dialog.component';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { Asset, AssetButtonAction } from 'app/types/Asset';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';


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
