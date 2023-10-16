import { Component, Input } from '@angular/core';
import { TableColumnDef } from 'types/Table';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { OCPIEndpoint } from '../../../../../types/ocpi/OCPIEndpoint';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip ngClass="chip-width-5em chip-info" [disabled]="true">
        {{ row[columnDef.id]?.totalNbr || '0' }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OcpiDetailTotalFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: OCPIEndpoint;
  @Input() public columnDef!: TableColumnDef;
}
