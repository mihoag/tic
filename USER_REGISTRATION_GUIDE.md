# User Registration Function Testing Guide

## ✅ Implemented Features

### 1. **New Registration Page** (`/register`)
- Complete English interface
- Support for both User and Organizer registration
- Detailed form validation
- Auto-login after successful registration

### 2. **Account Types**
- **User**: Join activities and earn badges
- **Organization (ORGANIZER)**: Create activities and manage badges

### 3. **Thông tin cần thiết**

#### Người dùng thường:
- Email *
- Mật khẩu *
- Xác nhận mật khẩu *
- Họ tên *
- Tên người dùng *
- Giới thiệu bản thân (tùy chọn)

#### Tổ chức:
- Tất cả thông tin trên +
- Tên tổ chức *
- Email tổ chức *
- Mô tả tổ chức (tùy chọn)
- Website (tùy chọn)

## 🧪 Cách test

### 1. **Truy cập trang đăng ký**
```
http://localhost:5174/register
```

### 2. **Test đăng ký User**
- Chọn "Người dùng"
- Điền thông tin:
  - Email: test@example.com
  - Mật khẩu: 123456
  - Họ tên: Nguyễn Văn Test
  - Username: testuser
- Click "Tạo tài khoản"
- Sẽ tự động đăng nhập và chuyển đến dashboard

### 3. **Test đăng ký Organizer**
- Chọn "Tổ chức"
- Điền thông tin cá nhân + thông tin tổ chức:
  - Tên tổ chức: Công ty Test
  - Email tổ chức: contact@test.com
- Click "Tạo tài khoản"
- Sẽ tự động đăng nhập và chuyển đến org dashboard

### 4. **Test validation**
- Thử bỏ trống các trường bắt buộc
- Thử email không hợp lệ
- Thử mật khẩu không khớp
- Thử username đã tồn tại

## 🔗 Navigation

- **Từ Login**: Click "Đã có tài khoản? Đăng nhập"
- **Từ Header**: Click "Sign Up" button
- **Mobile menu**: Click "Sign Up"

## 🛡️ Security Features

- Email validation
- Password confirmation
- Username uniqueness check
- Form validation toàn diện
- Auto-login sau đăng ký
- Tự động tạo organization cho Organizer

## 📱 Responsive Design

- Mobile-friendly
- Adaptive layout
- Touch-friendly buttons
- Password visibility toggle
