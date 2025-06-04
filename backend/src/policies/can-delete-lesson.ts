export default async (ctx, config, { strapi }) => {
  const user = ctx.state.user;

  // Chỉ check user là instructor - đơn giản nhất
  if (!user || user.role?.name.toLowerCase() !== 'instructor') {
    console.log('❌ User is not instructor');
    return false;
  }

  console.log(`✅ Instructor ${user.id} can delete lesson`);
  return true;
}; 