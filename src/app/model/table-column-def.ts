import { SortDirection } from '@angular/material/typings';

export interface TableColumnDef {
  id: string;
  name: string;
  class: string;
  sorted?: boolean;
  direction?: SortDirection;
}
