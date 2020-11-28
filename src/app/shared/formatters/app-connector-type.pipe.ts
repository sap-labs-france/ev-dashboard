import { Pipe, PipeTransform } from '@angular/core';

export const CONNECTOR_TYPE_MAP =
  [
    {
      key: 'T2',
      description: 'chargers.connector_type_type2',
      svgIconName: 'T2',
      svgIconFile: 'assets/img/connectors/type2.svg',
    },
    {
      key: 'CCS',
      description: 'chargers.connector_type_combo',
      svgIconName: 'CCS',
      svgIconFile: 'assets/img/connectors/combo-ccs.svg',
    },
    {
      key: 'C',
      description: 'chargers.connector_type_chademo',
      svgIconName: 'C',
      svgIconFile: 'assets/img/connectors/chademo.svg',
    },
    {
      key: 'T1',
      description: 'chargers.connector_type_type1',
      svgIconName: 'T1',
      svgIconFile: 'assets/img/connectors/type1.svg',
    },
    {
      key: 'T1CCS',
      description: 'chargers.connector_type_type1ccs',
      svgIconName: 'T1CCS',
      svgIconFile: 'assets/img/connectors/type1-ccs.svg',
    },
    {
      key: 'D',
      description: 'chargers.connector_type_domestic',
      svgIconName: 'D',
      svgIconFile: 'assets/img/connectors/domestic-ue.svg',
    },
    {
      key: 'U',
      description: 'chargers.connector_type_unknown',
      svgIconName: 'U',
      svgIconFile: 'assets/img/connectors/no-connector.svg',
    },
  ];

@Pipe({ name: 'appConnectorType' })
export class AppConnectorTypePipe implements PipeTransform {

  public transform(type: string, target: string = 'icon'): any {
    // Return the found key
    const foundConnectorType = CONNECTOR_TYPE_MAP.find(
      (connectorType) => connectorType.key === type);
    if (target === 'icon') {
      return (foundConnectorType ? foundConnectorType.svgIconName : 'U');
    }
    if (target === 'text') {
      return (foundConnectorType ? foundConnectorType.description : 'chargers.connector_type_unknown');
    }
  }
}
