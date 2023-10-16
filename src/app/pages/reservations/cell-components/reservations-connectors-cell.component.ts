import { Component, Input } from '@angular/core';
import { CellContentTemplateDirective } from 'shared/table/cell-content-template/cell-content-template.directive';
import { Reservation } from 'types/Reservation';

@Component({
  template: `
    <div class="d-flex justify-content-center">
      <ng-container *ngIf="row['connectorID'] > 0">
        <app-reservations-connector-cell
          [row]="row['chargingStation'].connectors[row.connectorID - 1]"
        ></app-reservations-connector-cell>
      </ng-container>
    </div>
  `,
})
export class ReservationsConnectorsCellComponent extends CellContentTemplateDirective {
  @Input() public row!: Reservation;
}
