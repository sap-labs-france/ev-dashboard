import { Component, Input } from '@angular/core';
import { TableColumnDef } from "../../../common.types";
import { Utils } from "../../../utils/Utils";

import { CellContentTemplateComponent }      from '../../../shared/table/cellContentTemplate/cellContentTemplate.component';

@Component({
  styleUrls: ['../chargers-data-source-table.scss'],
  template: `
          <div class='charger-heartbeat' [innerHtml]="heartbeatIcon"></div>
          <span [hidden]="chargerInactive" class='charger-heartbeat-date ' [class]="classDateError">{{heartbeatDate}}</span>
          `
})
export class HertbeatCellComponent implements CellContentTemplateComponent {
  heartbeatIcon: string;
  chargerInactive: boolean;
  classDateError: string;
  heartbeatDate: string;
  /**
   * setData
   */
   setData(row: any, columndef: TableColumnDef) {
    this.chargerInactive = !row.inactive;
    this.heartbeatDate = Utils.convertToDate(row.lastHeartBeat).toLocaleString();
    let classIcon = (row.inactive ? "charger-heartbeat-error" : "charger-heartbeat-ok");
    this.classDateError = (row.inactive ? "charger-heartbeatdate-error" : "");
    this.heartbeatIcon = `<i class='fa fa-heartbeat charger-heartbeat-icon ${classIcon}'></i>`;
  }

}