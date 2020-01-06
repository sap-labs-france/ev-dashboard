import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { OcpiEndpointDetail } from 'app/types/OCPIEndpoint';
import { Constants } from 'app/utils/Constants';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.failureNbr | appFormatOcpiEvsesFailure:'class'" [disabled]="true">
        {{row.failureNbr}}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OcpiDetailFailureEvsesStatusFormatterComponent extends CellContentTemplateComponent {
  @Input() row!: OcpiEndpointDetail;
}

@Pipe({name: 'appFormatOcpiEvsesFailure'})
export class AppFormatOcpiEvsesFailurePipe implements PipeTransform {
  transform(failureNbr: number, type: string): string {
    if (type === 'class') {
      let classNames = 'chip-width-4em ';
      if (failureNbr > 0) {
        classNames += Constants.CHIP_TYPE_DANGER;
      } else {
        classNames += Constants.CHIP_TYPE_GREY;
      }
      return classNames;
    }
    return '';
  }
}
