import {OcpiEndpoint} from 'app/common.types';
import {CellContentTemplateComponent} from 'app/shared/table/cell-content-template/cell-content-template.component';
import {Component, Input, PipeTransform, Pipe} from '@angular/core';
import {Constants} from 'app/utils/Constants';

@Component({
  selector: 'app-ocpi-patch-job-status-chip',
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.backgroundPatchJob | appFormatOcpiJobStatus:'class'" [disabled]="true">
        {{row.backgroundPatchJob | appFormatOcpiJobStatus:'text' | translate}}
      </mat-chip>
    </mat-chip-list>
  `
})
export class OcpiPatchJobStatusComponent extends CellContentTemplateComponent {
  @Input() row: OcpiEndpoint;
}

@Pipe({name: 'appFormatOcpiPatchJobStatus'})
export class AppFormatOcpiJobStatusPipe implements PipeTransform {
  transform(backgroundPatchJob: number, type: string): string {
    // Class
    if (type === 'class') {
      let classNames = 'chip-width-10em ';
      if (backgroundPatchJob > 0) {
        classNames += Constants.CHIP_TYPE_SUCCESS;
      } else {
        classNames += Constants.CHIP_TYPE_GREY;
      }
      return classNames;
    }
    // Text
    if (type === 'text') {
      if (backgroundPatchJob > 0) {
        return 'ocpiendpoints.status_active';
      } else {
        return 'ocpiendpoints.status_inactive';
      }
    }
  }
}
