import { Component, Injectable, Input, Pipe, PipeTransform } from '@angular/core';
import { AppChargingStationsFormatConnectorPipe } from 'pages/charging-stations/cell-components/charging-stations-connector-cell.component';
import { CellContentTemplateDirective } from 'shared/table/cell-content-template/cell-content-template.directive';
import { Connector } from 'types/ChargingStation';

@Component({
  selector: 'app-reservations-connector-cell',
  templateUrl: 'reservations-connector-cell.component.html',
  styleUrls: ['reservations-connector-cell.component.scss'],
})
@Injectable()
export class ReservationsConnectorCellComponent extends CellContentTemplateDirective {
  @Input() public row!: Connector;
}

@Pipe({ name: 'appReservationsFormatConnector' })
export class AppReservationsFormatConnectorPipe
  extends AppChargingStationsFormatConnectorPipe
  implements PipeTransform {}
