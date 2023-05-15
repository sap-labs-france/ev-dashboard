import { KeyValue } from 'types/GlobalType';

import { Constants } from '../../utils/Constants';
import { Utils } from '../../utils/Utils';

export const CONNECTORS: KeyValue[] = Array.from(Array(26).keys()).map((element: number) => ({
  key: (element + 1).toString(),
  value: Utils.getConnectorLetterFromConnectorID(element + 1),
}));

export const CONNECTOR_ALL_TYPES_MAP = [
  {
    key: Constants.SELECT_ALL,
    description: 'chargers.connector_type_all',
    svgIconName: Constants.SELECT_ALL,
    svgIconFile: 'assets/img/connectors/all_connectors.svg',
  },
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
