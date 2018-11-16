import { Component } from '@angular/core';
import { TableColumnDef, Connector } from "../../../common.types";


import { CellContentTemplateComponent }      from '../../../shared/table/cellContentTemplate/cellContentTemplate.component';

@Component({
  styleUrls: ['../chargers-data-source-table.scss'],
  template: `
          <div class='charger-heartbeat' [innerHtml]="letter"></div>
          <span class='charger-heartbeat-date ' [class]="classDateError">{{status}}</span>
          `
})
export class ConnectorAvailibilityComponent implements CellContentTemplateComponent {
  chargerInactive: boolean;
  classDateError: string;
  status: string;
  /**
   * setData
   */
   setData(row: Connector, columndef: TableColumnDef) {

    this.chargerInactive = (row.currentConsumption > 0);
    this.classDateError = (row.currentConsumption ? "charger-heartbeatdate-error" : "");
    this.status = row.status;
  }

}