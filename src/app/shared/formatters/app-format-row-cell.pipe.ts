import { Pipe, PipeTransform } from '@angular/core';

import { TableColumnDef } from '../../types/Table';
import { Utils } from '../../utils/Utils';

@Pipe({ name: 'appFormatRowCell' })
export class AppFormatRowCellPipe implements PipeTransform {
  public transform(value: string, tableColumnDef: TableColumnDef, row: any): string | null {
    let formattedValue: any = value;
    // Convert to primitive/object first
    switch (tableColumnDef.type) {
      // Date
      case 'date':
        formattedValue = Utils.convertToDate(formattedValue);
        break;
      // Integer
      case 'integer':
        formattedValue = Utils.convertToInteger(formattedValue);
        break;
      // Float
      case 'float':
        formattedValue = Utils.convertToFloat(formattedValue);
        break;
    }
    // Format
    if (tableColumnDef.formatter) {
      formattedValue = tableColumnDef.formatter(formattedValue, row);
    }
    return formattedValue as string;
  }
}
