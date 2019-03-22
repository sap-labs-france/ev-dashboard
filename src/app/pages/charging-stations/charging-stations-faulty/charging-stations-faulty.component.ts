import {Component} from '@angular/core';
import {ChargingStationsFaultyDataSource} from './charging-stations-faulty-data-source-table';

@Component({
  selector: 'app-charging-stations-faulty',
  templateUrl: 'charging-stations-faulty.component.html',
  styleUrls: ['../charging-stations-data-source-table.scss'],
  styles: ['.fulldetails app-detail-component-container{width: 100%}'],
  providers: [
    ChargingStationsFaultyDataSource
  ]
})
export class ChargingStationsFaultyComponent {

  constructor(
    public chargingStationsFaultyDataSource: ChargingStationsFaultyDataSource
  ) {
  }
}
