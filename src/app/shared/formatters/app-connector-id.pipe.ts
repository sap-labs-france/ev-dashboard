import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'appConnectorId'})
export class AppConnectorIdPipe implements PipeTransform {

  public transform(connectorID: number): string {
    return String.fromCharCode(65 + connectorID - 1);
  }
}
