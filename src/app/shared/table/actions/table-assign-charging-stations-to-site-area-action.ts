import { MatDialog } from '@angular/material/dialog';
import { SiteAreaChargingStationsDialogComponent } from 'app/pages/organization/site-areas/site-area-charging-stations/site-area-charging-stations-dialog.component';
import { SiteArea, SiteAreaButtonAction } from 'app/types/SiteArea';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

import { TableAssignAction } from './table-assign-action';

export class TableAssignChargingStationsToSiteAreaAction extends TableAssignAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.ASSIGN_CHARGING_STATIONS_TO_SITE_AREA,
      icon: 'ev_station',
      name: 'general.edit',
      tooltip: 'general.tooltips.edit_chargers',
      action: this.assignChargingStationsToSiteArea,
    };
  }

  private assignChargingStationsToSiteArea(siteArea: SiteArea, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.assign(SiteAreaChargingStationsDialogComponent, siteArea, dialog, refresh);
  }
}
