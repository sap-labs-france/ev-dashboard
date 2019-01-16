import {ActivatedRoute} from '@angular/router';
import {WindowService} from '../../../services/window.service';
import {MatTabChangeEvent} from '@angular/material';

export class AbstractTabComponent {
  public activeTabIndex = 0;

  constructor(private activatedRoute: ActivatedRoute, private windowService: WindowService, private hashArray: string[]) {
    activatedRoute.fragment.subscribe(fragment => {
      const indexOf = this.hashArray.indexOf(fragment);
      if (indexOf >= 0) {
        this.activeTabIndex = indexOf;
      }
    })
  }

  updateRoute(event: MatTabChangeEvent) {
    if (this.hashArray && event.index < this.hashArray.length) {
      this.windowService.setHash(this.hashArray[event.index]);
    }
  }
}
