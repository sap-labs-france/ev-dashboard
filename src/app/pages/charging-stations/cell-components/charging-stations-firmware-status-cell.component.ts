import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { ChipType } from 'types/GlobalType';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChargingStation, FirmwareStatus } from '../../../types/ChargingStation';

@Component({
  template: `
    <ng-container
      *ngIf="
        !row?.firmwareUpdateStatus || row?.firmwareUpdateStatus === 'Idle';
        else displayFirmwareStatus
      "
    >
      <span class="d-none d-xl-table-cell text-center p-1">{{ row.firmwareVersion }}</span>
    </ng-container>
    <ng-template #displayFirmwareStatus>
      <ng-container class="table-cell-angular-big-component">
        <mat-chip-list [selectable]="false">
          <mat-chip
            [ngClass]="row.firmwareUpdateStatus | appChargingStationsFormatFirmwareStatus : 'class'"
            [disabled]="true"
          >
            {{
              row.firmwareUpdateStatus
                | appChargingStationsFormatFirmwareStatus : 'text'
                | translate
            }}
          </mat-chip>
        </mat-chip-list>
      </ng-container>
    </ng-template>
  `,
})
export class ChargingStationsFirmwareStatusCellComponent extends CellContentTemplateDirective {
  @Input() public row!: ChargingStation;
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
        classNames += ChipType.SUCCESS;
        break;
      }
      case FirmwareStatus.DOWNLOADING: {
        classNames += ChipType.INFO;
        break;
      }
      case FirmwareStatus.DOWNLOAD_FAILED: {
        classNames += ChipType.DANGER;
        break;
      }
      case FirmwareStatus.IDLE: {
        classNames += ChipType.INFO;
        break;
      }
      case FirmwareStatus.INSTALLATION_FAILED: {
        classNames += ChipType.DANGER;
        break;
      }
      case FirmwareStatus.INSTALLED: {
        classNames += ChipType.SUCCESS;
        break;
      }
      case FirmwareStatus.INSTALLING: {
        classNames += ChipType.INFO;
        break;
      }
      default: {
        classNames += ChipType.GREY;
        break;
      }
    }
    return classNames;
  }

  public buildFirmwareStatusText(status: string): string {
    if (status) {
      return `chargers.status_firmware_${status.toLowerCase()}`;
    }
  }
}
