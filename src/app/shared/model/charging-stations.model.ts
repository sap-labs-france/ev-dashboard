import { KeyValue } from 'types/GlobalType';
import { Utils } from 'utils/Utils';

export const CONNECTORS: KeyValue[] = Array.from(Array(26).keys()).map((element: number) => ({ key: (element + 1).toString(), value: Utils.getConnectorLetterFromConnectorID(element + 1) }));
