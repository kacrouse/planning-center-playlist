import JsonApi from 'devour-client';
import DataRelationsToIncludedMiddleware from './middleware/DataRelationsToIncludedMiddleware';
import Plan from '../models/Plan';
import Item from '../models/Item';
import Arrangement from '../models/Arrangement';
import Song from '../models/Song';
import Attachment from '../models/Attachment';
import AttachmentActivity from '../models/AttachmentActivity';

export default class PlanningCenterServicesApi extends JsonApi {
  constructor({ authToken, appId, appSecret }) {
    super({
      apiUrl: 'https://api.planningcenteronline.com/services/v2',
    });

    // relations found in "data" (rather than "included") are not deserialized
    // https://github.com/twg/devour/issues/155
    this.insertMiddlewareBefore('response', DataRelationsToIncludedMiddleware);
    this._originalMiddleware = this.middleware;

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
    this.define('Attachment', Attachment, { collectionPath: 'attachments' });
    this.define('AttachmentActivity', AttachmentActivity);
  }

  request(url, ...args) {
    const alreadyCalled = this.middleware.some(m => m.name === 'set-model-to-attachment-activity');
    if (/\/open/.test(url) && !alreadyCalled) {
      // model never gets set, so devour always throws an error (POST only)
      // https://github.com/twg/devour/issues/135
      this.insertMiddlewareBefore('POST', {
        name: 'set-model-to-attachment-activity',
        req: payload => {
          payload.req.model = 'AttachmentActivity';
          return payload;
        },
      });
      return super.request(url, ...args).finally(() => {
        this.resetMiddleware();
      });
    }
    return super.request(url, ...args);
  }
}
