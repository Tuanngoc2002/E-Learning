import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::lesson.lesson', {
  config: {
    create: {
      policies: ['global::can-create-lesson']
    }
  }
});
