export default () => ({
  upload: {
    config: {
      provider: 'strapi-provider-upload-strapi-cloud',
      providerOptions: {
        apiKey: process.env.STRAPI_CLOUD_API_KEY,
        apiSecret: process.env.STRAPI_CLOUD_API_SECRET,
        // Các cấu hình khác nếu cần
      },
    },
  },
});
