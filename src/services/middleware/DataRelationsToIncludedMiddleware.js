// fix for https://github.com/twg/devour/issues/155
export default {
  name: 'move-data-relationships-to-included',
  res: payload => {
    const resData = payload.res.data;
    const relationships = resData.data.relationships;
    const included = resData.included;
    if (relationships) {
      Object.entries(relationships).forEach(([key, relationship]) => {
        const data = relationship.data;
        if (data && data.id) {
          included.push(data);
        } else if (Array.isArray(data)) {
          included.push(...data);
        }
      });
    }
    return payload;
  },
};
