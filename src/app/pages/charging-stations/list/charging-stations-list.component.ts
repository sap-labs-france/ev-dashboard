import { Component, OnInit } from '@angular/core';

import { CentralServerService } from 'app/services/central-server.service';
import { ChargingStationsListTableDataSource } from './charging-stations-list-table-data-source';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../../services/message.service';
import { TableEditChargingStationAction } from 'app/shared/table/actions/table-edit-charging-station-action';
import { WindowService } from '../../../services/window.service';

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
            editAction.action(chargingStation, this.dialog);
          }
        }
      }, (error) => {
        // Not Found
        this.messageService.showErrorMessage('chargers.charger_id_not_found', {chargerID: chargingStationID});
      });
      // Clear Search
      this.windowService.deleteSearch('ChargingStationID');
    }
  }
}
