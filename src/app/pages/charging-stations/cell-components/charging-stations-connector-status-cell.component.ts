import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { ChipType } from 'types/GlobalType';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChargePointStatus, Connector } from '../../../types/ChargingStation';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip
        [ngClass]="row.status | appChargingStationsFormatConnectorStatus : 'class'"
        [disabled]="true"
      >
        {{ row.status | appChargingStationsFormatConnectorStatus : 'text' | translate }}
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
        classNames += ChipType.SUCCESS;
        break;
      }
      case ChargePointStatus.PREPARING: {
        classNames += ChipType.WARNING;
        break;
      }
      case ChargePointStatus.SUSPENDED_EVSE: {
        classNames += ChipType.INFO;
        break;
      }
      case ChargePointStatus.SUSPENDED_EV: {
        classNames += ChipType.INFO;
        break;
      }
      case ChargePointStatus.FINISHING: {
        classNames += ChipType.WARNING;
        break;
      }
      case ChargePointStatus.RESERVED: {
        classNames += ChipType.INFO;
        break;
      }
      case ChargePointStatus.CHARGING:
      case ChargePointStatus.OCCUPIED: {
        classNames += ChipType.INFO;
        break;
      }
      case ChargePointStatus.UNAVAILABLE: {
        classNames += ChipType.GREY;
        break;
      }
      case ChargePointStatus.FAULTED: {
        classNames += ChipType.DANGER;
        break;
      }
      default: {
        classNames += ChipType.GREY;
        break;
      }
    }
    return classNames;
  }

  public buildConnectorStatusText(status: string): string {
    return `chargers.status_${status ? status.toLowerCase() : 'unknown'}`;
  }
}
