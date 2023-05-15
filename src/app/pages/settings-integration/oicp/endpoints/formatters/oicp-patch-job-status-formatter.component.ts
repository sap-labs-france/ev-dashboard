import { Component, Input, Pipe, PipeTransform } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChipType } from '../../../../../types/GlobalType';
import { OicpEndpoint } from '../../../../../types/oicp/OICPEndpoint';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip
        [ngClass]="row.backgroundPatchJob | appFormatOicpPatchJobStatus : 'class'"
        [disabled]="true"
      >
        {{ row.backgroundPatchJob | appFormatOicpPatchJobStatus : 'text' | translate }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OicpPatchJobStatusFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: OicpEndpoint;
}

@Pipe({ name: 'appFormatOicpPatchJobStatus' })
export class AppFormatOicpPatchJobStatusPipe implements PipeTransform {
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
        return 'oicpendpoints.status_active';
      }
      return 'oicpendpoints.status_inactive';
    }
    return '';
  }
}
