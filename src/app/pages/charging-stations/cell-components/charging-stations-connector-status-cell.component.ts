import { Component, Input, Pipe, PipeTransform } from '@angular/core';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChargePointStatus, Connector } from '../../../types/ChargingStation';

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
export class ChargingStationsConnectorStatusCellComponent extends CellContentTemplateDirective {
  @Input() public row!: Connector;
}

@Pipe({ name: 'appChargingStationsFormatConnectorStatus' })
export class AppChargingStationsFormatConnectorStatusPipe implements PipeTransform {
  public transform(status: string, type: string): string {
    if (type === 'class') {
      return this.buildConnectorStatusClasses(status);
    }
    if (type === 'text') {
      return this.buildConnectorStatusText(status);
    }
    return '';
  }

  public buildConnectorStatusClasses(status: string): string {
    let classNames = 'chip-width-10em ';
    switch (status) {
      case ChargePointStatus.AVAILABLE: {
        classNames += TYPE_SUCCESS;
        break;
      }
      case ChargePointStatus.PREPARING: {
        classNames += TYPE_WARNING;
        break;
      }
      case ChargePointStatus.SUSPENDED_EVSE: {
        classNames += TYPE_INFO;
        break;
      }
      case ChargePointStatus.SUSPENDED_EV: {
        classNames += TYPE_INFO;
        break;
      }
      case ChargePointStatus.FINISHING: {
        classNames += TYPE_WARNING;
        break;
      }
      case ChargePointStatus.RESERVED: {
        classNames += TYPE_INFO;
        break;
      }
      case ChargePointStatus.CHARGING:
      case ChargePointStatus.OCCUPIED: {
        classNames += TYPE_INFO;
        break;
      }
      case ChargePointStatus.UNAVAILABLE: {
        classNames += TYPE_GREY;
        break;
      }
      case ChargePointStatus.FAULTED: {
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

  public buildConnectorStatusText(status: string): string {
    return `chargers.status_${status.toLowerCase()}`;
  }
}
