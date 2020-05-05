import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AssetDialogComponent } from 'app/pages/assets/asset/asset.dialog.component';
import { AssetButtonAction } from 'app/types/Asset';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';
import { TableAction } from './table-action';

export class TableCreateAssetAction implements TableAction {
  private action: TableActionDef = {
    id: AssetButtonAction.CREATE_ASSET,
    type: 'button',
    icon: 'add',
    color: ButtonColor.PRIMARY,
    name: 'general.create',
    tooltip: 'general.tooltips.create',
    action: this.createAsset,
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }

  private createAsset(dialog: MatDialog, refresh?: () => Observable<void>) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = dialog.open(AssetDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        if (refresh) {
          refresh().subscribe();
        }
      }
    });
  }
}
