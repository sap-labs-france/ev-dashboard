import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { ChargingStation, FirmwareStatus } from 'app/types/ChargingStation';

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
        <mat-chip [ngClass]="row.latestFirmwareUpdateStatus | appChargingStationsFormatFirmwareStatus:'class'" [disabled]="true">
          {{row.latestFirmwareUpdateStatus | appChargingStationsFormatFirmwareStatus:'text' | translate}}
        </mat-chip>
      </mat-chip-list>
    </ng-container>
  `,
})
export class ChargingStationsFirmwareStatusCellComponent extends CellContentTemplateComponent {
  @Input() row!: ChargingStation;

  isActiveStatus(): boolean {
    if (this.row.latestFirmwareUpdateStatus) {
      if (this.row.latestFirmwareUpdateStatus === FirmwareStatus.IDLE || this.row.latestFirmwareUpdateStatus === FirmwareStatus.INSTALLED) {
        return false;
      }
      return true;
    }
    return false;
  }
}

@Pipe({name: 'appChargingStationsFormatFirmwareStatus'})
export class AppChargingStationsFormatFirmwareStatusPipe implements PipeTransform {
  transform(status: string, type: string): string {
    if (type === 'class') {
      return this.buildFirmwareStatusClasses(status);
    }
    if (type === 'text') {
      return this.buildFirmwareStatusText(status);
    }
    return '';
  }

  buildFirmwareStatusClasses(status: string): string {
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

  buildFirmwareStatusText(status: string): string {
    return `chargers.status_firmware_${status.toLowerCase()}`;
  }

}
