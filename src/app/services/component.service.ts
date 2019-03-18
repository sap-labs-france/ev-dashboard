import {Injectable} from '@angular/core';
import {CentralServerService} from './central-server.service';

export enum ComponentEnum {
  OCPI = 'ocpi',
  ORGANIZATION = 'organization',
  CHARGE_AT_HOME = 'chargeathome',
  PRICING = 'pricing',
  SAC = 'sac'
}

@Injectable()
export class ComponentService {
  private activeComponents?: Array<string>;

  constructor(private centralServerService: CentralServerService) {
    this.centralServerService.getCurrentUserSubject().subscribe(user => {
      this.activeComponents = user.activeComponents;
    });
  }

  public isActive(componentName: ComponentEnum): boolean {
    if (this.activeComponents) {
      return this.activeComponents.includes(componentName);
    } else {
      return false;
    }
  }

  public getActiveComponents(): string[] {
    return this.activeComponents;
  }
}
