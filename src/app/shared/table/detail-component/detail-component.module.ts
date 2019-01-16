export class FooterModule {}
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../app.module';
import { TranslateModule } from '@ngx-translate/core';
import { DetailComponentContainer } from '../detail-component/detail-component-container.component';
import { DetailComponentDirective } from '../detail-component/detail-component.directive';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    MaterialModule,
    TranslateModule
  ],
  declarations: [
    DetailComponentDirective,
    DetailComponentContainer
  ],
  exports: [
    DetailComponentDirective,
    DetailComponentContainer
  ]
})
export class DetailComponentModule {
}
