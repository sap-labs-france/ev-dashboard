import { Component, OnInit } from '@angular/core';
import { ChargingStationsListDataSource } from './charging-stations-list-data-source-table';
import { ActivatedRoute } from '@angular/router';
import { CentralServerService } from 'app/services/central-server.service';
import { WindowService } from '../../../services/window.service';
import {MessageService} from '../../../services/message.service';

@Component({
  selector: 'app-charging-stations-list',
  templateUrl: 'charging-stations-list.component.html',
  styles: ['.fulldetails app-detail-component-container{width: 100%}'],
  providers: [
    ChargingStationsListDataSource
  ]
})
export class ChargingStationsListComponent implements OnInit {

  constructor(
    public chargingStationsListDataSource: ChargingStationsListDataSource,
    private windowService: WindowService,
    private centralServerService: CentralServerService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    // Check if transaction ID id provided
    const chargingStationID = this.activatedRoute.snapshot.queryParams['ChargingStationID'];
    if (chargingStationID) {
      this.centralServerService.getCharger(chargingStationID).subscribe(chargingStation => {
        // Found
        this.chargingStationsListDataSource.showChargingStationDialog(chargingStation);
      }, (error) => {
        // Not Found
        this.messageService.showErrorMessage('chargers.charger_id_not_found', {'chargerID': chargingStationID});
      });
      // Clean URL
      this.windowService.setSearch('');
    }
  }
}
