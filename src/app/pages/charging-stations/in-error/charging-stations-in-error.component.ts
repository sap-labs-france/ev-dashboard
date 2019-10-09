import { Component } from '@angular/core';
import { ChargingStationsInErrorTableDataSource } from './charging-stations-in-error-table-data-source';

@Component({
  selector: 'app-charging-stations-in-error',
  templateUrl: 'charging-stations-in-error.component.html',
  providers: [ChargingStationsInErrorTableDataSource],
})
export class ChargingStationsInErrorComponent {

  constructor(
    public chargingStationsInErrorTableDataSource: ChargingStationsInErrorTableDataSource,
  ) {
  }
}
