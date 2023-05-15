import { Component, Injectable, Input, Pipe, PipeTransform } from '@angular/core';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChargePointStatus } from '../../../types/ChargingStation';
import { Transaction } from '../../../types/Transaction';

@Component({
  template: `
    <!-- Connector ID -->
    <div class="d-flex justify-content-center">
      <div
        appTooltip
        data-offset="0px, 8px"
        [title]="row | appTransactionsFormatConnector : 'text' | translate"
        class="charger-connector-container"
      >
        <div [class]="row | appTransactionsFormatConnector : 'class'">
          {{ row.connectorId | appConnectorId }}
        </div>
      </div>
    </div>
  `,
})
@Injectable()
export class TransactionsConnectorCellComponent extends CellContentTemplateDirective {
  @Input() public row!: Transaction;
}

@Pipe({ name: 'appTransactionsFormatConnector' })
export class AppTransactionsFormatConnector implements PipeTransform {
  public transform(transaction: Transaction, type: string): string {
    if (type === 'class') {
      return this.buildConnectorClasses(transaction);
    }
    if (type === 'text') {
      return this.buildConnectorText(transaction);
    }
    return '';
  }

  public buildConnectorClasses(transaction: Transaction): string {
    let classNames = 'charger-connector-background charger-connector-text ';
    switch (transaction.status) {
      case ChargePointStatus.AVAILABLE: {
        classNames += 'charger-connector-available charger-connector-charging-available-text';
        break;
      }
      case ChargePointStatus.PREPARING: {
        classNames += 'charger-connector-preparing';
        break;
      }
      case ChargePointStatus.SUSPENDED_EVSE: {
        classNames += 'charger-connector-suspended-evse';
        break;
      }
      case ChargePointStatus.SUSPENDED_EV: {
        classNames += 'charger-connector-suspended-ev';
        break;
      }
      case ChargePointStatus.FINISHING: {
        classNames += 'charger-connector-finishing';
        break;
      }
      case ChargePointStatus.RESERVED: {
        classNames += 'charger-connector-reserved';
        break;
      }
      case ChargePointStatus.CHARGING:
      case ChargePointStatus.OCCUPIED: {
        // Check if charging
        if (transaction.currentInstantWatts > 0) {
          classNames +=
            'charger-connector-charging-active charger-connector-background-spinner charger-connector-charging-active-text';
        } else {
          classNames += 'charger-connector-charging';
        }
        break;
      }
      case ChargePointStatus.UNAVAILABLE: {
        classNames += 'charger-connector-unavailable';
        break;
      }
      case ChargePointStatus.FAULTED: {
        classNames += 'charger-connector-faulted';
        break;
      }
      default: {
        classNames += 'charger-connector-charging-inactive';
        break;
      }
    }
    return classNames;
  }

  public buildConnectorText(transaction: Transaction): string {
    if (!transaction.status) {
      return `chargers.status_unknown`;
    }
    return `chargers.status_${transaction.status ? transaction.status.toLowerCase() : 'unknown'}`;
  }
}
