import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/tab/AbstractTab.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html'
})
export class UsersComponent extends AbstractTabComponent {
  constructor(
      activatedRoute: ActivatedRoute, windowService: WindowService) {
    super(activatedRoute, windowService, ['all', 'inerror']);
  }
}
