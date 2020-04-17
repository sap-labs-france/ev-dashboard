import { Component, Input } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { OcpiEndpointDetail } from 'app/types/OCPIEndpoint';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip ngClass="chip-width-4em chip-success" [disabled]="true">
        {{row.successNbr}}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OcpiDetailSuccessEvsesStatusFormatterComponent extends CellContentTemplateComponent {
  @Input() row!: OcpiEndpointDetail;
}
