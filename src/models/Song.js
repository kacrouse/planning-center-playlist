export default {
  title: 'string',
  created_at: '2000-01-01T12:00:00Z',
  updated_at: '2000-01-01T12:00:00Z',
  admin: 'string',
  author: 'string',
  copyright: 'string',
  hidden: true,
  notes: 'string',
  themes: 'string',
  last_scheduled_at: '2000-01-01T12:00:00Z',
  ccli_number: 1,
  arrangements: {
    jsonApi: 'hasMany',
    type: 'Arrangement',
  },
  last_scheduled_item: {
    jsonApi: 'hasOne',
    type: 'Item',
  },
};
