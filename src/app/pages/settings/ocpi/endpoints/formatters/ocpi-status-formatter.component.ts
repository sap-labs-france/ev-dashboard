import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { ChipType, KeyValue } from 'app/types/GlobalType';
import { OcpiEndpoint, OcpiEndpointStatus } from 'app/types/OCPIEndpoint';

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
  @Input() row!: OcpiEndpoint;
}

@Pipe({name: 'appFormatOcpiStatus'})
export class AppFormatOcpiStatusPipe implements PipeTransform {
  transform(status: string, type: string): string {
    // Class
    if (type === 'class') {
      let classNames = 'chip-width-10em ';
      switch (status) {
        case OcpiEndpointStatus.NEW:
          classNames += ChipType.INFO;
          break;
        case OcpiEndpointStatus.REGISTERED:
          classNames += ChipType.SUCCESS;
          break;
        case OcpiEndpointStatus.UNREGISTERED:
          classNames += ChipType.WARNING;
          break;
        default:
          classNames += ChipType.GREY;
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
    return '';
  }
}
