export default async (ctx, config, { strapi }) => {
    const user = ctx.state.user;
    const lessonData = ctx.request.body?.data;
  
    if (!user || user.role?.name.toLowerCase() !== 'instructor') {
      console.log('❌ User is not instructor');
      return false;
    }
  
    const courseId = lessonData?.course;
    if (!courseId) {
      console.log('❌ Missing course ID');
      return false;
    }
  
    try {
      // Lấy thông tin khóa học
      const course = await strapi.entityService.findOne("api::course.course", courseId, {
        fields: ['organizationID'],
        populate: {
          instructor: {
            fields: ['id']
          }
        }
      });
  
      if (!course) {
        console.log(`❌ Course ${courseId} not found`);
        return false;
      }

      // Check if the user is the instructor of the course
      if (course.instructor && course.instructor.id === user.id) {
        console.log(`✅ User is the instructor of course ${courseId}`);
        return true;
      }

      // Fallback: Check organizationID if course has one
      if (course.organizationID) {
        if (course.organizationID !== user.organizationID) {
          console.log(`❌ User organizationID ${user.organizationID} != course organizationID ${course.organizationID}`);
          return false;
        }
      }
      // If organizationID is empty/null, allow instructors to create lessons (for backwards compatibility)
  
      console.log(`✅ User can create lesson in course ${courseId}`);
      return true;
    } catch (error) {
      console.error('Error in can-create-lesson policy:', error);
      return false;
    }
  };
  