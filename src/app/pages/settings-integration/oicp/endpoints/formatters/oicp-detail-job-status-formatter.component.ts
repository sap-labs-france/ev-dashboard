import { Component, Input, Pipe, PipeTransform } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChipType } from '../../../../../types/GlobalType';
import { OicpEndpointDetail } from '../../../../../types/oicp/OICPEndpoint';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip
        [ngClass]="row.oicpendpoint.backgroundPatchJob | appFormatOicpDetailJobStatus : 'class'"
        [disabled]="true"
      >
        {{
          row.oicpendpoint.backgroundPatchJob | appFormatOicpDetailJobStatus : 'text' | translate
        }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OicpDetailJobStatusFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: OicpEndpointDetail;
}

@Pipe({ name: 'appFormatOicpDetailJobStatus' })
export class AppFormatOicpDetailJobStatusPipe implements PipeTransform {
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
