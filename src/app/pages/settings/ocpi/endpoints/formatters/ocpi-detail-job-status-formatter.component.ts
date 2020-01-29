import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { ChipType } from 'app/types/GlobalType';
import { OcpiEndpointDetail } from 'app/types/OCPIEndpoint';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.ocpiendpoint.backgroundPatchJob | appFormatOcpiDetailJobStatus:'class'" [disabled]="true">
        {{row.ocpiendpoint.backgroundPatchJob | appFormatOcpiDetailJobStatus:'text' | translate}}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OcpiDetailJobStatusFomatterComponent extends CellContentTemplateComponent {
  @Input() row!: OcpiEndpointDetail;
}

@Pipe({name: 'appFormatOcpiDetailJobStatus'})
export class AppFormatOcpiDetailJobStatusPipe implements PipeTransform {
  transform(backgroundPatchJob: number, type: string): string {
    // Class
    if (type === 'class') {
      let classNames = 'chip-width-10em ';
      if (backgroundPatchJob > 0) {
        classNames += ChipType.SUCCESS;
      } else {
        classNames += ChipType.GREY;
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
    return '';
  }
}
