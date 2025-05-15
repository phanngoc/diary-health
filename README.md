# Health Reminder - Ứng dụng ghi chú thuốc thông minh

Health Reminder là ứng dụng cho phép người dùng ghi chú thông tin uống thuốc hàng ngày và nhận cảnh báo về tương tác thuốc, chống chỉ định, tác dụng phụ và quá liều lượng.

![Health Reminder](image.png)

## Tính năng chính

- Đăng nhập người dùng (OAuth qua Supabase)
- Nhập ghi chú thuốc (text tự do)
- Lịch sử uống thuốc
- Trang tổng quan & cảnh báo

## Công nghệ sử dụng

### Frontend

- Next.js + TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand (State Management)

### Backend

- FastAPI
- SQLModel + SQLite (dễ dàng chuyển sang PostgreSQL cho production)
- OpenAI API + LangChain
- ChromaDB (Vector Database)
- Neo4j (Graph Database)

## Cài đặt & Chạy ứng dụng

### Yêu cầu

- Node.js 18+
- Python 3.10+
- Tài khoản Supabase
- API key OpenAI

### Backend

```bash
cd health-reminder/backend
python -m venv venv
source venv/bin/activate  # Trên Windows: venv\Scripts\activate
pip install -r requirements.txt

# Tạo file .env với các thông tin cần thiết
# Chạy server
uvicorn main:app --reload
```

### Frontend

```bash
cd health-reminder/frontend
npm install
npm run dev
```

## Cấu trúc dự án

```
health-reminder/
├── backend/
│   ├── app/
│   │   ├── api/                # API endpoints
│   │   ├── models/             # SQLModel models
│   │   ├── services/           # Business logic
│   │   └── utils/              # Utility functions
│   ├── main.py                 # FastAPI application
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js pages
│   │   ├── components/         # React components
│   │   └── lib/                # Utilities and hooks
│   ├── package.json            # Node dependencies
│   └── tailwind.config.js      # Tailwind configuration
└── README.md                   # Project documentation
```

## Triển khai

### Backend

- Khuyến nghị triển khai trên Heroku, Railway, hoặc các nền tảng tương tự
- Chuyển sang PostgreSQL cho môi trường sản xuất
- Sử dụng Pinecone hoặc Weaviate cho Vector DB trong môi trường sản xuất

### Các services sẽ chạy trên các cổng sau:

- Supabase Studio: http://localhost:3000
- Neo4j Browser: http://localhost:7474
- ChromaDB: http://localhost:8000
- Backend API: http://localhost:8001

Bạn có thể truy cập:

- Supabase Studio tại http://localhost:3000 để quản lý database
- Neo4j Browser tại http://localhost:7474 để quản lý graph database
- ChromaDB API tại http://localhost:8000
- Backend API tại http://localhost:8001

### Frontend

- Triển khai trên Vercel hoặc Netlify

## Hướng dẫn đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi của bạn (`git commit -m 'Add some amazing feature'`)
4. Push lên branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

## Tác giả

- Phát triển bởi [Your Name]

## Giấy phép

Dự án này được cấp phép theo giấy phép MIT - xem file LICENSE để biết thêm chi tiết. 