import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogMode } from 'types/Authorization';
import { ChargingStation } from 'types/ChargingStation';

import { WindowService } from '../../../services/window.service';
import { TableEditChargingStationAction } from '../../../shared/table/actions/charging-stations/table-edit-charging-station-action';
import { ChargingStationDialogComponent } from '../charging-station/charging-station-dialog.component';
import { ChargingStationsListTableDataSource } from './charging-stations-list-table-data-source';

@Component({
  selector: 'app-charging-stations-list',
  template: '<app-table [dataSource]="chargingStationsListTableDataSource"></app-table>',
  providers: [ChargingStationsListTableDataSource],
})
export class ChargingStationsListComponent implements OnInit {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public chargingStationsListTableDataSource: ChargingStationsListTableDataSource,
    private windowService: WindowService,
    private dialog: MatDialog
  ) {}

  public ngOnInit(): void {
    // Check if transaction ID id provided
    const chargingStationID = this.windowService.getUrlParameterValue('ChargingStationID');
    if (chargingStationID) {
      const editAction = new TableEditChargingStationAction().getActionDef();
      editAction.action(ChargingStationDialogComponent, this.dialog, {
        dialogData: { id: chargingStationID } as ChargingStation,
        dialogMode: DialogMode.VIEW,
      });
      // Clear Search
      this.windowService.deleteUrlParameter('ChargingStationID');
    }
  }
}
