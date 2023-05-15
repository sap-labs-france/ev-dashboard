import { Component, Input, Pipe, PipeTransform } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChipType } from '../../../../../types/GlobalType';
import { OicpEndpointDetail } from '../../../../../types/oicp/OICPEndpoint';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.failureNbr | appFormatOicpEvsesFailure : 'class'" [disabled]="true">
        {{ row.failureNbr }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OicpDetailFailureEvsesStatusFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: OicpEndpointDetail;
}

@Pipe({ name: 'appFormatOicpEvsesFailure' })
export class AppFormatOicpEvsesFailurePipe implements PipeTransform {
  public transform(failureNbr: number, type: string): string {
    if (type === 'class') {
      let classNames = 'chip-width-5em ';
      if (failureNbr > 0) {
        classNames += ChipType.DANGER;
      } else {
        classNames += ChipType.GREY;
      }
      return classNames;
    }
    return '';
  }
}
