export default {
    routes: [
      {
        method: 'POST',
        path: '/user-courses/enroll',
        handler: 'user-course.enroll',
        config: {
          policies: ['global::isAuthenticated']
        },
      },
    ],
  };
  