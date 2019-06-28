export default {
  title: '',
  sequence: 0,
  created_at: '',
  updated_at: '',
  length: 0,
  item_type: '',
  html_details: '',
  service_position: '',
  description: '',
  key_name: '',
  custom_arrangement_sequence: [],
  custom_arrangement_sequence_short: [],
  plan: {
    jsonApi: 'hasOne',
    type: 'Plan',
  },
  song: {
    jsonApi: 'hasOne',
    type: 'Song',
  },
  arrangement: {
    jsonApi: 'hasOne',
    type: 'Arrangement',
  },
  key: {
    type: 'Key',
    jsonApi: 'hasOne',
  },
  selected_layout: {
    type: 'Layout',
    jsonApi: 'hasOne',
  },
  selected_background: {
    type: 'Attachment',
    jsonApi: 'hasOne',
  },
};
