# Health Blog Admin API

Hệ thống API quản lý blog cho chuyên đề y tế, sức khỏe, thuốc được xây dựng với NestJS, TypeORM và PostgreSQL.

## Tính năng

### 🔐 Authentication & Authorization
- Đăng nhập với JWT token
- Bảo mật API endpoints
- Quản lý phiên người dùng

### 👥 Quản lý người dùng
- CRUD operations cho users
- Phân quyền admin
- Quản lý trạng thái tài khoản

### 📂 Quản lý danh mục
- Tạo, sửa, xóa categories
- Sắp xếp thứ tự hiển thị
- Quản lý trạng thái active/inactive

### 🏷️ Quản lý tags
- CRUD operations cho tags
- Tùy chỉnh màu sắc
- Phân loại bài viết

### 📝 Quản lý bài viết blog
- Tạo, chỉnh sửa, xóa bài viết
- Hỗ trợ nhiều trạng thái: Draft, Published, Archived
- Phân loại theo chủ đề: Health, Medicine, Wellness, Disease Prevention, Nutrition
- SEO metadata
- Thống kê views và likes
- Tìm kiếm và lọc nâng cao

## Công nghệ sử dụng

- **Framework**: NestJS 11.x
- **Database**: PostgreSQL với TypeORM
- **Authentication**: JWT
- **Validation**: class-validator
- **Language**: TypeScript

## Cài đặt

### 1. Clone repository và cài đặt dependencies

```bash
cd admin-app
npm install
```

### 2. Cấu hình database

Tạo database PostgreSQL:
```sql
CREATE DATABASE health_blog_admin;
```

### 3. Cấu hình environment

Copy file .env.example thành .env và cập nhật thông tin:
```bash
cp .env.example .env
```

Cập nhật các biến trong file .env:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=health_blog_admin

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
```

### 4. Chạy migrations và seed data

```bash
# Khởi động ứng dụng để tạo tables (TypeORM sẽ tự động tạo)
npm run start:dev

# Trong terminal khác, chạy seed để tạo dữ liệu mẫu
npm run seed
```

### 5. Khởi động ứng dụng

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

API sẽ chạy tại: http://localhost:3000/api

## API Endpoints

### Authentication
```
POST /api/auth/login
GET  /api/auth/profile
```

### Users
```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PATCH  /api/users/:id
DELETE /api/users/:id
```

### Categories
```
GET    /api/categories
GET    /api/categories/active
GET    /api/categories/:id
GET    /api/categories/slug/:slug
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id
```

### Tags
```
GET    /api/tags
GET    /api/tags/active
GET    /api/tags/:id
GET    /api/tags/slug/:slug
POST   /api/tags
PATCH  /api/tags/:id
DELETE /api/tags/:id
```

### Blog Posts
```
GET    /api/blog-posts
GET    /api/blog-posts/statistics
GET    /api/blog-posts/:id
GET    /api/blog-posts/slug/:slug
POST   /api/blog-posts
PATCH  /api/blog-posts/:id
PUT    /api/blog-posts/:id/view
PUT    /api/blog-posts/:id/like
DELETE /api/blog-posts/:id
```

## Sử dụng API

### 1. Đăng nhập

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@healthblog.com",
    "password": "admin123"
  }'
```

### 2. Tạo bài viết mới

```bash
curl -X POST http://localhost:3000/api/blog-posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Cách phòng ngừa cảm cúm",
    "slug": "cach-phong-ngua-cam-cum",
    "excerpt": "Những biện pháp đơn giản để phòng ngừa cảm cúm hiệu quả",
    "content": "# Cách phòng ngừa cảm cúm\n\nNội dung bài viết...",
    "status": "published",
    "type": "disease_prevention",
    "authorId": "author-uuid",
    "categoryId": "category-uuid",
    "tagId": "tag-uuid"
  }'
```

## Dữ liệu mẫu

Sau khi chạy seed, hệ thống sẽ có:

**Admin user:**
- Email: admin@healthblog.com
- Password: admin123

**Categories:**
- Sức khỏe tổng quát
- Thuốc và điều trị
- Dinh dưỡng
- Phòng bệnh

**Tags:**
- Tim mạch
- Tiểu đường
- Huyết áp
- Vitamin

## Development

```bash
# Chạy trong development mode
npm run start:dev

# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm run test

# Build cho production
npm run build
```
