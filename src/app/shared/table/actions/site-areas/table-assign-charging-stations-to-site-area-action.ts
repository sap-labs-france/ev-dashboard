import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { SiteArea, SiteAreaButtonAction } from '../../../../types/SiteArea';
import { TableActionDef } from '../../../../types/Table';
import { TableAssignAction } from '../table-assign-action';

export interface TableAssignChargingStationsToSiteAreaActionDef extends TableActionDef {
  action: (siteAreaChargingStationsDialogComponent: ComponentType<unknown>, siteArea: SiteArea, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableAssignChargingStationsToSiteAreaAction extends TableAssignAction {
  public getActionDef(): TableAssignChargingStationsToSiteAreaActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.ASSIGN_CHARGING_STATIONS_TO_SITE_AREA,
      icon: 'ev_station',
      name: 'general.edit',
      tooltip: 'general.tooltips.edit_chargers',
      action: this.assignChargingStationsToSiteArea,
    };
  }

  private assignChargingStationsToSiteArea(siteAreaChargingStationsDialogComponent: ComponentType<unknown>, siteArea: SiteArea,
      dialog: MatDialog, refresh?: () => Observable<void>) {
    super.assign(siteAreaChargingStationsDialogComponent, siteArea, dialog, refresh);
  }
}
