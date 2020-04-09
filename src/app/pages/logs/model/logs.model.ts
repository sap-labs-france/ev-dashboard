import { KeyValue } from 'app/types/GlobalType';

export const logLevels: KeyValue[] = [
  {key: 'E', value: 'logs.error'},
  {key: 'W', value: 'logs.warning'},
  {key: 'I', value: 'logs.info'},
  {key: 'D', value: 'logs.debug'},
];

export const logActions: KeyValue[] = [
  {key: 'Authorize', value: 'Authorize'},
  {key: 'BuildConsumption', value: 'BuildConsumption'},
  {key: 'BootNotification', value: 'BootNotification'},
  {key: 'ChargingStationOcppParameters', value: 'ChargingStationOcppParameters'},
  {key: 'ChargingStationDelete', value: 'ChargingStationDelete'},
  {key: 'ChargingStationRequestOcppParameters', value: 'ChargingStationRequestOcppParameters'},
  {key: 'ChargingStationUpdateParams', value: 'ChargingStationUpdateParams'},
  {key: 'ClearCache', value: 'ClearCache'},
  {key: 'ChargingProfileDelete', value: 'ChargingProfileDelete'},
  {key: 'DataTransfer', value: 'DataTransfer'},
  {key: 'Heartbeat', value: 'Heartbeat'},
  {key: 'GetCompositeSchedule', value: 'GetCompositeSchedule'},
  {key: 'GetConfiguration', value: 'GetConfiguration'},
  {key: 'Initialization', value: 'Initialization'},
  {key: 'Login', value: 'Login'},
  {key: 'FirmwareDownload', value: 'FirmwareDownload'},
  {key: 'LogsCleanup', value: 'LogsCleanup'},
  {key: 'MeterValues', value: 'MeterValues'},
  {key: 'Migration', value: 'Migration'},
  {key: 'ChargingStationStatusError', value: 'ChargingStationStatusError'},
  {key: 'ChargingStationRegistered', value: 'ChargingStationRegistered'},
  {key: 'EndOfCharge', value: 'EndOfCharge'},
  {key: 'EndOfSession', value: 'EndOfSession'},
  {key: 'NewPassword', value: 'NewPassword'},
  {key: 'NewRegisteredUser', value: 'NewRegisteredUser'},
  {key: 'RequestPassword', value: 'RequestPassword'},
  {key: 'TransactionStarted', value: 'TransactionStarted'},
  {key: 'UnknownUserBadged', value: 'UnknownUserBadged'},
  {key: 'UserAccountStatusChanged', value: 'UserAccountStatusChanged'},
  {key: 'SessionNotStartedAfterAuthorize', value: 'SessionNotStartedAfterAuthorize'},
  {key: 'CarSynchronizationFailed', value: 'CarSynchronizationFailed'},
  {key: 'OCPIEndpoint', value: 'OCPIEndpoint'},
  {key: 'OCPIEndpoints', value: 'OCPIEndpoints'},
  {key: 'OCPIAuthorizeToken', value: 'OCPIAuthorizeToken'},
  {key: 'OCPIGetLocations', value: 'OCPIGetLocations'},
  {key: 'OCPIPatchLocations', value: 'OCPIPatchLocations'},
  {key: 'OCPIPushTokens', value: 'OCPIPushTokens'},
  {key: 'OCPIPushSessions', value: 'OCPIPushSessions'},
  {key: 'OCPIPushCdrs', value: 'OCPIPushCdrs'},
  {key: 'OCPIPullCdrs', value: 'OCPIPullCdrs'},
  {key: 'OCPIPullLocations', value: 'OCPIPullLocations'},
  {key: 'OCPIPullSessions', value: 'OCPIPullSessions'},
  {key: 'OCPIPullTokens', value: 'OCPIPullTokens'},
  {key: 'OCPIGetVersions', value: 'OCPIGetVersions'},
  {key: 'OCPIDeleteCredentials', value: 'OCPIDeleteCredentials'},
  {key: 'OCPIPatchStatus', value: 'OCPIPatchStatus'},
  {key: 'OCPIRegister', value: 'OCPIRegister'},
  {key: 'PricingUpdate', value: 'PricingUpdate'},
  {key: 'RegisterUser', value: 'RegisterUser'},
  {key: 'VerifyEmail', value: 'VerifyEmail'},
  {key: 'ResendVerificationEmail', value: 'ResendVerificationEmail'},
  {key: 'RemoteStartTransaction', value: 'RemoteStartTransaction'},
  {key: 'RemoteStopTransaction', value: 'RemoteStopTransaction'},
  {key: 'RequestConfiguration', value: 'RequestConfiguration'},
  {key: 'TransactionsInError', value: 'TransactionsInError'},
  {key: 'Reset', value: 'Reset'},
  {key: 'EmailNotification', value: 'EmailNotification'},
  {key: 'ChargingProfileUpdate', value: 'ChargingProfileUpdate'},
  {key: 'SessionHashHandling', value: 'SessionHashHandling'},
  {key: 'SiteAreaCreate', value: 'SiteAreaCreate'},
  {key: 'SiteAreaDelete', value: 'SiteAreaDelete'},
  {key: 'SiteAreaUpdate', value: 'SiteAreaUpdate'},
  {key: 'SiteDelete', value: 'SiteDelete'},
  {key: 'SiteUpdate', value: 'SiteUpdate'},
  {key: 'StartTransaction', value: 'StartTransaction'},
  {key: 'Startup', value: 'Startup'},
  {key: 'Locking', value: 'Locking'},
  {key: 'StatusNotification', value: 'StatusNotification'},
  {key: 'StopTransaction', value: 'StopTransaction'},
  {key: 'TransactionDelete', value: 'TransactionDelete'},
  {key: 'TransactionSoftStop', value: 'TransactionSoftStop'},
  {key: 'UserCreate', value: 'UserCreate'},
  {key: 'UserDelete', value: 'UserDelete'},
  {key: 'WSRestClientConnectionOpened', value: 'WSRestClientConnectionOpened'},
  {key: 'WSRestClientConnectionClosed', value: 'WSRestClientConnectionClosed'},
  {key: 'WSRestClientMessage', value: 'WSRestClientMessage'},
  {key: 'WSRestClientErrorResponse', value: 'WSRestClientErrorResponse'},
  {key: 'WSRestClientSendMessage', value: 'WSRestClientSendMessage'},
  {key: 'WSClientError', value: 'WSClientError'},
  {key: 'GenericOCPPCommand', value: 'GenericOCPPCommand'},
  {key: 'GetAccessToken', value: 'GetAccessToken'},
  {key: 'Refund', value: 'Refund'},
  {key: 'RefundSynchronize', value: 'RefundSynchronize'},
  {key: 'HttpRequestLog', value: 'HttpRequestLog'},
  {key: 'WSVerifyClient', value: 'WSVerifyClient'},
  {key: 'WSRestServerConnectionOpened', value: 'WSRestServerConnectionOpened'},
  {key: 'WSRestServerConnectionClosed', value: 'WSRestServerConnectionClosed'},
  {key: 'WSRestServerConnectionError', value: 'WSRestServerConnectionError'},
  {key: 'WSJsonConnectionOpened', value: 'WSJsonConnectionOpened'},
  {key: 'WSJsonErrorReceived', value: 'WSJsonErrorReceived'},
  {key: 'WSJsonConnectionClosed', value: 'WSJsonConnectionClosed'},
  {key: 'WSError', value: 'WSError'},
  {key: 'StrongSoapDebug', value: 'StrongSoapDebug'},
  {key: 'SecurePing', value: 'SecurePing'},
  {key: 'UserUpdate', value: 'UserUpdate'},
  {key: 'SettingUpdate', value: 'SettingUpdate'},
  {key: 'UpdateChargingStationTemplates', value: 'UpdateChargingStationTemplates'},
  {key: 'SchedulerManager', value: 'SchedulerManager'},
  {key: 'SiteUserAdmin', value: 'SiteUserAdmin'},
  {key: 'RegistrationTokens', value: 'RegistrationTokens'},
  {key: 'RegistrationTokenRevoke', value: 'RegistrationTokenRevoke'},
  {key: 'AllTransactions', value: 'AllTransactions'},
  {key: 'CompanyLogos', value: 'CompanyLogos'},
  {key: 'CompanyUpdate', value: 'CompanyUpdate'},
  {key: 'BuildingImages', value: 'BuildingImages'},
  {key: 'BuildingUpdate', value: 'BuildingUpdate'},
  {key: 'AddSitesToUser', value: 'AddSitesToUser'},
  {key: 'SessionHashService', value: 'SessionHashService'},
  {key: 'Consumption', value: 'Consumption'},
  {key: 'VerificationEmail', value: 'VerificationEmail'},
  {key: 'AuthentificationErrorEmailServer', value: 'AuthentificationErrorEmailServer'},
  {key: 'PatchEVSEStatusError', value: 'PatchEVSEStatusError'},
  {key: 'UserAccountInactivity', value: 'UserAccountInactivity'},
  {key: 'PreparingSessionNotStarted', value: 'PreparingSessionNotStarted'},
  {key: 'OfflineChargingStations', value: 'OfflineChargingStations'},
  {key: 'BillingUserSynchronizationFailed', value: 'BillingUserSynchronizationFailed'},
  {key: 'RemoveSitesFromUser', value: 'RemoveSitesFromUser'},
  {key: 'UserImage', value: 'UserImage'},
  {key: 'Logging', value: 'Logging'},
  {key: 'GetConnectorCurrentLimit', value: 'GetConnectorCurrentLimit'},
  {key: 'ChargingStation', value: 'ChargingStation'},
  {key: 'ChangeConfiguration', value: 'ChangeConfiguration'},
  {key: 'Transaction', value: 'Transaction'},
  {key: 'GetDiagnostics', value: 'GetDiagnostics'},
  {key: 'IntegrationConnections', value: 'IntegrationConnections'},
  {key: 'Settings', value: 'Settings'},
  {key: 'ChargingStationTemplate', value: 'ChargingStationTemplate'},
  {key: 'RemotePushNotification', value: 'RemotePushNotification'},
  {key: 'CleanupTransaction', value: 'CleanupTransaction'},
  {key: 'TransactionsCompleted', value: 'TransactionsCompleted'},
  {key: 'ChargingStationLimitPower', value: 'ChargingStationLimitPower'},
  {key: 'UpdateUserMobileToken', value: 'UpdateUserMobileToken'},
  {key: 'OptimalChargeReached', value: 'OptimalChargeReached'},
  {key: 'ExtraInactivity', value: 'ExtraInactivity'},
  {key: 'SynchronizeCars', value: 'SynchronizeCars'},
  {key: 'BillingSynchronizeUsers', value: 'BillingSynchronizeUsers'},
  {key: 'BillingForceSynchronizeUser', value: 'BillingForceSynchronizeUser'},
  {key: 'BillingCheckConnection', value: 'BillingCheckConnection'},
  {key: 'BillingSendInvoice', value: 'BillingSendInvoice'},
  {key: 'BillingGetOpenedInvoice', value: 'BillingGetOpenedInvoice'},
  {key: 'BillingCreateInvoice', value: 'BillingCreateInvoice'},
  {key: 'BillingCreateInvoiceItem', value: 'BillingCreateInvoiceItem'},
  {key: 'SAPSmartCharging', value: 'SAPSmartCharging'},
  {key: 'CheckAndApplySmartCharging', value: 'CheckAndApplySmartCharging'},
].sort((action1, action2) => {
  if (action1.value.toLocaleLowerCase() < action2.value.toLocaleLowerCase()) {
    return -1;
  }
  if (action1.value.toLocaleLowerCase() > action2.value.toLocaleLowerCase()) {
    return 1;
  }
  return 0;
});

