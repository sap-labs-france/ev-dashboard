import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'appConnectorErrorCode' })
export class AppConnectorErrorCodePipe implements PipeTransform {
  private connectorErrorCodeMap: any = {
    // NoError: 'chargers.status_error_none',
    ConnectorLockFailure: 'chargers.status_error_connector_lock_failure',
    EVCommunicationError: 'chargers.status_error_ev_communication_error',
    GroundFailure: 'chargers.status_error_ground_failure',
    HighTemperature: 'chargers.status_error_high_temperature',
    InternalError: 'chargers.status_error_internal_error',
    LocalListConflict: 'chargers.status_error_local_list_conflict',
    OtherError: 'chargers.status_error_other_error',
    OverCurrentFailure: 'chargers.status_error_over_current_failure',
    PowerMeterFailure: 'chargers.status_error_power_meter_failure',
    PowerSwitchFailure: 'chargers.status_error_power_switch_failure',
    ReaderFailure: 'chargers.status_error_reader_failure',
    ResetFailure: 'chargers.status_error_reset_failure',
    UnderVoltage: 'chargers.status_error_under_voltage',
    OverVoltage: 'chargers.status_error_over_voltage',
    WeakSignal: 'chargers.status_error_weak_signal',
  };

  // eslint-disable-next-line no-useless-constructor
  public constructor(private translateService: TranslateService) {}

  public transform(errorCode: string): string {
    return this.connectorErrorCodeMap[errorCode]
      ? this.translateService.instant(this.connectorErrorCodeMap[errorCode])
      : '';
  }
}
