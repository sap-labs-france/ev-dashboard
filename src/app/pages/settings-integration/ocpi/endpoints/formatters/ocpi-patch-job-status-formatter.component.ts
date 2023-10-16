import { Component, Input, Pipe, PipeTransform } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChipType } from '../../../../../types/GlobalType';
import { OCPIEndpoint } from '../../../../../types/ocpi/OCPIEndpoint';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip
        [ngClass]="row.backgroundPatchJob | appFormatOcpiPatchJobStatus : 'class'"
        [disabled]="true"
      >
        {{ row.backgroundPatchJob | appFormatOcpiPatchJobStatus : 'text' | translate }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OcpiPatchJobStatusFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: OCPIEndpoint;
}

@Pipe({ name: 'appFormatOcpiPatchJobStatus' })
export class AppFormatOcpiPatchJobStatusPipe implements PipeTransform {
  public transform(backgroundPatchJob: boolean, type: string): string {
    // Class
    if (type === 'class') {
      let classNames = 'chip-width-10em ';
      if (backgroundPatchJob) {
        classNames += ChipType.SUCCESS;
      } else {
        classNames += ChipType.GREY;
      }
      return classNames;
    }
    // Text
    if (type === 'text') {
      if (backgroundPatchJob) {
        return 'ocpiendpoints.status_active';
      }
      return 'ocpiendpoints.status_inactive';
    }
    return '';
  }
}
