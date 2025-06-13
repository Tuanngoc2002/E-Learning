// file: backend/src/admin/app.js

export default {
  config: {
    // Ghi đè các chuỗi dịch thuật mặc định
    translations: {
      en: {
        'Auth.form.welcome.title': 'Chào mừng đến với E-Learning!',
        'Auth.form.welcome.subtitle': 'Phiên bản v1.2 - CI/CD hoạt động!',
      },
      // Nếu bạn dùng ngôn ngữ khác (vd: vi), thêm vào đây
      vi: {
        'Auth.form.welcome.title': 'Chào mừng đến với E-Learning!',
        'Auth.form.welcome.subtitle': 'Phiên bản v1.1 - CI/CD hoạt động!',
      }
    },
    // Tắt các thông báo và hướng dẫn mặc định của Strapi
    tutorials: false,
    notifications: {
      releases: false,
    },
  },
  bootstrap() {},
};