export const logHosts: KeyValue[] = [
  {key: 'sap-ev-batch-server-dev', value: 'sap-ev-batch-server-dev'},
  {key: 'sap-ev-batch-server-prod', value: 'sap-ev-batch-server-prod'},
  {key: 'sap-ev-batch-server-server-qa', value: 'sap-ev-batch-server-qa'},
  {key: 'sap-ev-chargebox-json-server-dev', value: 'sap-ev-chargebox-json-server-dev'},
  {key: 'sap-ev-chargebox-json-server-prod', value: 'sap-ev-chargebox-json-server-prod'},
  {key: 'sap-ev-chargebox-json-server-qa', value: 'sap-ev-chargebox-json-server-qa'},
  {key: 'sap-ev-chargebox-soap-server-dev', value: 'sap-ev-chargebox-soap-server-dev'},
  {key: 'sap-ev-chargebox-soap-server-prod', value: 'sap-ev-chargebox-soap-server-prod'},
  {key: 'sap-ev-chargebox-soap-server-qa', value: 'sap-ev-chargebox-soap-server-qa'},
  {key: 'sap-ev-front-end-dev', value: 'sap-ev-front-end-dev'},
  {key: 'sap-ev-front-end-prod', value: 'sap-ev-front-end-prod'},
  {key: 'sap-ev-front-end-qa', value: 'sap-ev-front-end-qa'},
  {key: 'sap-ev-ocpi-server-dev', value: 'sap-ev-ocpi-server-dev'},
  {key: 'sap-ev-ocpi-server-prod', value: 'sap-ev-ocpi-server-prod'},
  {key: 'sap-ev-ocpi-server-qa', value: 'sap-ev-ocpi-server-qa'},
  {key: 'sap-ev-odata-server-dev', value: 'sap-ev-odata-server-dev'},
  {key: 'sap-ev-odata-server-prod', value: 'sap-ev-odata-server-prod'},
  {key: 'sap-ev-odata-server-qa', value: 'sap-ev-odata-server-qa'},
  {key: 'sap-ev-rest-server-dev', value: 'sap-ev-rest-server-dev'},
  {key: 'sap-ev-rest-server-prod', value: 'sap-ev-rest-server-prod'},
  {key: 'sap-ev-rest-server-qa', value: 'sap-ev-rest-server-qa'},
  {key: 'sap-ev-fake-rest-server-dev', value: 'sap-ev-fake-rest-server-dev'},
].sort((host1, host2) => {
  if (host1.value.toLocaleLowerCase() < host2.value.toLocaleLowerCase()) {
    return -1;
  }
  if (host1.value.toLocaleLowerCase() > host2.value.toLocaleLowerCase()) {
    return 1;
  }
  return 0;
});
