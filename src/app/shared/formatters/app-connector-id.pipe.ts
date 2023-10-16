import { Pipe, PipeTransform } from '@angular/core';

import { Utils } from '../../utils/Utils';

@Pipe({ name: 'appConnectorId' })
export class AppConnectorIdPipe implements PipeTransform {
  public transform(connectorID: number): string {
    return Utils.getConnectorLetterFromConnectorID(connectorID);
  }
}
