import {Pipe, PipeTransform} from '@angular/core';

const connectorIdMap = {
  1: "A",
  2: "B",
  3: "C",
  4: "D",
  5: "E",
  6: "F"
}

/**
 * Transform a connector ID as a number to a letter
 *
 * @class AppConnectorIdPipe
 * @implements {PipeTransform}
 */
@Pipe({name: 'appConnectorId'})
export class AppConnectorIdPipe implements PipeTransform {
  transform(value: number): any {
    return connectorIdMap[value];
  }
}
