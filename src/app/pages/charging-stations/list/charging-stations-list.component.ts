import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
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

  constructor(
    public chargingStationsListTableDataSource: ChargingStationsListTableDataSource,
    private windowService: WindowService,
    private dialog: MatDialog,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
  ) { }

  public ngOnInit(): void {
    // Check if transaction ID id provided
    const chargingStationID = this.windowService.getSearch('ChargingStationID');
    if (chargingStationID) {
      this.centralServerService.getChargingStation(chargingStationID).subscribe((chargingStation) => {
        if (chargingStation) {
          const editAction = new TableEditChargingStationAction().getActionDef();
          if (editAction.action) {
            editAction.action(ChargingStationDialogComponent, chargingStation, this.dialog);
          }
        }
      }, (error) => {
        // Not Found
        this.messageService.showErrorMessage('chargers.charger_id_not_found', { chargerID: chargingStationID });
      });
      // Clear Search
      this.windowService.deleteSearch('ChargingStationID');
    }
  }
}
