import {OcpiEndpoint} from 'app/common.types';
import {CellContentTemplateComponent} from 'app/shared/table/cell-content-template/cell-content-template.component';
import {Component, Input, PipeTransform, Pipe} from '@angular/core';
import {Constants} from 'app/utils/Constants';

@Component({
  selector: 'app-ocpi-job-result-chip',
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.lastPatchJobResult | appFormatOcpiJobResult:'class'" [disabled]="true">
        {{row.lastPatchJobResult | appFormatOcpiJobResult:'text' | translate}}
      </mat-chip>
    </mat-chip-list>
  `
})
export class OcpiJobResultComponent extends CellContentTemplateComponent {
  @Input() row: OcpiEndpoint;
}

@Pipe({name: 'appFormatOcpiJobResult'})
export class AppFormatOcpiJobResultPipe implements PipeTransform {
  transform(lastPatchJobResult: any, type: string): string {
    if (type === 'class') {
      let classNames = 'chip-width-10em ';
      if (lastPatchJobResult) {
        if (lastPatchJobResult.successNbr === 0 && lastPatchJobResult.failureNbr > 0) {
          classNames += Constants.CHIP_TYPE_DANGER;
        } else if (lastPatchJobResult.successNbr > 0 && lastPatchJobResult.failureNbr === 0) {
          classNames += Constants.CHIP_TYPE_SUCCESS;
        } else if (lastPatchJobResult.successNbr > 0 && lastPatchJobResult.failureNbr > 0) {
          classNames += Constants.CHIP_TYPE_WARNING;
        } else {
          classNames += Constants.CHIP_TYPE_SUCCESS;
        }
      } else {
        classNames += Constants.CHIP_TYPE_GREY;
      }
      return classNames;
    }
    if (type === 'text') {
      let text = '';
      if (lastPatchJobResult) {
        const totalEVSEs = lastPatchJobResult.successNbr + lastPatchJobResult.failureNbr;
        text = `${lastPatchJobResult.successNbr} / ${totalEVSEs}`
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
        text = 'ocpiendpoints.background_job_no_run';
      }
      return text;
    }
  }
}
