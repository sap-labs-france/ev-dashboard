import { KeyValue } from '../../types/GlobalType';
import { ServerAction } from '../../types/Server';

export const logLevels: KeyValue[] = [
  { key: 'E', value: 'logs.error' },
  { key: 'W', value: 'logs.warning' },
  { key: 'I', value: 'logs.info' },
  { key: 'D', value: 'logs.debug' },
];

export const sources: KeyValue[] = [
  { key: 'Batch', value: 'Batch Server' },
  { key: 'Json', value: 'Json Server' },
  { key: 'Ocpi', value: 'OCPI Server' },
  { key: 'Oicp', value: 'OICP Server' },
  { key: 'OData', value: 'OData Server' },
  { key: 'Soap', value: 'Soap Server' },
  { key: 'Rest', value: 'Rest Server' },
  { key: 'CentralServer', value: 'Central Server' },
];

export const LOG_ACTIONS: KeyValue[] = Object.values(ServerAction)
  .map((value) => ({ key: value, value }))
  .sort((action1, action2) => {
    if (action1.value.toLocaleLowerCase() < action2.value.toLocaleLowerCase()) {
      return -1;
    }
    if (action1.value.toLocaleLowerCase() > action2.value.toLocaleLowerCase()) {
      return 1;
    }
    return 0;
  });

export const LOG_HOSTS: KeyValue[] = [
  { key: 'sap-ev-batch-server-dev', value: 'sap-ev-batch-server-dev' },
  { key: 'sap-ev-batch-server-prod', value: 'sap-ev-batch-server-prod' },
  { key: 'sap-ev-batch-server-server-qa', value: 'sap-ev-batch-server-qa' },
  { key: 'sap-ev-chargebox-json-server-dev', value: 'sap-ev-chargebox-json-server-dev' },
  { key: 'sap-ev-chargebox-json-server-prod', value: 'sap-ev-chargebox-json-server-prod' },
  { key: 'sap-ev-chargebox-json-server-qa', value: 'sap-ev-chargebox-json-server-qa' },
  { key: 'sap-ev-chargebox-soap-server-dev', value: 'sap-ev-chargebox-soap-server-dev' },
  { key: 'sap-ev-chargebox-soap-server-prod', value: 'sap-ev-chargebox-soap-server-prod' },
  { key: 'sap-ev-chargebox-soap-server-qa', value: 'sap-ev-chargebox-soap-server-qa' },
  { key: 'sap-ev-front-end-dev', value: 'sap-ev-front-end-dev' },
  { key: 'sap-ev-front-end-prod', value: 'sap-ev-front-end-prod' },
  { key: 'sap-ev-front-end-qa', value: 'sap-ev-front-end-qa' },
  { key: 'sap-ev-ocpi-server-dev', value: 'sap-ev-ocpi-server-dev' },
  { key: 'sap-ev-ocpi-server-prod', value: 'sap-ev-ocpi-server-prod' },
  { key: 'sap-ev-ocpi-server-qa', value: 'sap-ev-ocpi-server-qa' },
  { key: 'sap-ev-odata-server-dev', value: 'sap-ev-odata-server-dev' },
  { key: 'sap-ev-odata-server-prod', value: 'sap-ev-odata-server-prod' },
  { key: 'sap-ev-odata-server-qa', value: 'sap-ev-odata-server-qa' },
  { key: 'sap-ev-rest-server-dev', value: 'sap-ev-rest-server-dev' },
  { key: 'sap-ev-rest-server-prod', value: 'sap-ev-rest-server-prod' },
  { key: 'sap-ev-rest-server-qa', value: 'sap-ev-rest-server-qa' },
  { key: 'sap-ev-fake-rest-server-dev', value: 'sap-ev-fake-rest-server-dev' },
].sort((host1, host2) => {
  if (host1.value.toLocaleLowerCase() < host2.value.toLocaleLowerCase()) {
    return -1;
  }
  if (host1.value.toLocaleLowerCase() > host2.value.toLocaleLowerCase()) {
    return 1;
  }
  return 0;
});
