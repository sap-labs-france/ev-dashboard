import { Component, Input } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { OcpiEndpointDetail } from '../../../../../types/ocpi/OCPIEndpoint';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip ngClass="chip-width-4em chip-success" [disabled]="true">
        {{row.successNbr}}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OcpiDetailSuccessEvsesStatusFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: OcpiEndpointDetail;
}
