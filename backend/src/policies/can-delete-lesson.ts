export default async (ctx, config, { strapi }) => {
  const user = ctx.state.user;
  const lessonId = ctx.params.id;

  // Chỉ check user là instructor
  if (!user || user.role?.name.toLowerCase() !== 'instructor') {
    console.log('❌ User is not instructor');
    return false;
  }

  if (!lessonId) {
    console.log('❌ Missing lesson ID');
    return false;
  }

  try {
    // Chỉ check lesson có tồn tại không
    const lesson = await strapi.entityService.findOne("api::lesson.lesson", lessonId, {
      fields: ['id'] // Chỉ cần check tồn tại
    });

    if (!lesson) {
      console.log(`❌ Lesson ${lessonId} not found`);
      return false;
    }

    console.log(`✅ Instructor can delete lesson ${lessonId}`);
    return true;
  } catch (error) {
    console.error('Error in can-delete-lesson policy:', error);
    return false;
  }
}; 