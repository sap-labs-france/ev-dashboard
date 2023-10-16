import { Component, Input, Pipe, PipeTransform } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChipType } from '../../../../../types/GlobalType';
import { OicpEndpointDetail } from '../../../../../types/oicp/OICPEndpoint';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.totalNbr | appFormatOicpEvsesTotal : 'class'" [disabled]="true">
        {{ row.totalNbr | appFormatOicpEvsesTotal : 'text' }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OicpDetailTotalEvsesStatusFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: OicpEndpointDetail;
}

@Pipe({ name: 'appFormatOicpEvsesTotal' })
export class AppFormatOicpEvsesTotalPipe implements PipeTransform {
  public transform(totalNbr: number, type: string): string {
    if (type === 'class') {
      let classNames = 'chip-width-5em ';
      if (totalNbr > 0) {
        classNames += ChipType.INFO;
      } else {
        classNames += ChipType.GREY;
      }
      return classNames;
    }
    if (type === 'text') {
      return totalNbr > 0 ? totalNbr.toString() : '-';
    }
    return '';
  }
}
