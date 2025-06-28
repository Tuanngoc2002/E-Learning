import { toast } from 'react-toastify';

// Success messages
export const toastSuccess = (message: string) => {
  toast.success(message);
};

// Error messages
export const toastError = (message: string) => {
  toast.error(message);
};

// Warning messages
export const toastWarning = (message: string) => {
  toast.warning(message);
};

// Info messages
export const toastInfo = (message: string) => {
  toast.info(message);
};

// Vietnamese error message translations
export const getVietnameseErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return translateErrorMessage(error);
  }

  if (error?.error?.message) {
    return translateErrorMessage(error.error.message);
  }

  if (error?.message) {
    return translateErrorMessage(error.message);
  }

  return 'Đã xảy ra lỗi không xác định';
};

// Error message translation map
const translateErrorMessage = (message: string): string => {
  const translations: { [key: string]: string } = {
    'Invalid identifier or password': 'Email hoặc mật khẩu không đúng',
    'Validation error': 'Lỗi xác thực',
    'User not found': 'Không tìm thấy người dùng',
    'Email already exists': 'Email đã tồn tại',
    'Password is required': 'Mật khẩu là bắt buộc',
    'Email is required': 'Email là bắt buộc',
    'Username is required': 'Tên người dùng là bắt buộc',
    'Invalid email format': 'Định dạng email không hợp lệ',
    'Password must be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự',
    'Passwords do not match': 'Mật khẩu xác nhận không khớp',
    'Network error': 'Lỗi mạng',
    'Server error': 'Lỗi máy chủ',
    'Unauthorized': 'Không có quyền truy cập',
    'Forbidden': 'Bị cấm truy cập',
    'Not found': 'Không tìm thấy',
    'Internal server error': 'Lỗi máy chủ nội bộ',
    'Bad request': 'Yêu cầu không hợp lệ',
    'Login failed': 'Đăng nhập thất bại',
    'Registration failed': 'Đăng ký thất bại',
    'User data is missing': 'Thiếu dữ liệu người dùng',
    'Access denied': 'Truy cập bị từ chối',
    'Session expired': 'Phiên đăng nhập đã hết hạn',
    'Invalid token': 'Token không hợp lệ',
    'Connection failed': 'Kết nối thất bại',
    'Timeout error': 'Lỗi hết thời gian chờ',
    'Database error': 'Lỗi cơ sở dữ liệu',
    'File upload failed': 'Tải file thất bại',
    'Invalid file format': 'Định dạng file không hợp lệ',
    'File too large': 'File quá lớn',
    'Permission denied': 'Không có quyền',
    'Account locked': 'Tài khoản bị khóa',
    'Account not verified': 'Tài khoản chưa được xác thực',
    'Invalid credentials': 'Thông tin đăng nhập không hợp lệ',
    'Token expired': 'Token đã hết hạn',
    'Invalid verification code': 'Mã xác thực không hợp lệ',
    'Course not found': 'Không tìm thấy khóa học',
    'Enrollment failed': 'Đăng ký khóa học thất bại',
    'Payment failed': 'Thanh toán thất bại',
    'Course already enrolled': 'Đã đăng ký khóa học này',
  };

  if (translations[message]) {
    return translations[message];
  }

  for (const [english, vietnamese] of Object.entries(translations)) {
    if (message.toLowerCase().includes(english.toLowerCase())) {
      return vietnamese;
    }
  }

  return message;
};

export const getVietnameseSuccessMessage = (message: string): string => {
  const translations: { [key: string]: string } = {
    'Login successful': 'Đăng nhập thành công',
    'Registration successful': 'Đăng ký thành công',
    'Profile updated': 'Cập nhật hồ sơ thành công',
    'Password changed': 'Đổi mật khẩu thành công',
    'Data saved': 'Lưu dữ liệu thành công',
    'Course enrolled': 'Đăng ký khóa học thành công',
    'Course completed': 'Hoàn thành khóa học',
    'Message sent': 'Gửi tin nhắn thành công',
    'File uploaded': 'Tải file thành công',
    'Settings updated': 'Cập nhật cài đặt thành công',
    'Account verified': 'Xác thực tài khoản thành công',
    'Email sent': 'Gửi email thành công',
    'Password reset': 'Đặt lại mật khẩu thành công',
    'Account created': 'Tạo tài khoản thành công',
    'Course created': 'Tạo khóa học thành công',
    'Course updated': 'Cập nhật khóa học thành công',
    'Course deleted': 'Xóa khóa học thành công',
    'Payment successful': 'Thanh toán thành công',
    'Enrollment successful': 'Đăng ký thành công',
    'Assignment submitted': 'Nộp bài tập thành công',
    'Grade updated': 'Cập nhật điểm thành công',
    'Certificate generated': 'Tạo chứng chỉ thành công',
    'Progress saved': 'Lưu tiến độ thành công',
    'Review submitted': 'Gửi đánh giá thành công',
    'Comment posted': 'Đăng bình luận thành công',
    'Bookmark added': 'Thêm bookmark thành công',
    'Bookmark removed': 'Xóa bookmark thành công',
    'Logout successful': 'Đăng xuất thành công',
  };

  return translations[message] || message;
}; 