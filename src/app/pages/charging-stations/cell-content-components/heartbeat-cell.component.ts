import { Component } from '@angular/core';
import { TableColumnDef } from '../../../common.types';
import { Utils } from '../../../utils/Utils';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  styleUrls: ['../charging-stations-data-source-table.scss'],
  template: `
    <span class='charger-heartbeat' [innerHtml]="heartbeatIcon"></span>
    <span [hidden]="chargerInactive" class='charger-heartbeat-date ' [class]="classDateError">{{heartbeatDate}}</span>
  `
})
export class HeartbeatCellComponent implements CellContentTemplateComponent {
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
    const classIcon = (row.inactive ? 'charger-heartbeat-error' : 'charger-heartbeat-ok');
    this.classDateError = (row.inactive ? 'charger-heartbeatdate-error' : '');
    this.heartbeatIcon = `<i class='fa fa-heartbeat charger-heartbeat-icon ${classIcon}'></i>`;
  }
}
