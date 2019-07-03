import PlanningCenterServicesApi from './PlanningCenterServicesApi';

export default class PlanningCenterServicePlan {
  constructor({ authToken, planId }) {
    this.api = new PlanningCenterServicesApi({ authToken: authToken });
    this.planId = planId;
  }

  async get() {
    if (!this.planData) {
      this.planData = await this.api.find('plan', this.planId);
    }
    return this.planData;
  }

  async getSongs() {
    const plan = await this.get();
    const items = await this.api
      .one('service_type', plan.data.service_type.id)
      .one('plan', this.planId)
      .all('item')
      .get();
    const songItems = items.data.filter(item => item.item_type === 'song');
    const songs = songItems.map(songItem => ({
      title: songItem.title,
      itemId: songItem.id,
    }));
    const attachmentsByItem = await Promise.all(songItems.map(item => this.api.request(`${item.links.self}/attachments`)));
    const spotifyAttachments = attachmentsByItem.reduce((flattened, itemAttachments) => {
      const spotifyAttachment = itemAttachments.data.find(attachment => attachment.pco_type === 'AttachmentSpotify');
      if (spotifyAttachment) {
        songs.find(song => song.itemId === itemAttachments.meta.parent.id).attachmentId = spotifyAttachment.id;
        return flattened.concat(spotifyAttachment);
      }
      return flattened;
    }, []);
    const openedAttachments = await Promise.all(spotifyAttachments.map(attachment => this.api.request(`${attachment.links.self}/open`, 'POST')));
    const songsByAttachmentId = songs.reduce((mapped, song) => {
      mapped[song.attachmentId] = song;
      return mapped;
    }, {});
    openedAttachments.forEach(open => {
      songsByAttachmentId[open.data.attachment.id].spotifyUrl = open.data.attachment_url;
    });

    return songs;
  }
}
