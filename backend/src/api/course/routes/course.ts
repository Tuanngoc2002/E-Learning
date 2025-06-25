import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::course.course', {
  config: {
    find: {
      auth: false,
      policies: ['global::allow-public'],
    },
    findOne: {
      auth: false,
      policies: ['global::allow-public'],
    },
  },
});
