
## Nội dung
Người dùng ghi chú thông tin uống thuốc hàng ngày.
  * Hệ thống hiểu nội dung note: liều lượng, tên thuốc, ngày tháng, cảm nhận sau khi dùng thuốc.
  * Cảnh báo tương tác thuốc (drug interactions), chống chỉ định (contraindications), tác dụng phụ (side effects), quá liều lượng.

## Viễn cảnh
Có dữ liệu về trải nghiệm người dùng qua quá trình khám chữa bệnh, giúp các bệnh nhân đỡ lo.

## Chức năng

- Đăng nhập người dùng (OAuth)
- Nhập ghi chú thuốc (text tự do).
- Lịch sử uống thuốc.
- Trang tổng quan & cảnh báo.

## Công nghệ

| Thành phần | Công nghệ                 |
| ---------- | ------------------------- |
| Frontend   | Tailwindcss + Next.js + shadcn/ui + zustand
| Backend    | FastAPI (and SQLModel) + python
| NLP/AI     | OpenAI API + langchain
| Vector DB  | ChromaDB
| Graph DB   | Neo4j + https://python.langchain.com/docs/integrations/retrievers/graph_rag/?vector-store=chroma
| RAG        | LangChain + LLM
| Auth       | Supabase