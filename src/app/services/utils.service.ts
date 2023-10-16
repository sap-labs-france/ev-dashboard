import { Injectable } from '@angular/core';
import { LandscapeType } from 'types/configuration/Landscape';

import { ConfigService } from './config.service';

@Injectable()
export class UtilsService {
  // eslint-disable-next-line no-useless-constructor
  public constructor(private configService: ConfigService) {}

  public consoleDebugLog(msg: any, error?: any) {
    if (this.configService.getDebug().enabled) {
      console.log(
        `${new Date().toISOString()} :: ${msg}${error ? ' :: Error details:' : ''}`,
        error ? error : ''
      );
    }
  }

  public isDevLandscape(): boolean {
    return this.configService.getLandscape().type === LandscapeType.DEVELOPMENT;
  }

  public isQaLandscape(): boolean {
    return this.configService.getLandscape().type === LandscapeType.QA;
  }

  public isProdLandscape(): boolean {
    return this.configService.getLandscape().type === LandscapeType.PRODUCTION;
  }
}
