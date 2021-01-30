import { Component, Input, Pipe, PipeTransform } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChipType } from '../../../../../types/GlobalType';
import { OcpiEndpointDetail } from '../../../../../types/ocpi/OCPIEndpoint';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.ocpiendpoint.backgroundPatchJob | appFormatOcpiDetailJobStatus:'class'" [disabled]="true">
        {{row.ocpiendpoint.backgroundPatchJob | appFormatOcpiDetailJobStatus:'text' | translate}}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OcpiDetailJobStatusFomatterComponent extends CellContentTemplateDirective {
  @Input() public row!: OcpiEndpointDetail;
}

@Pipe({ name: 'appFormatOcpiDetailJobStatus' })
export class AppFormatOcpiDetailJobStatusPipe implements PipeTransform {
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
