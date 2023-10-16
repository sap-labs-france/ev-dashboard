import { Component, Input, Pipe, PipeTransform } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChipType, KeyValue } from '../../../../../types/GlobalType';
import { OCPIEndpoint, OCPIRegistrationStatus } from '../../../../../types/ocpi/OCPIEndpoint';

export const ocpiStatuses: KeyValue[] = [
  { key: 'new', value: 'ocpiendpoints.new' },
  { key: 'registered', value: 'ocpiendpoints.registered' },
  { key: 'unregistered', value: 'ocpiendpoints.unregistered' },
];

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.status | appFormatOcpiStatus : 'class'" [disabled]="true">
        {{ row.status | appFormatOcpiStatus : 'text' | translate }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OcpiEndpointStatusFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: OCPIEndpoint;
}

@Pipe({ name: 'appFormatOcpiStatus' })
export class AppFormatOcpiStatusPipe implements PipeTransform {
  public transform(status: string, type: string): string {
    // Class
    if (type === 'class') {
      let classNames = 'chip-width-10em ';
      switch (status) {
        case OCPIRegistrationStatus.NEW:
          classNames += ChipType.INFO;
          break;
        case OCPIRegistrationStatus.REGISTERED:
          classNames += ChipType.SUCCESS;
          break;
        case OCPIRegistrationStatus.UNREGISTERED:
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
