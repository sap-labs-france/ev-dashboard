import {Pipe, PipeTransform} from '@angular/core';

const connectorTypeMap =
  [
    {key: 'T2', description: 'Type 2', image: 'assets/img/connectors/type2.gif'},
    {key: 'CCS', description: 'Combo (CCS)', image: 'assets/img/connectors/combo_ccs.gif'},
    {key: 'C', description: 'CHAdeMO', image: 'assets/img/connectors/chademo.gif'}
  ]

/**
 * Transform a connector ID as a number to a letter
 *
 * @class AppConnectorIdPipe
 * @implements {PipeTransform}
 */
@Pipe({name: 'appConnectorType'})
export class AppConnectorTypePipe implements PipeTransform {

  transform(type: string, asIconUrl: boolean = true): any {
    // Return the found key
    const foundConnectorType = connectorTypeMap.find(
      (connectorType) => connectorType.key === type);
    if (asIconUrl) {
      return (foundConnectorType ? foundConnectorType.image :
        'assets/img/connectors/no-connector.gif');
    } else {
      return (foundConnectorType ? foundConnectorType :
        {
          key: 'U',
          description: 'chargers.connector_unknown',
          image: 'assets/img/connectors/no-connector.gif'
        });
    }
  }
}
