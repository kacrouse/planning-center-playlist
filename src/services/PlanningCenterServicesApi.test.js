import PlanningCenterServicesApi from './planningCenterServices';

describe('planningCenterServices', () => {
  test('middleware?', () => {
    const api = new PlanningCenterServicesApi({
      appId: process.env.PCO_APP_ID,
      appSecret: process.env.PCO_APP_SECRET,
    });

    return api.find('plan', 42745890).then(result => console.log(result.id));
  });
});
