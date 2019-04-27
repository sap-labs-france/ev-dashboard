import {Pipe, PipeTransform} from '@angular/core';
import moment from 'moment';
import { TableColumnDef } from 'app/common.types';
import { Utils } from 'app/utils/Utils';

@Pipe({name: 'appFormatRowCell'})
export class AppFormatRowCellPipe implements PipeTransform {

  transform(value: any, tableColumnDef: TableColumnDef, row: any): any {
    let formattedValue = value;
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
    return formattedValue;
  }
}
