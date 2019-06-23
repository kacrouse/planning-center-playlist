import JsonApi from 'devour-client';
import HttpBearerAuthMiddleware from '../middleware/HttpBearerAuthMiddleware';
import Plan from '../models/Plan';
import Item from '../models/Item';
import Arrangement from '../models/Arrangement';
import Song from '../models/Song';

export default class PlanningCenterServicesApi extends JsonApi {
  constructor({ authToken, appId, appSecret }) {
    super({
      apiUrl: 'https://api.planningcenteronline.com/services/v2',
    });
    if (authToken) {
      this.headers.Authorization = `Bearer ${authToken}`;
    } else {
      // todo: is there a better way to bypass oauth for tests?
      this.auth = { username: appId, password: appSecret };
    }
    this.define('Plan', Plan, { collectionPath: 'plans' });
    this.define('Item', Item, { collectionPath: 'items' });
    this.define('Arrangement', Arrangement, { collectionPath: 'arrangements' });
    this.define('Song', Song, { collectionPath: 'songs' });
  }
}
