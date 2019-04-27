import {Pipe, PipeTransform} from '@angular/core';
import moment from 'moment';
import { TableColumnDef } from 'app/common.types';
import { Utils } from 'app/utils/Utils';

@Pipe({name: 'appFormatRowCell'})
export class AppFormatRowCellPipe implements PipeTransform {

  transform(row: any, tableColumnDef: TableColumnDef, ): any {
    let value = row[tableColumnDef.id];
    // Convert to primitive/object first
    switch (tableColumnDef.type) {
      // Date
      case 'date':
        value = Utils.convertToDate(value);
        break;
      // Integer
      case 'integer':
        value = Utils.convertToInteger(value);
        break;
      // Float
      case 'float':
        value = Utils.convertToFloat(value);
        break;
    }
    // Format
    if (tableColumnDef.formatter) {
      value = tableColumnDef.formatter(value, row);
    }
    return value;
  }
}
