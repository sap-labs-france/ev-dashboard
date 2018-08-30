import { SortDirection } from '@angular/material/typings';

export interface TableColumnDef {
  id: string;
  name: string;
  type?: string;
  class?: string;
  formatter?: Function,
  formatterOptions?: any,
  sorted?: boolean;
  direction?: SortDirection;
}
