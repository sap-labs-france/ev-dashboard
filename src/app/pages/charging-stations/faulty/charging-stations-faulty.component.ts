import { Component } from '@angular/core';
import { ChargingStationsFaultyTableDataSource } from './charging-stations-faulty-table-data-source';

@Component({
  selector: 'app-charging-stations-faulty',
  templateUrl: 'charging-stations-faulty.component.html',
  providers: [ChargingStationsFaultyTableDataSource]
})
export class ChargingStationsFaultyComponent {

  constructor(
    public chargingStationsFaultyTableDataSource: ChargingStationsFaultyTableDataSource
  ) {
  }
}
