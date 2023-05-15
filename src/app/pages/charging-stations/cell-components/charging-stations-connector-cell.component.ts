import { Component, Injectable, Input, Pipe, PipeTransform } from '@angular/core';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChargePointStatus, Connector } from '../../../types/ChargingStation';

@Component({
  selector: 'app-charging-stations-connector-cell',
  template: `
    <!-- Connector ID -->
    <div class="d-flex justify-content-center">
      <div class="d-flex mx-0 px-0 align-items-center detail-connector">
        <div
          appTooltip
          data-offset="0px, 8px"
          [title]="row | appChargingStationsFormatConnector : 'text' | translate"
          class="charger-connector-container"
        >
          <div [class]="row | appChargingStationsFormatConnector : 'class'">
            {{ row.connectorId | appConnectorId }}
          </div>
        </div>
        <!-- Connector Type -->
        <div
          class="d-inline-block"
          appTooltip
          data-offset="-15px, 8px"
          [title]="row.type | appConnectorType : 'text' | translate"
        >
          <div
            *ngIf="row.type && row.type !== null"
            class="charger-connector-container
                  charger-connector-container-image
                  d-flex align-items-center justify-content-center
                  charger-connector-container-image-small charger-connector-type-background"
          >
            <mat-icon [svgIcon]="row.type | appConnectorType : 'icon'" class="d-flex"></mat-icon>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['charging-stations-connector-cell.component.scss'],
})
@Injectable()
export class ChargingStationsConnectorCellComponent extends CellContentTemplateDirective {
  @Input() public row!: Connector;
}

@Pipe({ name: 'appChargingStationsFormatConnector' })
export class AppChargingStationsFormatConnectorPipe implements PipeTransform {
  public transform(connector: Connector, type: string): string {
    if (type === 'class') {
      return this.buildConnectorClasses(connector);
    }
    if (type === 'text') {
      return this.buildConnectorText(connector);
    }
    return '';
  }

  public buildConnectorClasses(connector: Connector): string {
    let classNames = 'charger-connector-background charger-connector-text ';
    switch (connector.status) {
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
        if (connector.currentInstantWatts > 0) {
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

  public buildConnectorText(connector: Connector): string {
    return `chargers.status_${connector.status ? connector.status.toLowerCase() : 'unknown'}`;
  }
}
