import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::lesson.lesson', {
  config: {
    create: {
      policies: ['global::can-create-lesson']
    },
    update: {
      policies: ['global::can-edit-lesson']
    },
    delete: {
      policies: ['global::can-delete-lesson']
    }
  }
});
