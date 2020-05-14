import { MatDialog } from '@angular/material/dialog';
import { SiteAreaChargingStationsDialogComponent } from 'app/pages/organization/site-areas/site-area-charging-stations/site-area-charging-stations-dialog.component';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { SiteArea, SiteAreaButtonAction } from 'app/types/SiteArea';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';


export class TableViewChargingStationsOfSiteAreaAction extends TableViewAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.VIEW_CHARGING_STATIONS_OF_SITE_AREA,
      icon: 'ev_station',
      tooltip: 'general.tooltips.display_chargers',
      action: this.viewChargingStations,
    };
  }

  private viewChargingStations(siteArea: SiteArea, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.view(SiteAreaChargingStationsDialogComponent, siteArea, dialog, refresh);
  }
}
