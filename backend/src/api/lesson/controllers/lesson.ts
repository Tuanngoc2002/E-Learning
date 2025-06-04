/**
 * lesson controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
  async find(ctx) {
    console.log('🔍 Finding lessons with query:', ctx.query);
    return await super.find(ctx);
  },

  async findOne(ctx) {
    console.log('🔍 Finding lesson with ID:', ctx.params.id);
    return await super.findOne(ctx);
  },

  async update(ctx) {
    console.log('✏️ Updating lesson with ID:', ctx.params.id);
    console.log('📝 Update data:', ctx.request.body);
    
    try {
      const result = await super.update(ctx);
      console.log('✅ Lesson updated successfully');
      return result;
    } catch (error) {
      console.error('❌ Error updating lesson:', error);
      throw error;
    }
  },

  async delete(ctx) {
    console.log('🗑️ Deleting lesson with ID:', ctx.params.id);
    
    try {
      const result = await super.delete(ctx);
      console.log('✅ Lesson deleted successfully');
      return result;
    } catch (error) {
      console.error('❌ Error deleting lesson:', error);
      throw error;
    }
  }
}));
