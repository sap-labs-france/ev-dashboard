import { Component, Input, OnInit } from '@angular/core';
import { ChargingStationsAuthorizations } from 'types/Authorization';

import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';
import { ChargingStation, ChargingStationCapabilities } from '../../../../types/ChargingStation';
import { KeyValue } from '../../../../types/GlobalType';
import { Utils } from '../../../../utils/Utils';

export interface PropertyDisplay {
  key: string;
  title: string;
  value?: string;
  formatter?: (value: any) => string | null;
}

@Component({
  selector: 'app-charging-station-properties',
  templateUrl: 'charging-station-properties.component.html',
})
// @Injectable()
export class ChargingStationPropertiesComponent implements OnInit {
  @Input() public chargingStation!: ChargingStation;
  @Input() public chargingStationsAuthorizations: ChargingStationsAuthorizations;

  public chargerFormatted: any = {};
  public displayedProperties: PropertyDisplay[] = [
    { key: 'chargePointVendor', title: 'chargers.vendor' },
    { key: 'chargePointModel', title: 'chargers.model' },
    { key: 'chargeBoxSerialNumber', title: 'chargers.serial_number' },
    { key: 'firmwareVersion', title: 'chargers.firmware_version' },
    { key: 'endpoint', title: 'chargers.private_url' },
    { key: 'chargingStationURL', title: 'chargers.public_url' },
    { key: 'currentIPAddress', title: 'chargers.current_ip' },
    { key: 'ocppVersion', title: 'chargers.ocpp_version' },
    { key: 'ocppProtocol', title: 'chargers.ocpp_protocol' },
    {
      key: 'lastReboot',
      title: 'chargers.last_reboot',
      formatter: (lastReboot: Date) => this.datePipe.transform(lastReboot),
    },
    {
      key: 'createdOn',
      title: 'chargers.created_on',
      formatter: (createdOn: Date) => this.datePipe.transform(createdOn),
    },
    {
      key: 'capabilities',
      title: 'chargers.capabilities',
      formatter: (capabilities: ChargingStationCapabilities) => {
        if (capabilities) {
          const formatterValues: string[] = [];
          for (const key in capabilities) {
            if (Utils.objectHasProperty(capabilities, key)) {
              formatterValues.push(`${key}: ${capabilities[key]}`);
            }
          }
          return formatterValues.join(', ');
        }
        return '';
      },
    },
    {
      key: 'ocppStandardParameters',
      title: 'chargers.ocpp_standard_params',
      formatter: (ocppStandardParameters: KeyValue[]) => {
        if (ocppStandardParameters) {
          const formatterValues: string[] = [];
          for (const ocppStandardParameter of ocppStandardParameters) {
            formatterValues.push(`${ocppStandardParameter.key}: ${ocppStandardParameter.value}`);
          }
          return formatterValues.join(', ');
        }
        return '';
      },
    },
    {
      key: 'ocppVendorParameters',
      title: 'chargers.ocpp_vendor_params',
      formatter: (ocppVendorParameters: KeyValue[]) => {
        if (ocppVendorParameters) {
          const formatterValues: string[] = [];
          for (const ocppVendorParameter of ocppVendorParameters) {
            formatterValues.push(`${ocppVendorParameter.key}: ${ocppVendorParameter.value}`);
          }
          return formatterValues.join(', ');
        }
        return '';
      },
    },
  ];

  public displayedColumns: string[] = ['title', 'value'];

  // eslint-disable-next-line no-useless-constructor
  public constructor(private datePipe: AppDatePipe) {}

  public ngOnInit(): void {
    // Format
    for (const property of this.displayedProperties) {
      if (property.formatter) {
        property['value'] = property.formatter(this.chargingStation[property.key]);
      } else {
        property['value'] = this.chargingStation[property.key];
      }
    }
  }
}
