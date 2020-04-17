import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { Connector, ConnStatus } from 'app/types/ChargingStation';

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
      case ConnStatus.AVAILABLE: {
        classNames += TYPE_SUCCESS;
        break;
      }
      case ConnStatus.PREPARING: {
        classNames += TYPE_WARNING;
        break;
      }
      case ConnStatus.SUSPENDED_EVSE: {
        classNames += TYPE_INFO;
        break;
      }
      case ConnStatus.SUSPENDED_EV: {
        classNames += TYPE_INFO;
        break;
      }
      case ConnStatus.FINISHING: {
        classNames += TYPE_WARNING;
        break;
      }
      case ConnStatus.RESERVED: {
        classNames += TYPE_INFO;
        break;
      }
      case ConnStatus.CHARGING:
      case ConnStatus.OCCUPIED: {
        classNames += TYPE_INFO;
        break;
      }
      case ConnStatus.UNAVAILABLE: {
        classNames += TYPE_GREY;
        break;
      }
      case ConnStatus.FAULTED: {
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
