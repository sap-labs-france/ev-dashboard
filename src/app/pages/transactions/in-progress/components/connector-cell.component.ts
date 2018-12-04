import {Component, Input} from '@angular/core';
import {CellContentTemplateComponent} from '../../../../shared/table/cell-content-template/cell-content-template.component';
import {TableColumnDef, Transaction} from '../../../../common.types';

@Component({
  styleUrls: ['../../../charging-stations/charging-stations-data-source-table.scss'],
  template: `
    <table>
      <tr>
        <td class="charger-connector">
          <div class="charger-connector charger-connector-background {{getClassForStatus(row.status)}}">
        <span [class]="getTextClassForStatus(row.status) ">
          {{row.connectorId | appConnectorId}}
        </span>
          </div>
        </td>
      </tr>
    </table>
  `
})


export class ConnectorCellComponent implements CellContentTemplateComponent {

  @Input() row: Transaction;

  getClassForStatus(status: String) {
    switch (status) {
      case 'Available': {
        return 'charger-connector-available';
      }
      case 'Preparing': {
        return 'charger-connector-preparing';
      }
      case 'SuspendedEVSE': {
        return 'charger-connector-suspended-evse';
      }
      case 'SuspendedEV': {
        return 'charger-connector-suspended-ev';
      }
      case 'Finishing': {
        return 'charger-connector-finishing';
      }
      case 'Reserved': {
        return 'charger-connector-reserved';
      }
      case 'Charging':
      case 'Occupied': {
        return 'charger-connector-charging';
      }
      case 'Unavailable':
      case 'Faulted': {
        return 'charger-connector-error';
      }
      default: {
        return '\'charger-connector-active-text\'';
      }
    }
  }

  getTextClassForStatus(status: String) {
    switch (status) {
      case 'Preparing':
      case 'Finishing':
      case 'Reserved':
      case 'Available': {
        return 'charger-connector-text';
      }
      case 'SuspendedEVSE':
      case 'SuspendedEV':
      case 'Charging':
      case 'Occupied':
      case 'Unavailable':
      case 'Faulted':
      default: {
        return 'charger-connector-active-text';
      }
    }
  }
}
