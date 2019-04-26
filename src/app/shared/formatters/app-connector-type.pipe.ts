import {Pipe, PipeTransform} from '@angular/core';

export const CONNECTOR_TYPE_MAP =
  [
    {key: 'T2', description: 'chargers.connector_type_type2', svgIconName: 'T2', svgIconFile: 'assets/img/connectors/type2.svg'},
    {key: 'C2', description: 'chargers.connector_type_combo2', svgIconName: 'C2', svgIconFile: 'assets/img/connectors/combo2.svg'},
    {key: 'T1', description: 'chargers.connector_type_type1', svgIconName: 'T1', svgIconFile: 'assets/img/connectors/type1.svg'},
    {key: 'C1', description: 'chargers.connector_type_combo1', svgIconName: 'C1', svgIconFile: 'assets/img/connectors/combo1.svg'},
// CCS is maintained for legacy purposes - use C2 instead
    {key: 'CCS', description: 'chargers.connector_type_combo', svgIconName: 'CCS', svgIconFile: 'assets/img/connectors/combo_ccs.svg'},
    {key: 'C', description: 'chargers.connector_type_chademo', svgIconName: 'C', svgIconFile: 'assets/img/connectors/chademo.svg'},
    {key: 'U', description: 'chargers.connector_type_unknown', svgIconName: 'U', svgIconFile: 'assets/img/connectors/no-connector.svg'}
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
      return (foundConnectorType ? foundConnectorType.svgIconName : 'U');
    } else {
      return (foundConnectorType ? foundConnectorType.description : 'chargers.connector_type_unknown');
    }
  }
}
