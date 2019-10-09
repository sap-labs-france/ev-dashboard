import { Component, OnInit } from '@angular/core';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { WindowService } from '../../../services/window.service';
import { ChargingStationsListTableDataSource } from './charging-stations-list-table-data-source';

@Component({
  selector: 'app-charging-stations-list',
  templateUrl: 'charging-stations-list.component.html',
  providers: [ChargingStationsListTableDataSource],
})
export class ChargingStationsListComponent implements OnInit {

  constructor(
    public chargingStationsListTableDataSource: ChargingStationsListTableDataSource,
    private windowService: WindowService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    // Check if transaction ID id provided
    const chargingStationID = this.windowService.getSearch('ChargingStationID');
    if (chargingStationID) {
      this.centralServerService.getCharger(chargingStationID).subscribe((chargingStation) => {
        // Found
        this.chargingStationsListTableDataSource.showChargingStationDialog(chargingStation);
      }, (error) => {
        // Not Found
        this.messageService.showErrorMessage('chargers.charger_id_not_found', {chargerID: chargingStationID});
      });
      // Clear Search
      this.windowService.deleteSearch('ChargingStationID');
    }
  }
}
