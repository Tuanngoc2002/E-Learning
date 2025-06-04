export const determineUserRole = (user: any) => {
  // If user already has role with type, use it
  if (user.role && user.role.type) {
    return user.role.type;
  }
  
  // If user has role with name, use it
  if (user.role && user.role.name) {
    return user.role.name.toLowerCase();
  }
  
  // Determine role from email or username patterns
  const email = user.email?.toLowerCase() || '';
  const username = user.username?.toLowerCase() || '';
  
  if (email.includes('admin') || username.includes('admin')) {
    return 'admin';
  }
  
  if (email.includes('instructor') || username.includes('instructor')) {
    return 'instructor';
  }
  
  // Default to authenticated user
  return 'authenticated';
};

export const createRoleObject = (roleType: string) => {
  const roleConfigs = {
    admin: { id: 4, name: 'Admin', description: 'Admin role', type: 'admin' },
    instructor: { id: 3, name: 'Instructor', description: 'Instructor role', type: 'instructor' },
    authenticated: { id: 1, name: 'Authenticated', description: 'Authenticated user role', type: 'authenticated' }
  };
  
  return roleConfigs[roleType as keyof typeof roleConfigs] || roleConfigs.authenticated;
};

export const mapRoleForRouting = (roleType: string) => {
  const mapping: { [key: string]: string } = {
    'admin': 'admin',
    'instructor': 'instructor',
    'authenticated': 'user',
    'public': 'user'
  };
  
  return mapping[roleType] || 'user';
}; 