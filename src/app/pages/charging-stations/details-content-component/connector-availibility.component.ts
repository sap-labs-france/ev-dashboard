import { Component } from '@angular/core';
import { TableColumnDef, Connector } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  styleUrls: ['../charging-stations-data-source-table.scss'],
  template: `
    <div class='charger-heartbeat'></div>
    <span class='charger-heartbeat-date ' [class.charger-heartbeatdate-error]="row.currentConsumption > 0">{{row.status}}</span>
    `
})
export class ConnectorAvailibilityComponent implements CellContentTemplateComponent {
  row: Connector;
  /**
   * setData
   */
  setData(row: Connector, columndef: TableColumnDef) {
    this.row = row;
  }
}
