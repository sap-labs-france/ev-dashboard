import { KeyValue } from 'types/GlobalType';
import { Utils } from 'utils/Utils';

export const CONNECTORS: KeyValue[] = Array.from(Array(26).keys()).map(function (element) {
  return { key: (element + 1).toString(), value: Utils.getConnectorLetterFromConnectorID(element + 1) };
});
