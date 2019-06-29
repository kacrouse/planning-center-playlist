export default {
  created_at: '2000-01-01T12:00:00Z',
  name: 'string',
  updated_at: '2000-01-01T12:00:00Z',
  container: 'string',
  ancestors: {
    type: 'Folder',
    jsonApi: 'hasOne',
  },
  parent: {
    type: 'Folder',
    jsonApi: 'hasOne',
  },
};
