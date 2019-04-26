import {Component, Injectable, Input, Pipe, PipeTransform} from '@angular/core';
import {CellContentTemplateComponent} from '../../table/cell-content-template/cell-content-template.component';
import {Connector} from 'app/common.types';
import {Constants} from 'app/utils/Constants';

@Component({
  selector: 'app-connector-id-cell',
  templateUrl: './connector-cell.component.html'
})
@Injectable()
export class ConnectorCellComponent extends CellContentTemplateComponent {
  @Input() row: any;
}

@Pipe({name: 'appFormatConnector'})
export class AppFormatConnector implements PipeTransform {
  transform(connector: Connector, type: string): string {
    if (type === 'class') {
      return this.buildConnectorClasses(connector);
    }
    if (type === 'text') {
      return this.buildConnectorText(connector);
    }
  }

  buildConnectorClasses(connector: Connector): string {
    let classNames = 'charger-connector-background charger-connector-text ';
    switch (connector.status) {
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
        if (connector.currentConsumption > 0) {
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
    return classNames;
  }

  buildConnectorText(connector: Connector): string {
    return `chargers.status_${connector.status.toLowerCase()}`;
  }
}
