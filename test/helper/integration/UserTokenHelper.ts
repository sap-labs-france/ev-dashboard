import * as jwt from 'jsonwebtoken';

import * as adminAuthMock from '../../mock/userToken/admin.json';

export class UserTokenHelper {
  public static generateToken(payload) {
    const token = jwt.sign(payload, 'testSecret', { expiresIn: 360 * 24 * 3600 });
    return token;
  }

  public static generateAdmin() {
    return this.generateToken(adminAuthMock);
  }
}
