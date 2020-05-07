import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SiteAreaAssetsDialogComponent } from 'app/pages/organization/site-areas/site-area-assets/site-area-assets-dialog.component';
import { AssetButtonAction } from 'app/types/Asset';
import { SiteArea } from 'app/types/SiteArea';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableDisplayAssetsOfSiteAreaAction implements TableAction {
  private action: TableActionDef = {
    id: AssetButtonAction.DISPLAY_ASSETS_OF_SITE_AREA,
    type: 'button',
    icon: 'account_balance',
    color: ButtonColor.PRIMARY,
    name: 'site_areas.display_assets',
    tooltip: 'general.tooltips.display_assets',
    action: this.displayAssetsOfSiteArea,
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }

  private displayAssetsOfSiteArea(siteArea: SiteArea, dialog: MatDialog) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = siteArea;
    // Disable outside click close
    dialogConfig.disableClose = true;
    // Open
    dialog.open(SiteAreaAssetsDialogComponent, dialogConfig);
  }
}
