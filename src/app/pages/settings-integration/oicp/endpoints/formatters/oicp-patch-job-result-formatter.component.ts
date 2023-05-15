import { Component, Input, Pipe, PipeTransform } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChipType } from '../../../../../types/GlobalType';
import { OicpEndpoint } from '../../../../../types/oicp/OICPEndpoint';
import { Constants } from '../../../../../utils/Constants';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip
        [ngClass]="row.lastPatchJobResult | appFormatOicpPatchJobResult : 'class'"
        [disabled]="true"
      >
        {{ row.lastPatchJobResult | appFormatOicpPatchJobResult : 'text' | translate }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OicpPatchJobResultFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: OicpEndpoint;
}

@Pipe({ name: 'appFormatOicpPatchJobResult' })
export class AppFormatOicpPatchJobResultPipe implements PipeTransform {
  public transform(lastPatchJobResult: any, type: string): string {
    if (type === 'class') {
      let classNames = 'chip-width-10em ';
      if (lastPatchJobResult) {
        if (lastPatchJobResult.successNbr === 0 && lastPatchJobResult.failureNbr > 0) {
          classNames += ChipType.DANGER;
        } else if (lastPatchJobResult.successNbr > 0 && lastPatchJobResult.failureNbr === 0) {
          classNames += ChipType.SUCCESS;
        } else if (lastPatchJobResult.successNbr > 0 && lastPatchJobResult.failureNbr > 0) {
          classNames += ChipType.WARNING;
        } else {
          classNames += ChipType.SUCCESS;
        }
      } else {
        classNames += ChipType.GREY;
      }
      return classNames;
    }
    if (type === 'text') {
      let text = '';
      if (lastPatchJobResult) {
        const totalEVSEs = lastPatchJobResult.successNbr + lastPatchJobResult.failureNbr;
        text = `${lastPatchJobResult.successNbr} / ${totalEVSEs}`;
        if (lastPatchJobResult.successNbr === 0 && lastPatchJobResult.failureNbr > 0) {
          text = 'general.error';
        } else if (lastPatchJobResult.successNbr > 0 && lastPatchJobResult.failureNbr === 0) {
          text = 'general.success';
        } else if (lastPatchJobResult.successNbr > 0 && lastPatchJobResult.failureNbr > 0) {
          text = 'general.warning';
        } else {
          text = 'general.success';
        }
      } else {
        text = 'oicpendpoints.background_job_no_run';
      }
      return text;
    }
    return '';
  }
}
