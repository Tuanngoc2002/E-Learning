'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/courses/:courseId/recommendations',
      handler: 'recommendation.getRecommendations',
      config: {
        policies: [],
        auth: false
      }
    }
  ]
};
