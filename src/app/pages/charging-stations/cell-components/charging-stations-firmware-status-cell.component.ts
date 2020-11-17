import { Component, Input, Pipe, PipeTransform } from '@angular/core';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChargingStation, FirmwareStatus } from '../../../types/ChargingStation';

const TYPE_INFO = 'chip-info';
const TYPE_SUCCESS = 'chip-success';
const TYPE_DANGER = 'chip-danger';
const TYPE_WARNING = 'chip-warning';
const TYPE_GREY = 'chip-grey';

@Component({
  template: `
    <ng-container *ngIf="!isActiveStatus()">
      <span class="d-none d-xl-table-cell text-center firmware-version">{{row.firmwareVersion}}</span>
    </ng-container>
    <ng-container *ngIf="isActiveStatus()" class="table-cell-angular-big-component">
      <mat-chip-list [selectable]="false">
        <mat-chip [ngClass]="row.firmwareUpdateStatus | appChargingStationsFormatFirmwareStatus:'class'" [disabled]="true">
          {{row.firmwareUpdateStatus | appChargingStationsFormatFirmwareStatus:'text' | translate}}
        </mat-chip>
      </mat-chip-list>
    </ng-container>
  `,
})
export class ChargingStationsFirmwareStatusCellComponent extends CellContentTemplateDirective {
  @Input() public row!: ChargingStation;

  public isActiveStatus(): boolean {
    if (this.row.firmwareUpdateStatus) {
      if (this.row.firmwareUpdateStatus === FirmwareStatus.IDLE || this.row.firmwareUpdateStatus === FirmwareStatus.INSTALLED) {
        return false;
      }
      return true;
    }
    return false;
  }
}

@Pipe({ name: 'appChargingStationsFormatFirmwareStatus' })
export class AppChargingStationsFormatFirmwareStatusPipe implements PipeTransform {
  public transform(status: string, type: string): string {
    if (type === 'class') {
      return this.buildFirmwareStatusClasses(status);
    }
    if (type === 'text') {
      return this.buildFirmwareStatusText(status);
    }
    return '';
  }

  public buildFirmwareStatusClasses(status: string): string {
    let classNames = 'chip-width-13em ';
    switch (status) {
      case FirmwareStatus.DOWNLOADED: {
        classNames += TYPE_SUCCESS;
        break;
      }
      case FirmwareStatus.DOWNLOADING: {
        classNames += TYPE_INFO;
        break;
      }
      case FirmwareStatus.DOWNLOAD_FAILED: {
        classNames += TYPE_DANGER;
        break;
      }
      case FirmwareStatus.IDLE: {
        classNames += TYPE_INFO;
        break;
      }
      case FirmwareStatus.INSTALLATION_FAILED: {
        classNames += TYPE_DANGER;
        break;
      }
      case FirmwareStatus.INSTALLED: {
        classNames += TYPE_SUCCESS;
        break;
      }
      case FirmwareStatus.INSTALLING: {
        classNames += TYPE_INFO;
        break;
      }
      default: {
        classNames += TYPE_GREY;
        break;
      }
    }
    return classNames;
  }

  public buildFirmwareStatusText(status: string): string {
    return `chargers.status_firmware_${status.toLowerCase()}`;
  }

}
