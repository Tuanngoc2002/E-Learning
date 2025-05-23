'use strict';

const recommendationService = require('../services/recommendation');

module.exports = {
  async getRecommendations(ctx) {
    try {
      const { courseId } = ctx.params;
      const userId = ctx.state.user?.id;

      const recommendations = await recommendationService.getRecommendedCourses(courseId, userId);

      return {
        data: recommendations
      };
    } catch (err) {
      ctx.throw(500, err);
    }
  }
};
