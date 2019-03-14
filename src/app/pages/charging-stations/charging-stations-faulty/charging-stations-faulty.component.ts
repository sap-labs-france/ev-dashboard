import {Component, OnInit} from '@angular/core';
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
export class ChargingStationsFaultyComponent implements OnInit {

  constructor(
    public chargingStationsFaultyDataSource: ChargingStationsFaultyDataSource
  ) {
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
