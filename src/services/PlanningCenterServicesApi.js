import JsonApi from 'devour-client';
import HttpBearerAuthMiddleware from '../middleware/HttpBearerAuthMiddleware';
import Plan from '../models/Plan';

export default class PlanningCenterServicesApi extends JsonApi {
  constructor({ authToken, appId, appSecret }) {
    super({
      apiUrl: 'https://api.planningcenteronline.com/services/v2',
    });
    if (authToken) {
      this.replaceMiddleware('HTTP_BASIC_AUTH', new HttpBearerAuthMiddleware(authToken));
    } else {
      // todo: is there a better way to bypass oauth for tests?
      this.auth = { username: appId, password: appSecret };
    }
    this.define('Plan', Plan);
  }
}
