import { Component, Input } from '@angular/core';
import { OCPIEndpoint } from 'types/ocpi/OCPIEndpoint';
import { TableColumnDef } from 'types/Table';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip ngClass="chip-width-5em chip-danger" [disabled]="true">
        {{ row[columnDef.id]?.failureNbr || '0' }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class OcpiDetailFailureFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: OCPIEndpoint;
  @Input() public columnDef!: TableColumnDef;
}
