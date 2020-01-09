import { Component, Injectable, Input, Pipe, PipeTransform } from '@angular/core';
import { Transaction } from 'app/types/Transaction';
import { Constants } from 'app/utils/Constants';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  template: `
    <!-- Connector ID -->
    <div class="d-flex justify-content-center">
      <div class="row mx-0 px-0 align-items-center">
        <div appTooltip data-offset="0px, 8px"
            [title]="row | appTransactionsFormatConnector:'text' | translate"
            class="charger-connector-container">
          <div [class]="row | appTransactionsFormatConnector:'class'">
            {{row.connectorId | appConnectorId}}
          </div>
        </div>
      </div>
    </div>
  `,
})
@Injectable()
export class TransactionsConnectorCellComponent extends CellContentTemplateComponent {
  @Input() row!: Transaction;
}

@Pipe({name: 'appTransactionsFormatConnector'})
export class AppTransactionsFormatConnector implements PipeTransform {
  transform(transaction: Transaction, type: string): string {
    if (type === 'class') {
      return this.buildConnectorClasses(transaction);
    }
    if (type === 'text') {
      return this.buildConnectorText(transaction);
    }
    return '';
  }

  buildConnectorClasses(transaction: Transaction): string {
    let classNames = 'charger-connector-background charger-connector-text ';
    switch (transaction.status) {
      case Constants.CONN_STATUS_AVAILABLE: {
        classNames += 'charger-connector-available charger-connector-charging-available-text';
        break;
      }
      case Constants.CONN_STATUS_PREPARING: {
        classNames += 'charger-connector-preparing';
        break;
      }
      case Constants.CONN_STATUS_SUSPENDED_EVSE: {
        classNames += 'charger-connector-suspended-evse';
        break;
      }
      case Constants.CONN_STATUS_SUSPENDED_EV: {
        classNames += 'charger-connector-suspended-ev';
        break;
      }
      case Constants.CONN_STATUS_FINISHING: {
        classNames += 'charger-connector-finishing';
        break;
      }
      case Constants.CONN_STATUS_RESERVED: {
        classNames += 'charger-connector-reserved';
        break;
      }
      case Constants.CONN_STATUS_CHARGING:
      case Constants.CONN_STATUS_OCCUPIED: {
        // Check if charging
        if (transaction.currentConsumption > 0) {
          classNames += 'charger-connector-charging-active charger-connector-background-spinner charger-connector-charging-active-text';
        } else {
          classNames += 'charger-connector-charging';
        }
        break;
      }
      case Constants.CONN_STATUS_UNAVAILABLE: {
        classNames += 'charger-connector-unavailable';
        break;
      }
      case Constants.CONN_STATUS_FAULTED: {
        classNames += 'charger-connector-faulted';
        break;
      }
      default: {
        classNames += 'charger-connector-charging-inactive';
        break;
      }
    }
    return classNames;  }

  buildConnectorText(transaction: Transaction): string {
    return `chargers.status_${transaction.status.toLowerCase()}`;
  }
}
