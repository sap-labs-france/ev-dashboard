import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CentralServerService } from 'app/services/central-server.service';

import { MessageService } from '../../../services/message.service';
import { WindowService } from '../../../services/window.service';
import { TableEditChargingStationAction } from '../table-actions/table-edit-charging-station-action';
import { ChargingPlansListTableDataSource } from './charging-plans-list-table-data-source';

@Component({
  selector: 'app-charging-plans-list',
  template: '<app-table [dataSource]="chargingPlansListTableDataSource"></app-table>',
  providers: [ChargingPlansListTableDataSource],
})
export class ChargingPlansListComponent implements OnInit {

  constructor(
    public chargingPlansListTableDataSource: ChargingPlansListTableDataSource,
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
