import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import { MaterialModule } from 'app/app.module';
import { CommonDirectivesModule } from 'app/shared/directives/common-directives.module';
import { DialogsModule } from 'app/shared/dialogs/dialogs.module';
import { TableModule } from 'app/shared/table/table.module';
import { ComponentModule } from 'app/shared/component/component.module';
import { FormattersModule } from 'app/shared/formatters/formatters.module';
import { TemplateComponent } from './template.component';
import {TemplateRoutes} from './template.routing';
import {ButtonsTemplateComponent} from './buttons/buttons.component';
import {ColorsTemplateComponent} from './colors/colors.component';
import { FormsTemplateComponent } from './forms/forms.component';
import { DialogsTemplateComponent } from './dialogs/dialogs.component';

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
  providers: []
})
export class TemplateModule {
}
