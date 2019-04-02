import {Injectable} from '@angular/core';
import {CentralServerService} from './central-server.service';

export enum ComponentEnum {
  OCPI = 'ocpi',
  ORGANIZATION = 'organization',
  PRICING = 'pricing',
  REFUND = 'refund',
  SAC = 'sac'
}

@Injectable()
export class ComponentService {
  private activeComponents?: Array<string>;

  constructor(private centralServerService: CentralServerService) {
    this.centralServerService.getCurrentUserSubject().subscribe(user => {
      if (user) {
        this.activeComponents = user.activeComponents;
      } else {
        this.activeComponents = null;
      }
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
