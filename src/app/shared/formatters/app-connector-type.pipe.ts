import {Pipe, PipeTransform} from '@angular/core';

export const CONNECTOR_TYPE_MAP =
  [
    {key: 'T2', description: 'chargers.connector_type_type2', image: 'assets/img/connectors/type2.gif'},
    {key: 'CCS', description: 'chargers.connector_type_combo', image: 'assets/img/connectors/combo_ccs.gif'},
    {key: 'C', description: 'chargers.connector_type_chademo', image: 'assets/img/connectors/chademo.gif'}
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
    const foundConnectorType = CONNECTOR_TYPE_MAP.find(
      (connectorType) => connectorType.key === type);
    if (asIconUrl) {
      return (foundConnectorType ? foundConnectorType.image :
        'assets/img/connectors/no-connector.gif');
    } else {
      return (foundConnectorType ? foundConnectorType.description : 'chargers.connector_unknown');
    }
  }
}
