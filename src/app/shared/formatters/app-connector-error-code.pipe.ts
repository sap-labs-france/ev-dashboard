import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

const connectorErrorCodeMap = {
  'ConnectorLockFailure': 'chargers.status_error_connector_lock_failure',
  'EVCommunicationError': 'chargers.status_error_ev_communication_error',
  'GroundFailure': 'chargers.status_error_ground_failure',
  'HighTemperature': 'chargers.status_error_high_temperature',
  'InternalError': 'chargers.status_error_internal_error',
  'LocalListConflict': 'chargers.status_error_local_list_conflict',
  'NoError': 'chargers.status_error_none',
  'OtherError': 'chargers.status_error_other_error',
  'OverCurrentFailure': 'chargers.status_error_over_current_failure',
  'PowerMeterFailure': 'chargers.status_error_power_meter_failure',
  'PowerSwitchFailure': 'chargers.status_error_power_switch_failure',
  'ReaderFailure': 'chargers.status_error_reader_failure',
  'ResetFailure': 'chargers.status_error_reset_failure',
  'UnderVoltage': 'chargers.status_error_under_voltage',
  'OverVoltage': 'chargers.status_error_over_voltage',
  'WeakSignal': 'chargers.status_error_weak_signal'
}

@Pipe({name: 'appConnectorErrorCode'})
export class AppConnectorErrorCodePipe implements PipeTransform {
  constructor(private translateService: TranslateService) {
  }

  transform(errocode: string): any {
    return (connectorErrorCodeMap[errocode] ?
      this.translateService.instant(connectorErrorCodeMap[errocode]) :
      this.translateService.instant('chargers.status_error_unknown'));
  }
}
