import {Component, Input, PipeTransform, Pipe} from '@angular/core';
import {Connector} from 'app/common.types';
import {CellContentTemplateComponent} from 'app/shared/table/cell-content-template/cell-content-template.component';

const TYPE_PRIMARY = 'chip-primary';
const TYPE_DEFAULT = 'chip-default';
const TYPE_INFO = 'chip-info';
const TYPE_SUCCESS = 'chip-success';
const TYPE_DANGER = 'chip-danger';
const TYPE_WARNING = 'chip-warning';
const TYPE_GREY = 'chip-grey';

@Component({
  selector: 'app-connector-status',
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [class]="row.status | appFormatConnectorStatus:'class'" [disabled]="true">
        {{row.status | appFormatConnectorStatus:'text' | translate}}
      </mat-chip>
    </mat-chip-list>
  `
})
export class ConnectorStatusComponent extends CellContentTemplateComponent {
  @Input() row: Connector;
}

@Pipe({name: 'appFormatConnectorStatus'})
export class AppFormatConnectorStatus implements PipeTransform {
  transform(status: string, type: string): string {
    if (type === 'class') {
      return this.buildConnectorStatusClasses(status);
    }
    if (type === 'text') {
      return this.buildConnectorStatusText(status);
    }
  }

  buildConnectorStatusClasses(status: string): string {
    let classNames = 'chip-width-8em ';
    switch (status) {
      case 'Available': {
        classNames += TYPE_SUCCESS;
        break;
      }
      case 'Preparing': {
        classNames += TYPE_WARNING;
        break;
      }
      case 'SuspendedEVSE': {
        classNames += TYPE_INFO;
        break;
      }
      case 'SuspendedEV': {
        classNames += TYPE_INFO;
        break;
      }
      case 'Finishing': {
        classNames += TYPE_WARNING;
        break;
      }
      case 'Reserved': {
        classNames += TYPE_INFO;
        break;
      }
      case 'Charging':
      case 'Occupied': {
        classNames += TYPE_INFO;
        break;
      }
      case 'Unavailable': {
        classNames += TYPE_GREY;
        break;
      }
      case 'Faulted': {
        classNames += TYPE_DANGER;
        break;
      }
      default: {
        classNames += TYPE_WARNING;
        break;
      }
    }
    return classNames;
  }

  buildConnectorStatusText(status: string): string {
    return `chargers.status_${status.toLowerCase()}`;
  }
}




