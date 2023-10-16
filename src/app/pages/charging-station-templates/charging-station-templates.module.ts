import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/directives.module';
import { TableModule } from '../../shared/table/table.module';
import { ChargingStationTemplateDialogComponent } from './charging-station-template/charging-station-template-dialog.component';
import { ChargingStationTemplateComponent } from './charging-station-template/charging-station-template.component';
import { ChargingStationTemplateMainComponent } from './charging-station-template/main/charging-station-template-main.component';
import { ChargingStationTemplatesComponent } from './charging-station-templates.component';
import { ChargingStationTemplatesRoutes } from './charging-station-templates.routing';
import { ChargingStationTemplatesListComponent } from './list/charging-station-template-list.component';

@NgModule({
  declarations: [
    ChargingStationTemplatesComponent,
    ChargingStationTemplateComponent,
    ChargingStationTemplateDialogComponent,
    ChargingStationTemplatesListComponent,
    ChargingStationTemplateMainComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ChargingStationTemplatesRoutes),
    TranslateModule,
    MaterialModule,
    DialogsModule,
    CommonDirectivesModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  entryComponents: [
    ChargingStationTemplatesComponent,
    ChargingStationTemplateComponent,
    ChargingStationTemplateDialogComponent,
    ChargingStationTemplatesListComponent,
    ChargingStationTemplateMainComponent,
  ],
})
export class ChargingStationTemplatesModule {}
