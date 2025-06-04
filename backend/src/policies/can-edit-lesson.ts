export default async (ctx, config, { strapi }) => {
  const user = ctx.state.user;
  const lessonId = ctx.params.id;

  if (!user || user.role?.name.toLowerCase() !== 'instructor') {
    console.log('❌ User is not instructor');
    return false;
  }

  if (!lessonId) {
    console.log('❌ Missing lesson ID');
    return false;
  }

  try {
    // Lấy thông tin lesson và course
    const lesson = await strapi.entityService.findOne("api::lesson.lesson", lessonId, {
      populate: ['course']
    });

    if (!lesson) {
      console.log(`❌ Lesson ${lessonId} not found`);
      return false;
    }

    // Lấy thông tin course để kiểm tra organizationID và instructor
    const course = await strapi.entityService.findOne("api::course.course", lesson.course.id, {
      fields: ['organizationID'],
      populate: {
        instructor: {
          fields: ['id']
        }
      }
    });

    if (!course) {
      console.log(`❌ Course not found for lesson ${lessonId}`);
      return false;
    }

    // Check if the user is the instructor of the course
    if (course.instructor && course.instructor.id === user.id) {
      console.log(`✅ User is the instructor of the course for lesson ${lessonId}`);
      return true;
    }

    // Fallback: Check organizationID if course has one
    if (course.organizationID) {
      if (course.organizationID !== user.organizationID) {
        console.log(`❌ User organizationID ${user.organizationID} != course organizationID ${course.organizationID}`);
        return false;
      }
    }
    // If organizationID is empty/null, allow instructors to edit lessons (for backwards compatibility)

    console.log(`✅ User can edit lesson ${lessonId}`);
    return true;
  } catch (error) {
    console.error('Error in can-edit-lesson policy:', error);
    return false;
  }
}; 