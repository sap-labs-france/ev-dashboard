import {Component, Injectable, Input, Pipe, PipeTransform} from '@angular/core';
import {CellContentTemplateComponent} from '../../table/cell-content-template/cell-content-template.component';
import { Connector } from 'app/common.types';
import { Constants } from 'app/utils/Constants';

@Component({
  selector: 'app-connector-id-cell',
  template: `
    <!-- Connector ID -->
    <div class="d-flex justify-content-center">
      <div class="row mx-0 px-0 align-items-center detail-connector">
        <div appTooltip data-toogle="tooltip" data-offset="0px, 8px" data-placement="bottom"
            [title]="row | appFormatConnector:'text' | translate"
            class="charger-connector-container">
          <div [class]="row | appFormatConnector:'class'">
            {{row.connectorId | appConnectorId}}
          </div>
        </div>
        <!-- Connector Type -->
        <!-- <div class="d-inline-block" appTooltip [attr.data-offset]="tooltipTypeOffest" data-placement="bottom" data-toogle="tooltip" [title]="typeTooltip | translate">
          <div *ngIf="!isSimpleConnectorDisplay && (connector.type || connector.type === null)" [appChargerStatus]="{status: chargerStatus, target: 'background-image', baseClass: baseClassConnectorTypeText}">
            <mat-icon *ngIf="connector.type !== null" [svgIcon]="typeSvgIcon" class="d-flex"></mat-icon>
            <mat-icon *ngIf="connector.type === null" class="d-flex">not_interested</mat-icon>
          </div>
        </div> -->
      </div>
    </div>
  `
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
