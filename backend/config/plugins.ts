export default () => ({
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        providerOptions: {
            apiKey: process.env.STRAPI_CLOUD_API_KEY,
            // ... các option khác
          },
      },
    },
  },
});
