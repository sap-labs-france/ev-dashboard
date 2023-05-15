import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { PropertyDisplay } from 'pages/charging-stations/charging-station/properties/charging-station-properties.component';
import { AppDatePipe } from 'shared/formatters/app-date.pipe';
import { ReservationsAuthorizations } from 'types/Authorization';
import { Reservation } from 'types/Reservation';
import { Utils } from 'utils/Utils';

@Component({
  selector: 'app-reservation-properties',
  templateUrl: 'reservation-properties.component.html',
  styleUrls: ['reservation-properties.component.scss'],
})
export class ReservationPropertiesComponent implements OnInit {
  @Input() public reservation!: Reservation;
  @Input() public reservationsAuthorizations: ReservationsAuthorizations;

  public reservationFormatted = {};

  public displayedProperties: PropertyDisplay[] = [
    { key: 'id', title: 'reservations.id' },
    {
      key: 'createdOn',
      title: 'reservations.created_on',
      formatter: (created_on: Date) => this.datePipe.transform(created_on, 'E, d  MMMM y, HH:mm'),
    },
    { key: 'chargingStationId', title: 'reservations.chargingstation_id' },
    {
      key: 'connectorId',
      title: 'reservations.connector_id',
      formatter: (connectorId: number) =>
        connectorId === 0 ? '0' : Utils.getConnectorLetterFromConnectorID(connectorId),
    },
    {
      key: 'expiryDate',
      title: 'reservations.expiry_date',
      formatter: (created_on: Date) => this.datePipe.transform(created_on, 'E, d  MMMM y, HH:mm'),
    },
    { key: 'tagId', title: 'reservations.tag_id' },
    { key: 'status', title: 'reservations.status' },
    { key: 'type', title: 'reservations.type' },
  ];

  public displayedColumns: string[] = ['title', 'value'];

  // eslint-disable-next-line no-useless-constructor
  public constructor(private datePipe: AppDatePipe) {}

  public ngOnInit(): void {
    for (const property of this.displayedProperties) {
      if (property.formatter) {
        property.value = property.formatter(this.reservation[property.key]);
      } else {
        property.value = this.reservation[property.key];
      }
    }
  }
}
