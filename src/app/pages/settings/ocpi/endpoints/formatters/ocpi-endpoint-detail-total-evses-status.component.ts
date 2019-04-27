import {OcpiEndpointDetail} from 'app/common.types';
import {CellContentTemplateComponent} from 'app/shared/table/cell-content-template/cell-content-template.component';
import {Component, Input, PipeTransform, Pipe} from '@angular/core';
import {Constants} from 'app/utils/Constants';

@Component({
  selector: 'app-ocpi-detail-total-evse-status-chip',
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.totalNbr | appFormatOcpiEvsesTotal:'class'" [disabled]="true">
        {{row.totalNbr | appFormatOcpiEvsesTotal:'text'}}
      </mat-chip>
    </mat-chip-list>
  `
})
export class OcpiDetailTotalEvsesStatusComponent extends CellContentTemplateComponent {
  @Input() row: OcpiEndpointDetail;
}

@Pipe({name: 'appFormatOcpiEvsesTotal'})
export class AppFormatOcpiEvsesTotalPipe implements PipeTransform {
  transform(totalNbr: number, type: string): string {
    if (type === 'class') {
      let classNames = 'chip-width-4em ';
      if (totalNbr > 0) {
        classNames += Constants.CHIP_TYPE_INFO;
      } else {
        classNames += Constants.CHIP_TYPE_GREY;
      }
      return classNames;
    }
    if (type === 'text') {
      return (totalNbr > 0 ? totalNbr.toString() : '-');
    }
  }
}
