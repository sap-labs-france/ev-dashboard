import { Component } from '@angular/core';
import { TableColumnDef, Charger, Connector } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
import { ConnectorCellComponent } from "./connector-cell.component";
@Component({
  styleUrls: ['../charging-stations-data-source-table.scss'],
  template: `
  <table><tr>
    <ng-container *ngFor="let connector of charger.connectors">
    <td class="charger-connector">
      <connector-id-cell [connectorInput]="connector"></connector-id-cell>
    </td>
    </ng-container>
  </tr>
</table>
  `
})


export class ConnectorsCellComponent implements CellContentTemplateComponent {

  charger: Charger;
  /**
   * setData
   */
   setData(charger: Charger, columndef: TableColumnDef) {
    this.charger = charger;
  }

}
