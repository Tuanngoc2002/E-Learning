import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::course.course', {
  config: {
    find: {
      auth: false,
      policies: [],
    },
    findOne: {
      auth: false,
      policies: [],
    },
  },
});
