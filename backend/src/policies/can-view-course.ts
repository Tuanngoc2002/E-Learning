// Định nghĩa các giao diện
interface User {
  id: string;
  role?: { name: string };
}

interface Context {
  state: { user?: User };
  response?: {
    status: number;
    body: any;
  };
}

// Thông điệp lỗi
const ERRORS = {
  INVALID_USER: "Dữ liệu người dùng không hợp lệ",
  UNAUTHORIZED: "Người dùng chưa đăng nhập",
};

// Vai trò
const ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
} as const;

type RoleType = typeof ROLES[keyof typeof ROLES];

// Hàm kiểm tra quyền truy cập
export default (ctx: Context): boolean => {
  const user = ctx.state.user;

  // Kiểm tra tính hợp lệ của user
  if (!user || typeof user !== "object" || !user.id) {
    console.error('Error:', ERRORS.INVALID_USER);
    if (ctx.response) {
      ctx.response.status = 401;
      ctx.response.body = { error: { message: ERRORS.INVALID_USER } };
    }
    return false;
  }

  // Kiểm tra vai trò
  const roleName = user.role?.name?.toLowerCase() as RoleType | undefined;
  
  // Cho phép tất cả các role đã đăng nhập xem courses
  if (roleName && [ROLES.STUDENT, ROLES.ADMIN, ROLES.INSTRUCTOR].includes(roleName)) {
    return true;
  }

  // Từ chối truy cập nếu không có role hợp lệ
  console.error('Error: User role not authorized');
  if (ctx.response) {
    ctx.response.status = 403;
    ctx.response.body = { error: { message: 'User role not authorized' } };
  }
  return false;
}; 