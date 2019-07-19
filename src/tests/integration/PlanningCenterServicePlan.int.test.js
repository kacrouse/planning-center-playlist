import PlanningCenterServicePlan from '../../services/PlanningCenterServicePlan';

describe('#get', () => {
  it('should return the details of a Plan', async () => {
    const planId = 42325334;
    const plan = new PlanningCenterServicePlan({
      appId: process.env.PCO_APP_ID,
      appSecret: process.env.PCO_APP_SECRET,
      planId,
    });

    let planDetail;
    let error;
    try {
      planDetail = await plan.get();
    } catch (e) {
      error = e;
    }

    expect(error).toBeUndefined();
    expect(planDetail).toMatchObject({
      data: {
        id: planId + '',
        type: 'Plan',
        created_at: '2019-05-21T17:43:58Z',
        series_title: 'Rooted In Prayer',
        title: 'Ephesians 3',
        created_by: { id: '18604549', type: 'Person' },
        service_type: { id: '655010', type: 'ServiceType' },
        series: { id: '1260416', type: 'Series' },
        links: {
          self: expect.anything(),
          items: expect.anything(),
        },
      },
      errors: undefined,
    });
  });
  it('should throw an error if an invalid plan ID is provided', async () => {
    const invalidPlanId = 1;
    const plan = new PlanningCenterServicePlan({
      appId: process.env.PCO_APP_ID,
      appSecret: process.env.PCO_APP_SECRET,
      planId: invalidPlanId,
    });

    let planDetail;
    let error;
    try {
      planDetail = await plan.get();
    } catch (e) {
      error = e;
    }

    expect(planDetail).toBeUndefined();
    expect(error).toMatchObject({
      '0': { detail: expect.any(String) },
    });
  });
});
describe('#getSongs', () => {
  it('should return the songs in a plan', async () => {
    const planId = 42325334;
    const plan = new PlanningCenterServicePlan({
      appId: process.env.PCO_APP_ID,
      appSecret: process.env.PCO_APP_SECRET,
      planId,
    });

    let songs;
    let error;
    try {
      songs = await plan.getSongs();
    } catch (e) {
      error = e;
    }

    expect(error).toBeUndefined();
    expect(songs).toEqual([
      {
        title: 'Oh Great Is Our God',
        itemId: '577727501',
        attachmentId: '57330535',
        spotifyUrl: 'https://open.spotify.com/track/6QVMMRa6YRv2PXXVzIaYLc',
      },
      {
        title: 'Only You',
        itemId: '577474524',
        attachmentId: '60785999',
        spotifyUrl: 'https://open.spotify.com/track/7gcDJKPzlb4eLxGYmPcQDe',
      },
      {
        title: 'Great Are You Lord',
        itemId: '577727068',
        attachmentId: '64626354',
        spotifyUrl: 'https://open.spotify.com/track/1Hv54MWloXiAZDam1ez840',
      },
      {
        title: 'Tremble',
        itemId: '577475317',
        attachmentId: '82248139',
        spotifyUrl: 'https://open.spotify.com/track/35GACeX8Zl55jp29xFbvvo',
      },
      {
        title: 'Revelation Song',
        itemId: '577728064',
      },
    ]);
  });
});
