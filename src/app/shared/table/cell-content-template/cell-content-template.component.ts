import { Input } from '@angular/core';
import { TableColumnDef } from '../../../common.types';

export abstract class CellContentTemplateComponent {
  @Input() row: any;
  @Input() columnDef: TableColumnDef;
}
