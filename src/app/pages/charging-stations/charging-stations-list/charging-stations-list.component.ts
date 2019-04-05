import { Component, OnInit } from '@angular/core';
import { ChargingStationsListDataSource } from './charging-stations-list-data-source-table';
import { ActivatedRoute } from '@angular/router';
import { CentralServerService } from 'app/services/central-server.service';

@Component({
  selector: 'app-charging-stations-list',
  templateUrl: 'charging-stations-list.component.html',
  styles: ['.fulldetails app-detail-component-container{width: 100%}'],
  providers: [
    ChargingStationsListDataSource
  ]
})
export class ChargingStationsListComponent implements OnInit {
  private _chargingStationID;

  constructor(
    public chargingStationsListDataSource: ChargingStationsListDataSource,
    private centralServerService: CentralServerService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._chargingStationID = this.activatedRoute.snapshot.queryParams['ChargingStationID'];
    if(this._chargingStationID){
      this.centralServerService.getCharger(this._chargingStationID).subscribe(chargingStation => {
        if(chargingStation) {
          this.chargingStationsListDataSource.showChargingStationDialog(chargingStation);
        }
      })
    }
  }
}
