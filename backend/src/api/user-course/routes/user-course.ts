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
      {
        method: 'GET',
        path: '/user-courses/enrolled',
        handler: 'user-course.enrolled',
        config: {
          policies: ['global::isAuthenticated']
        },
      },
      {
        method: 'GET',
        path: '/user-courses/findAll',
        handler: 'user-course.findAll',
        config: {
          policies: ['global::isAuthenticated']
        },
      },
    ],
  };
  