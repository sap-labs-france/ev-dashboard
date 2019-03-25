import {Component} from '@angular/core';
import {ChargingStationsListDataSource} from './charging-stations-list-data-source-table';

@Component({
  selector: 'app-charging-stations-list',
  templateUrl: 'charging-stations-list.component.html',
  styleUrls: ['../charging-stations-data-source-table.scss'],
  styles: ['.fulldetails app-detail-component-container{width: 100%}'],
  providers: [
    ChargingStationsListDataSource
  ]
})
export class ChargingStationsListComponent {
  constructor(
    public chargingStationsListDataSource: ChargingStationsListDataSource
  ) {
  }
<<<<<<< HEAD

  ngOnInit() {
    // Scroll up
    // jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
=======
>>>>>>> d67b7d67790d98d39c7d5ba278147fd72e4ca189
}
