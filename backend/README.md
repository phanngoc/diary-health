# Health Reminder Backend

Backend service cho ứng dụng Health Reminder, được xây dựng với FastAPI và tích hợp Supabase, Neo4j, và ChromaDB.

## 🚀 Công nghệ sử dụng

- **FastAPI**: Framework Python hiện đại, nhanh cho API
- **Supabase**: Backend-as-a-Service (BaaS) với PostgreSQL
- **Neo4j**: Graph Database
- **ChromaDB**: Vector Database cho AI/ML
- **Docker**: Containerization

## 📋 Yêu cầu hệ thống

- Docker và Docker Compose
- Python 3.11+
- Git

## 🛠️ Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd health-reminder/backend
```

### 2. Cấu hình môi trường
Tạo file `.env` trong thư mục backend với các biến môi trường sau:
```env
SUPABASE_URL=http://supabase-db:5432
SUPABASE_KEY=your-secret-key
SUPABASE_DB_PASSWORD=password
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
CHROMA_HOST=chroma
CHROMA_PORT=8000
```

### 3. Khởi động services với Docker
```bash
docker-compose up -d
```

## 🌐 Truy cập các services

Sau khi khởi động, các services sẽ có sẵn tại:

- **Backend API**: http://localhost:8001
- **Supabase Studio**: http://localhost:3000
- **Neo4j Browser**: http://localhost:7474
- **ChromaDB**: http://localhost:8000

## 📚 API Documentation

Sau khi khởi động backend, bạn có thể truy cập:
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## 🗄️ Database

### Supabase (PostgreSQL)
- Port: 5432
- Database: postgres
- Username: postgres
- Password: password (được cấu hình trong docker-compose.yml)

### Neo4j
- HTTP Interface: http://localhost:7474
- Bolt Protocol: bolt://localhost:7687
- Username: neo4j
- Password: password (được cấu hình trong docker-compose.yml)

### ChromaDB
- API Endpoint: http://localhost:8000
- Persistent Storage: /chroma/chroma (trong container)

## 🔧 Phát triển

### Cài đặt môi trường phát triển
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# hoặc
.venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### Chạy ứng dụng trong môi trường phát triển
```bash
uvicorn main:app --reload --port 8001
```

## 📦 Cấu trúc thư mục
```
backend/
├── app/
│   ├── api/            # API endpoints
│   ├── core/           # Core functionality
│   ├── models/         # Database models
│   └── services/       # Business logic
├── tests/              # Test cases
├── .env               # Environment variables
├── .gitignore
├── docker-compose.yml # Docker services configuration
├── Dockerfile         # Backend service container
├── main.py           # Application entry point
└── requirements.txt   # Python dependencies
```

## 🔐 Bảo mật

- Tất cả mật khẩu trong file docker-compose.yml nên được thay đổi trong môi trường production
- Sử dụng biến môi trường cho các thông tin nhạy cảm
- Không commit file .env vào repository

## 🧪 Testing

```bash
# Chạy tests
pytest

# Chạy tests với coverage
pytest --cov=app tests/
```

## 📝 License

[MIT License](LICENSE)

## 👥 Contributing

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request 