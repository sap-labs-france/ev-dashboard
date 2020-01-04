import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { Connector } from 'app/types/ChargingStation';
import { Constants } from 'app/utils/Constants';

const TYPE_INFO = 'chip-info';
const TYPE_SUCCESS = 'chip-success';
const TYPE_DANGER = 'chip-danger';
const TYPE_WARNING = 'chip-warning';
const TYPE_GREY = 'chip-grey';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.status | appChargingStationsFormatConnectorStatus:'class'" [disabled]="true">
        {{row.status | appChargingStationsFormatConnectorStatus:'text' | translate}}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class ChargingStationsConnectorStatusCellComponent extends CellContentTemplateComponent {
  @Input() row!: Connector;
}

@Pipe({name: 'appChargingStationsFormatConnectorStatus'})
export class AppChargingStationsFormatConnectorStatusPipe implements PipeTransform {
  transform(status: string, type: string): string {
    if (type === 'class') {
      return this.buildConnectorStatusClasses(status);
    }
    if (type === 'text') {
      return this.buildConnectorStatusText(status);
    }
    return '';
  }

  buildConnectorStatusClasses(status: string): string {
    let classNames = 'chip-width-10em ';
    switch (status) {
      case Constants.CONN_STATUS_AVAILABLE: {
        classNames += TYPE_SUCCESS;
        break;
      }
      case Constants.CONN_STATUS_PREPARING: {
        classNames += TYPE_WARNING;
        break;
      }
      case Constants.CONN_STATUS_SUSPENDED_EVSE: {
        classNames += TYPE_INFO;
        break;
      }
      case Constants.CONN_STATUS_SUSPENDED_EV: {
        classNames += TYPE_INFO;
        break;
      }
      case Constants.CONN_STATUS_FINISHING: {
        classNames += TYPE_WARNING;
        break;
      }
      case Constants.CONN_STATUS_RESERVED: {
        classNames += TYPE_INFO;
        break;
      }
      case Constants.CONN_STATUS_CHARGING:
      case Constants.CONN_STATUS_OCCUPIED: {
        classNames += TYPE_INFO;
        break;
      }
      case Constants.CONN_STATUS_UNAVAILABLE: {
        classNames += TYPE_GREY;
        break;
      }
      case Constants.CONN_STATUS_FAULTED: {
        classNames += TYPE_DANGER;
        break;
      }
      default: {
        classNames += TYPE_GREY;
        break;
      }
    }
    return classNames;
  }

  buildConnectorStatusText(status: string): string {
    return `chargers.status_${status.toLowerCase()}`;
  }
}
