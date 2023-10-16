import { Component, Input, Pipe, PipeTransform } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChipType, KeyValue } from '../../../../../types/GlobalType';
import { OicpEndpoint, OicpEndpointStatus } from '../../../../../types/oicp/OICPEndpoint';

export const oicpStatuses: KeyValue[] = [
  { key: 'new', value: 'oicpendpoints.new' },
  { key: 'registered', value: 'oicpendpoints.registered' },
  { key: 'unregistered', value: 'oicpendpoints.unregistered' },
];

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.status | appFormatOicpStatus : 'class'" [disabled]="true">
        {{ row.status | appFormatOicpStatus : 'text' | translate }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OicpEndpointStatusFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: OicpEndpoint;
}

@Pipe({ name: 'appFormatOicpStatus' })
export class AppFormatOicpStatusPipe implements PipeTransform {
  public transform(status: string, type: string): string {
    // Class
    if (type === 'class') {
      let classNames = 'chip-width-10em ';
      switch (status) {
        case OicpEndpointStatus.NEW:
          classNames += ChipType.INFO;
          break;
        case OicpEndpointStatus.REGISTERED:
          classNames += ChipType.SUCCESS;
          break;
        case OicpEndpointStatus.UNREGISTERED:
          classNames += ChipType.WARNING;
          break;
        default:
          classNames += ChipType.GREY;
      }
      return classNames;
    }
    // Text
    if (type === 'text') {
      for (const oicpStatus of oicpStatuses) {
        if (status === oicpStatus.key) {
          return oicpStatus.value;
        }
      }
    }
    return '';
  }
}
