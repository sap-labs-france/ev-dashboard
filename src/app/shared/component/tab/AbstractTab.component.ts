import {ActivatedRoute} from '@angular/router';
import {WindowService} from '../../../services/window.service';
import {MatTabChangeEvent} from '@angular/material';

export class AbstractTabComponent {
  public activeTabIndex = 0;

  constructor(protected activatedRoute: ActivatedRoute, protected windowService: WindowService, protected hashArray: string[]) {
    activatedRoute.fragment.subscribe(fragment => {
      const indexOf = this.hashArray.indexOf(fragment);
      if (indexOf >= 0) {
        console.log('set activeRoute to ' + indexOf);
        this.activeTabIndex = indexOf;
      }
    })
  }

  updateRoute(index: number) {
    console.log('updateRoute from ' + index);
    if (this.hashArray && index < this.hashArray.length) {
      this.windowService.setHash(this.hashArray[index]);
    }
  }
}
