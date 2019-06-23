export default {
  created_at: '',
  title: 'string',
  updated_at: '',
  public: true,
  series_title: '',
  plan_notes_count: 1,
  other_time_count: 1,
  rehearsal_time_count: 1,
  service_time_count: 1,
  plan_people_count: 1,
  needed_positions_count: 1,
  items_count: 1,
  total_length: 1,
  multi_day: true,
  files_expire_at: '',
  sort_date: '',
  last_time_at: '',
  permissions: '',
  dates: '',
  short_dates: '',
  next_plan: {
    jsonApi: 'hasOne',
    type: 'Plan',
  },
  previous_plan: {
    jsonApi: 'hasOne',
    type: 'Plan',
  },
};
