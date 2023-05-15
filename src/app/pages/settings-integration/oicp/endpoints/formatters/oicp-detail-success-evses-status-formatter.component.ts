import { Component, Input } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { OicpEndpointDetail } from '../../../../../types/oicp/OICPEndpoint';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip ngClass="chip-width-5em chip-success" [disabled]="true">
        {{ row.successNbr }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OicpDetailSuccessEvsesStatusFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: OicpEndpointDetail;
}
