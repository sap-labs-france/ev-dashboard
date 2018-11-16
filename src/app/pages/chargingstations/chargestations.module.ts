import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import { MaterialModule } from '../../app.module';
import { ChargeStationsComponent } from './chargestations.component';
import { ChargeStationsRoutes } from './chargestations.routing';
import { TableModule } from '../../shared/table/table.module';
import { CommonDirectivesModule } from '../../shared/directives/common-directives.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
//import { ConnectorsModule } from '../connectors/connectors.module';
import { HertbeatCellComponent } from "./cellContentComponents/heartbeatCell.component";
import { ConsumptionProgressBarComponent } from "./cellContentComponents/consumption-progress-bar.component";
import { ConnectorsDetailComponent } from "./detailsContentComponent/connectorsDetailComponent.component";
import { SimpleTableComponent } from "../../shared/table/simpleTable/simpleTable.component";
import { ConnectorAvailibilityComponent } from "./detailsContentComponent/connectorAvailibility.component";
import { SimpleTableModule } from "../../shared/table/simpleTable/simpleTable.module";

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ChargeStationsRoutes),
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        MaterialModule,
        TableModule,
        CommonDirectivesModule,
        DialogsModule,
        MatProgressBarModule,
        SimpleTableModule
    ],
    entryComponents: [ 
        HertbeatCellComponent,
        ConsumptionProgressBarComponent, 
        ConnectorsDetailComponent, 
        ConnectorAvailibilityComponent ],
    declarations: [
        ChargeStationsComponent,
        HertbeatCellComponent,
        ConsumptionProgressBarComponent,
        ConnectorsDetailComponent,
        ConnectorAvailibilityComponent
    ]
})

export class ChargeStationsModule {}
