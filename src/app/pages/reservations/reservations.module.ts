import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'app.module';
import { TableModule } from 'shared/table/table.module';
import { CommonDirectivesModule } from 'shared/directives/directives.module';
import { DialogsModule } from 'shared/dialogs/dialogs.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormattersModule } from 'shared/formatters/formatters.module';
import { ComponentModule } from 'shared/component/component.module';
import { MomentModule } from 'ngx-moment';
import { ReservationsComponent } from './reservations.component';
import { ReservationsListComponent } from './list/reservations-list.component';
import { ReservationsListTableDataSource } from './list/reservations-list-table-data-source';
import { ReservationComponent } from './reservation/reservation.component';
import { ReservationPropertiesComponent } from './reservation/properties/reservation-properties.component';
import { ReservationDialogComponent } from './reservation/reservation-dialog.component';
import { ReservationMainComponent } from './reservation/main/reservation-main.component';
import { ReservationsConnectorsCellComponent } from './cell-components/reservations-connectors-cell.component';
import {
  AppReservationsFormatConnectorPipe,
  ReservationsConnectorCellComponent,
} from './cell-components/reservations-connector-cell.component';
import {
  AppReservationsFormatStatusPipe,
  ReservationStatusFormatterCellComponent,
} from './cell-components/reservations-status-cell.component';
import {
  AppReservationsFormatTypePipe,
  ReservationsTypeFormatterCellComponent,
} from './cell-components/reservations-type-cell.component';
import { ReservationsRoutes } from './reservations.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ReservationsRoutes),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    CommonDirectivesModule,
    DialogsModule,
    MatProgressBarModule,
    FormattersModule,
    ComponentModule,
    MomentModule,
  ],
  declarations: [
    ReservationsComponent,
    ReservationsListComponent,
    ReservationComponent,
    ReservationDialogComponent,
    ReservationPropertiesComponent,
    ReservationMainComponent,
    ReservationsConnectorsCellComponent,
    ReservationsConnectorCellComponent,
    AppReservationsFormatConnectorPipe,
    ReservationStatusFormatterCellComponent,
    AppReservationsFormatStatusPipe,
    ReservationsTypeFormatterCellComponent,
    AppReservationsFormatTypePipe,
  ],
  providers: [ReservationsListTableDataSource],
})
export class ReservationsModule {}
