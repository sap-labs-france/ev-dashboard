import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { ChipType } from 'app/types/GlobalType';
import { OcpiEndpoint } from 'app/types/OCPIEndpoint';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.lastPatchJobResult | appFormatOcpiJobResult:'class'" [disabled]="true">
        {{row.lastPatchJobResult | appFormatOcpiJobResult:'text' | translate}}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OcpiJobResultFormatterComponent extends CellContentTemplateComponent {
  @Input() public row!: OcpiEndpoint;
}

@Pipe({name: 'appFormatOcpiJobResult'})
export class AppFormatOcpiJobResultPipe implements PipeTransform {
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
        text = 'ocpiendpoints.background_job_no_run';
      }
      return text;
    }
    return '';
  }
}
