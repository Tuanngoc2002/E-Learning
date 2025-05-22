// Định nghĩa các giao diện
interface User {
  id: string;
  organizationID?: string;
  role?: { name: string };
}

interface Context {
  state: { user?: User };
  query?: { filters?: { organizationID?: { $eq?: string } } };
  request?: { query?: { filters?: { organizationID?: { $eq?: string } } } };
  response?: {
    status: number;
    body: any;
  };
}

interface Strapi {
  // Định nghĩa nếu cần
}

// Thông điệp lỗi
const ERRORS = {
  INVALID_USER: "Dữ liệu người dùng không hợp lệ",
  UNAUTHORIZED: "Không tìm thấy người dùng hoặc organizationID",
  MISSING_ORG_ID: "Thiếu organizationID trong truy vấn. Yêu cầu phải có filters[organizationID][$eq], ví dụ: ?filters[organizationID][$eq]=org1",
  ACCESS_DENIED: "Bạn không thể truy cập khóa học ngoài tổ chức của mình",
  FORBIDDEN: "Chỉ có giảng viên hoặc quản trị viên mới được truy cập tài nguyên này",
  INVALID_QUERY: "Query parameters không hợp lệ hoặc không được truyền",
};

// Vai trò
const ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
} as const;

// Hàm kiểm tra quyền truy cập
export default (ctx: Context, { strapi }: { strapi: Strapi }): boolean => {
  // Debug: In giá trị ctx để kiểm tra
  console.log('ctx.state.user:', JSON.stringify(ctx.state.user, null, 2));
  console.log('ctx.query:', ctx.query);
  console.log('ctx.request.query:', ctx.request?.query);

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

  // Kiểm tra organizationID
  if (!user.organizationID) {
    console.error('Error:', ERRORS.UNAUTHORIZED);
    if (ctx.response) {
      ctx.response.status = 401;
      ctx.response.body = { error: { message: ERRORS.UNAUTHORIZED } };
    }
    return false;
  }

  // Lấy query từ ctx.request.query (ưu tiên) hoặc ctx.query
  const query = ctx.request?.query || ctx.query;
  if (!query) {
    console.error('Error:', ERRORS.INVALID_QUERY);
    if (ctx.response) {
      ctx.response.status = 400;
      ctx.response.body = { error: { message: ERRORS.INVALID_QUERY } };
    }
    return false;
  }

  // Kiểm tra filters.organizationID.$eq
  if (!query.filters || !query.filters.organizationID || !query.filters.organizationID.$eq) {
    console.error('Error:', ERRORS.MISSING_ORG_ID);
    if (ctx.response) {
      ctx.response.status = 400;
      ctx.response.body = { error: { message: ERRORS.MISSING_ORG_ID } };
    }
    return false;
  }

  // Loại bỏ ký tự không mong muốn (như \n) từ requestedOrgId
  const requestedOrgId = query.filters.organizationID.$eq.trim();
  const cleanedOrgId = requestedOrgId.replace(/[\n\r\t]/g, '');
  console.log('requestedOrgId after trim:', requestedOrgId);

  // Kiểm tra vai trò admin
  const roleName = user.role?.name?.toLowerCase();
  if (roleName === ROLES.ADMIN) {
    console.log('User is admin, access granted');
    return true;
  }

  // Kiểm tra vai trò instructor
  if (roleName === ROLES.INSTRUCTOR) {
    if (requestedOrgId !== user.organizationID) {
      console.error('Error:', ERRORS.ACCESS_DENIED, {
        requestedOrgId,
        userOrgId: user.organizationID,
      });
      if (ctx.response) {
        ctx.response.status = 401;
        ctx.response.body = { error: { message: ERRORS.ACCESS_DENIED } };
      }
      return false;
    }
    console.log('User is instructor, access granted');
    return true;
  }

  // Từ chối truy cập nếu không phải admin hoặc instructor
  console.error('Error:', ERRORS.FORBIDDEN, { role: user.role?.name });
  if (ctx.response) {
    ctx.response.status = 403;
    ctx.response.body = { error: { message: ERRORS.FORBIDDEN } };
  }
  return false;
};