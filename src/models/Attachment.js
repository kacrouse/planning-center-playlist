export default {
  created_at: '2000-01-01T12:00:00Z',
  page_order: 'string',
  updated_at: '2000-01-01T12:00:00Z',
  filename: 'string',
  file_size: 1,
  content_type: 'string',
  linked_url: 'string',
  pco_type: 'string',
  remote_link: 'string',
  thumbnail_url: 'string',
  url: 'string',
  allow_mp3_download: true,
  web_streamable: true,
  downloadable: true,
  transposable: true,
  streamable: true,
  has_preview: true,
  attachable: {
    jsonApi: 'hasOne',
  },
  attachment_types: {
    type: 'AttachmentType',
    jsonApi: 'hasMany',
  },
  created_by: {
    type: 'Person',
    jsonApi: 'hasOne',
  },
  updated_by: {
    type: 'Person',
    jsonApi: 'hasOne',
  },
};
