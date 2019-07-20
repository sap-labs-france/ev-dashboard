import { Component } from '@angular/core';
import { ChargingStationsFaultyDataSource } from './charging-stations-faulty-data-source-table';

@Component({
  selector: 'app-charging-stations-faulty',
  templateUrl: 'charging-stations-faulty.component.html',
  providers: [ChargingStationsFaultyDataSource]
})
export class ChargingStationsFaultyComponent {

  constructor(
    public chargingStationsFaultyDataSource: ChargingStationsFaultyDataSource
  ) {
  }
}
