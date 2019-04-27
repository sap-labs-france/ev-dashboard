import {OcpiEndpointDetail} from 'app/common.types';
import {CellContentTemplateComponent} from 'app/shared/table/cell-content-template/cell-content-template.component';
import {Component, Input, PipeTransform, Pipe} from '@angular/core';
import {Constants} from 'app/utils/Constants';

@Component({
  selector: 'app-ocpi-detail-failure-evse-status-chip',
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.failureNbr | appFormatOcpiEvsesFailure:'class'" [disabled]="true">
        {{row.failureNbr}}
      </mat-chip>
    </mat-chip-list>
  `
})
export class OcpiDetailFailureEvsesStatusComponent extends CellContentTemplateComponent {
  @Input() row: OcpiEndpointDetail;
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
  }
}
