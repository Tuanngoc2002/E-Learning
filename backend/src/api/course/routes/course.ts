import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::course.course', {
  config: {
    find: {
      policies: ['global::allow-public'],
    },
    findOne: {
      policies: ['global::allow-public'],
    },
  },
});
