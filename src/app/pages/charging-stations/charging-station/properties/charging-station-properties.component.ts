import { Component, Injectable, Input, OnInit } from '@angular/core';
import { Charger } from '../../../../common.types';
import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';

export interface PropertyDisplay {
  key: string;
  title: string;
  value?: string;
  formatter?: Function;
}

@Component({
  selector: 'app-charging-station-properties',
  templateUrl: './charging-station-properties.component.html',
})
@Injectable()
export class ChargingStationPropertiesComponent implements OnInit {
  @Input() charger: Charger;
  chargerFormatted: any = {};
  displayedProperties: PropertyDisplay[] = [
    {key: 'chargePointVendor', title: 'chargers.vendor'},
    {key: 'chargePointModel', title: 'chargers.model'},
    {key: 'chargeBoxSerialNumber', title: 'chargers.serial_number'},
    {key: 'firmwareVersion', title: 'chargers.firmware_version'},
    {key: 'endpoint', title: 'chargers.private_url'},
    {key: 'chargingStationURL', title: 'chargers.public_url'},
    {key: 'currentIPAddress', title: 'chargers.current_ip'},
    {key: 'ocppVersion', title: 'chargers.ocpp_version'},
    {
      key: 'lastReboot', title: 'chargers.last_reboot', formatter: (value) => {
        return this.datePipe.transform(value);
      },
    },
    {
      key: 'createdOn', title: 'chargers.created_on', formatter: (value) => {
        return this.datePipe.transform(value);
      },
    },
  ];

  displayedColumns: string[] = ['title', 'value'];

  constructor(private datePipe: AppDatePipe) {
  }

  ngOnInit(): void {
    // Format
    for (const property of this.displayedProperties) {
      if (property.formatter) {
        property['value'] = property.formatter(this.charger[property.key]);
      } else {
        property['value'] = this.charger[property.key];
      }
    }
  }
}
