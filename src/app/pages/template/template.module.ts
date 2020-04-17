import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'app/app.module';
import { ComponentModule } from 'app/shared/component/component.module';
import { DialogsModule } from 'app/shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from 'app/shared/directives/directives.module';
import { FormattersModule } from 'app/shared/formatters/formatters.module';
import { TableModule } from 'app/shared/table/table.module';
import { ButtonsTemplateComponent } from './buttons/buttons-template.component';
import { ColorsTemplateComponent } from './colors/colors-template.component';
import { DialogsTemplateComponent } from './dialogs/dialogs-template.component';
import { FormsTemplateComponent } from './forms/forms-template.component';
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
    FormsTemplateComponent,
    DialogsTemplateComponent,
  ],
  entryComponents: [
    ButtonsTemplateComponent,
    ColorsTemplateComponent,
    FormsTemplateComponent,
    DialogsTemplateComponent,
  ],
  providers: [],
})
export class TemplateModule {
}
