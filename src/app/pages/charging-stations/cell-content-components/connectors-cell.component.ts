import { Component, Input } from '@angular/core';
import { TableColumnDef, Charger, Connector } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
@Component({
  styleUrls: ['../charging-stations-data-source-table.scss'],
  template: `
  <table><tr>
    <ng-container *ngFor="let connector of row.connectors">
    <td class="charger-connector">
      <div class="charger-connector charger-connector-background {{getClassForStatus(connector.status)}}">
        <span [class]="getTextClassForStatus(connector.status)">
          {{connector.connectorId | appConnectorId}}
        </span>
      </div>
    </td>
    </ng-container>
  </tr>
</table>
  `
})


export class ConnectorsCellComponent implements CellContentTemplateComponent {

  row: Charger;
  classForStatus: any = "charger-connector-available";
  /**
   * setData
   */
   setData(row: Charger, columndef: TableColumnDef) {
    this.row = row;
  }

  getClassForStatus(status: String) {
    switch (status) {
      case "Available": {
        return "charger-connector-available";
      }
      case "Preparing": {
        return "charger-connector-preparing";
      }
      case "SuspendedEVSE": {
        return "charger-connector-suspended-evse";
      }
      case "SuspendedEV": {
        return "charger-connector-suspended-ev";
      }
      case "Finishing": {
        return "charger-connector-finishing";
      }
      case "Reserved": {
        return "charger-connector-reserved";
      }
      case "Charging":
      case "Occupied": {
        return "charger-connector-charging";
      }
      case "Unavailable":
      case "Faulted": {
        return "charger-connector-error";
      }
      default: {
        return "'charger-connector-active-text'";
      }
    }
  }

  getTextClassForStatus(status: String) {
    switch (status) {
      case "Preparing":
      case "Finishing":
      case "Reserved":
      case "Available": {
        return "charger-connector-text";
      }
      case "SuspendedEVSE":
      case "SuspendedEV":
      case "Charging":
      case "Occupied":
      case "Unavailable":
      case "Faulted":
      default: {
        return "charger-connector-active-text";
      }
    }
  }
}
