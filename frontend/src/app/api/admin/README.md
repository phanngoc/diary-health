# Admin API Routes Documentation

Hệ thống API routes trong Next.js làm middleware cho admin backend NestJS.

## Cấu trúc API Routes

```
/api/admin/
├── auth/
│   └── login/          # Admin authentication
├── blog/
│   ├── posts/          # Blog posts management
│   │   └── [id]/       # Single post operations
│   │       ├── publish/ # Publish post
│   │       └── archive/ # Archive post
│   ├── stats/          # Blog statistics
│   └── upload/         # Image upload
├── categories/         # Categories management
└── tags/              # Tags management
```

## Environment Variables

Tạo file `.env.local` với các biến sau:

```bash
# Admin Backend URL
ADMIN_API_URL=http://localhost:3000/api

# NextAuth Secret
NEXTAUTH_SECRET=your-nextauth-secret-key

# Next.js URL
NEXTAUTH_URL=http://localhost:3001
```

## Authentication Flow

1. Frontend gửi request tới Next.js API route
2. API route validate JWT token từ NextAuth
3. API route forward request tới admin backend NestJS với token
4. Response được transform và trả về frontend

## API Endpoints

### Blog Posts

#### GET /api/admin/blog/posts
Lấy danh sách bài viết với filter và pagination.

**Query Parameters:**
- `page`: Số trang (default: 1)
- `limit`: Số bài viết per trang (default: 10)
- `search`: Tìm kiếm theo title/content
- `status`: Filter theo status (draft/published/archived)
- `category`: Filter theo category (y-te/suc-khoe/thuoc)

**Response:**
```json
{
  "data": [BlogPost[]],
  "total": number,
  "page": number,
  "limit": number
}
```

#### POST /api/admin/blog/posts
Tạo bài viết mới.

**Request Body:**
```json
{
  "title": "string",
  "content": "string", 
  "excerpt": "string",
  "category": "y-te" | "suc-khoe" | "thuoc",
  "tags": ["string"],
  "status": "draft" | "published",
  "featured_image": "string?",
  "meta_description": "string?",
  "meta_keywords": "string?"
}
```

#### GET /api/admin/blog/posts/[id]
Lấy chi tiết một bài viết.

#### PUT /api/admin/blog/posts/[id]
Cập nhật bài viết.

#### DELETE /api/admin/blog/posts/[id]
Xóa bài viết.

#### PATCH /api/admin/blog/posts/[id]/publish
Xuất bản bài viết (chuyển status từ draft sang published).

#### PATCH /api/admin/blog/posts/[id]/archive
Lưu trữ bài viết (chuyển status sang archived).

### Blog Statistics

#### GET /api/admin/blog/stats
Lấy thống kê blog.

**Response:**
```json
{
  "total_posts": number,
  "published_posts": number,
  "draft_posts": number,
  "archived_posts": number,
  "categories": {
    "y-te": number,
    "suc-khoe": number,
    "thuoc": number
  },
  "recent_posts": [BlogPost[]]
}
```

### Image Upload

#### POST /api/admin/blog/upload
Upload hình ảnh cho bài viết.

**Request:** FormData with `image` field
**Response:**
```json
{
  "url": "string"
}
```

### Categories & Tags

#### GET /api/admin/categories
Lấy danh sách categories.

#### POST /api/admin/categories
Tạo category mới.

#### GET /api/admin/tags
Lấy danh sách tags.

#### POST /api/admin/tags
Tạo tag mới.

## Data Transformation

API routes tự động transform data giữa frontend và backend:

### Frontend → Backend
- `category` (y-te/suc-khoe/thuoc) → `type` (HEALTH/WELLNESS/MEDICINE)
- `tags` array → comma-separated string (nếu cần)

### Backend → Frontend  
- `type` (HEALTH/WELLNESS/MEDICINE) → `category` (y-te/suc-khoe/thuoc)
- `tags` string → array (nếu cần)

## Error Handling

Tất cả API routes có error handling thống nhất:

- **401**: Authentication required
- **500**: Server error với message cụ thể

## Logging

Tất cả requests và responses được log với timestamp để debug.

## Usage Example

```typescript
// Frontend code using the API
const response = await fetch('/api/admin/blog/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Bài viết mới',
    content: 'Nội dung...',
    category: 'y-te',
    status: 'draft'
  })
});

const data = await response.json();
```

## Testing

Để test các API routes:

1. Start admin backend NestJS: `cd admin-app && npm run start:dev`
2. Start Next.js frontend: `cd frontend && npm run dev`
3. Login vào frontend để có JWT token
4. Call các API endpoints từ frontend

## Troubleshooting

### Lỗi "Authentication required"
- Kiểm tra JWT token trong NextAuth
- Đảm bảo user đã login
- Check NEXTAUTH_SECRET config

### Lỗi "Failed to fetch from admin backend"
- Kiểm tra admin backend đang chạy
- Check ADMIN_API_URL config
- Verify network connectivity

### Lỗi CORS
- Check admin backend CORS config
- Đảm bảo origin được allow

## Security Notes

- Tất cả endpoints yêu cầu authentication
- JWT token được validate ở mỗi request
- Data được sanitize trước khi forward tới backend
- Error messages không expose sensitive information
