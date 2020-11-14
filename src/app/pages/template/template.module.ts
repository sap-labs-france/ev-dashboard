import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { ComponentModule } from '../../shared/component/component.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/directives.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../../shared/table/table.module';
import { ButtonsTemplateComponent } from './buttons/buttons-template.component';
import { ColorsTemplateComponent } from './colors/colors-template.component';
import { TemplateComponent } from './template.component';
import { TemplateRoutes } from './template.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(TemplateRoutes),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    CommonDirectivesModule,
    DialogsModule,
    FormattersModule,
    ComponentModule,
  ],
  declarations: [
    TemplateComponent,
    ButtonsTemplateComponent,
    ColorsTemplateComponent,
  ],
  entryComponents: [
    ButtonsTemplateComponent,
    ColorsTemplateComponent,
  ],
  providers: [],
})
export class TemplateModule {
}
