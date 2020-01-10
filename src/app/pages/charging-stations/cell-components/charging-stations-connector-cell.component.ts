import { Component, Injectable, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { Connector, ChargingStation } from 'app/types/ChargingStation';
import { Constants } from 'app/utils/Constants';

@Component({
  selector: 'app-charging-stations-connector-cell',
  template: `
    <!-- Connector ID -->
    <div class="d-flex justify-content-center">
      <div class="row mx-0 px-0 align-items-center detail-connector">
        <div appTooltip data-offset="0px, 8px"
            [title]="row | appChargingStationsFormatConnector:'text' | translate"
            class="charger-connector-container">
          <div [class]="row | appChargingStationsFormatConnector:'class'">
            {{row.connectorId | appConnectorId}}
          </div>
        </div>
        <!-- Connector Type -->
        <div class="d-inline-block" appTooltip data-offset="-15px, 8px" [title]="row.type | appConnectorType:'text' | translate">
          <div *ngIf="row.type && row.type !== null"
              class="charger-connector-container charger-connector-container-image d-flex align-items-center justify-content-center charger-connector-container-image-small charger-connector-type-background">
            <mat-icon [svgIcon]="row.type | appConnectorType:'icon'" class="d-flex"></mat-icon>
          </div>
        </div>
      </div>
    </div>
  `,
})
@Injectable()
export class ChargingStationsConnectorCellComponent extends CellContentTemplateComponent {
  @Input() row!: Connector;
}

@Pipe({name: 'appChargingStationsFormatConnector'})
export class AppChargingStationsFormatConnectorPipe implements PipeTransform {
  transform(connector: Connector, type: string): string {
    if (type === 'class') {
      return this.buildConnectorClasses(connector);
    }
    if (type === 'text') {
      return this.buildConnectorText(connector);
    }
    return '';
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
