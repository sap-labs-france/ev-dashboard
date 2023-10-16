import { Component } from '@angular/core';

import { ChargingStationTemplatesComponent } from '../charging-station-templates.component';
import { ChargingStationTemplatesListTableDataSource } from './charging-station-template-list-table-data-source';

@Component({
  selector: 'app-charging-station-templates-list',
  template: '<app-table [dataSource]="chargingStationTemplatesListTableDataSource"></app-table>',
  providers: [ChargingStationTemplatesListTableDataSource, ChargingStationTemplatesComponent],
})
export class ChargingStationTemplatesListComponent {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public chargingStationTemplatesListTableDataSource: ChargingStationTemplatesListTableDataSource
  ) {}
}
