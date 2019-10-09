import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { KeyValue, OcpiEndpoint } from 'app/common.types';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { Constants } from 'app/utils/Constants';

export const ocpiStatuses: KeyValue[] = [
  {key: 'new', value: 'ocpiendpoints.new'},
  {key: 'registered', value: 'ocpiendpoints.registered'},
  {key: 'unregistered', value: 'ocpiendpoints.unregistered'},
];

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.status | appFormatOcpiStatus:'class'" [disabled]="true">
        {{row.status | appFormatOcpiStatus:'text' | translate}}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OcpiEndpointStatusFormatterComponent extends CellContentTemplateComponent {
  @Input() row: OcpiEndpoint;
}

@Pipe({name: 'appFormatOcpiStatus'})
export class AppFormatOcpiStatusPipe implements PipeTransform {
  transform(status: string, type: string): string {
    // Class
    if (type === 'class') {
      let classNames = 'chip-width-10em ';
      switch (status) {
        case Constants.OCPI_ENDPOINT_STATUS_NEW:
          classNames += Constants.CHIP_TYPE_INFO;
          break;
        case Constants.OCPI_ENDPOINT_STATUS_REGISTERED:
          classNames += Constants.CHIP_TYPE_SUCCESS;
          break;
        case Constants.OCPI_ENDPOINT_STATUS_UNREGISTERED:
          classNames += Constants.CHIP_TYPE_WARNING;
          break;
        default:
          classNames += Constants.CHIP_TYPE_GREY;
      }
      return classNames;
    }
    // Text
    if (type === 'text') {
      for (const ocpiStatus of ocpiStatuses) {
        if (status === ocpiStatus.key) {
          return ocpiStatus.value;
        }
      }
      }
  }
}
