import {KeyValue} from '../../common.types';

export const logLevels: KeyValue[] = [
  {key: 'E', value: 'logs.error'},
  {key: 'W', value: 'logs.warning'},
  {key: 'I', value: 'logs.info'},
  {key: 'D', value: 'logs.debug'}
];

export const logActions: KeyValue[] = [
  {key: 'Authorize', value: 'Authorize'},
  {key: 'BuildConsumption', value: 'BuildConsumption'},
  {key: 'BootNotification', value: 'BootNotification'},
  {key: 'ChargingStationConfiguration', value: 'ChargingStationConfiguration'},
  {key: 'ChargingStationConsumption', value: 'ChargingStationConsumption'},
  {key: 'ChargingStationDelete', value: 'ChargingStationDelete'},
  {key: 'ChargingStationRequestConfiguration', value: 'ChargingStationRequestConfiguration'},
  {key: 'ChargingStationUpdateParams', value: 'ChargingStationUpdateParams'},
  {key: 'ClearCache', value: 'ClearCache'},
  {key: 'ClearChargingProfile', value: 'ClearChargingProfile'},
  {key: 'DataTransfer', value: 'DataTransfer'},
  {key: 'Heartbeat', value: 'Heartbeat'},
  {key: 'GetCompositeSchedule', value: 'GetCompositeSchedule'},
  {key: 'GetConfiguration', value: 'GetConfiguration'},
  {key: 'Initialization', value: 'Initialization'},
  {key: 'Login', value: 'Login'},
  {key: 'LogsCleanup', value: 'LogsCleanup'},
  {key: 'MeterValues', value: 'MeterValues'},
  {key: 'Migration', value: 'Migration'},
  {key: 'NotifyChargingStationStatusError', value: 'NotifyChargingStationStatusError'},
  {key: 'NotifyChargingStationRegistered', value: 'NotifyChargingStationRegistered'},
  {key: 'NotifyEndOfCharge', value: 'NotifyEndOfCharge'},
  {key: 'NotifyEndOfSession', value: 'NotifyEndOfSession'},
  {key: 'NotifyNewPassword', value: 'NotifyNewPassword'},
  {key: 'NotifyNewRegisteredUser', value: 'NotifyNewRegisteredUser'},
  {key: 'NotifyRequestPassword', value: 'NotifyRequestPassword'},
  {key: 'NotifyTransactionStarted', value: 'NotifyTransactionStarted'},
  {key: 'NotifyUnknownUserBadged', value: 'NotifyUnknownUserBadged'},
  {key: 'NotifyUserAccountStatusChanged', value: 'NotifyUserAccountStatusChanged'},
  {key: 'OCPIPatchLocations', value: 'OCPIPatchLocations'},
  {key: 'PricingUpdate', value: 'PricingUpdate'},
  {key: 'RegisterUser', value: 'RegisterUser'},
  {key: 'VerifyEmail', value: 'VerifyEmail'},
  {key: 'ResendVerificationEmail', value: 'ResendVerificationEmail'},
  {key: 'RemoteStartTransaction', value: 'RemoteStartTransaction'},
  {key: 'RemoteStopTransaction', value: 'RemoteStopTransaction'},
  {key: 'RequestConfiguration', value: 'RequestConfiguration'},
  {key: 'Reset', value: 'Reset'},
  {key: 'SendEmail', value: 'SendEmail'},
  {key: 'SendEVSEStatuses', value: 'SendEVSEStatuses'},
  {key: 'SetChargingProfile', value: 'SetChargingProfile'},
  {key: 'SiteAreaCreate', value: 'SiteAreaCreate'},
  {key: 'SiteAreaDelete', value: 'SiteAreaDelete'},
  {key: 'SiteAreaUpdate', value: 'SiteAreaUpdate'},
  {key: 'SiteDelete', value: 'SiteDelete'},
  {key: 'SiteUpdate', value: 'SiteUpdate'},
  {key: 'StartTransaction', value: 'StartTransaction'},
  {key: 'Startup', value: 'Startup'},
  {key: 'StatusNotification', value: 'StatusNotification'},
  {key: 'StopTransaction', value: 'StopTransaction'},
  {key: 'TransactionDelete', value: 'TransactionDelete'},
  {key: 'TransactionSoftStop', value: 'TransactionSoftStop'},
  {key: 'UserCreate', value: 'UserCreate'},
  {key: 'UserDelete', value: 'UserDelete'},
  {key: 'UserUpdate', value: 'UserUpdate'}
].sort((action1, action2) => {
  if (action1.value.toLocaleLowerCase() < action2.value.toLocaleLowerCase()) {
    return -1;
  } else if (action1.value.toLocaleLowerCase() > action2.value.toLocaleLowerCase()) {
    return 1;
  } else {
    return 0;
  }
});
