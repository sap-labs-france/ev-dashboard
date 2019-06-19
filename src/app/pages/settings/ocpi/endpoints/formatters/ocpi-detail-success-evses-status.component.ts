import { Component, Input } from '@angular/core';
import { OcpiEndpointDetail } from 'app/common.types';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';

@Component({
  selector: 'app-ocpi-detail-success-evses-status-chip',
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip ngClass="chip-width-4em chip-success" [disabled]="true">
        {{row.successNbr}}
      </mat-chip>
    </mat-chip-list>
  `
})
export class OcpiDetailSuccessEvsesStatusComponent extends CellContentTemplateComponent {
  @Input() row: OcpiEndpointDetail;
}
