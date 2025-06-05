from fast_graphrag import GraphRAG

from dotenv import load_dotenv
load_dotenv()

DOMAIN = "Phân tích các thông tin kinh tế và chính trị liên quan đến các quyết định tài chính, bao gồm các chính sách, luật pháp, sự kiện và các tổ chức có ảnh hưởng đến thị trường tài chính."

EXAMPLE_QUERIES = [
    "Những chính sách kinh tế nào đã được ban hành trong năm qua?",
    "Ai là những nhân vật chủ chốt trong các quyết định tài chính gần đây?",
    "Chính phủ đã thực hiện những biện pháp gì để ổn định thị trường tài chính?",
    "Các tổ chức nào có vai trò quan trọng trong việc điều hành chính sách tiền tệ?",
    "Có sự kiện kinh tế hoặc chính trị nào ảnh hưởng lớn đến thị trường không?",
    "Những thỏa thuận tài chính quốc tế nào vừa được ký kết?",
    "Chính quyền đã đưa ra những thay đổi gì về luật tài chính?",
    "Các chỉ số kinh tế nào đang được chú ý nhất hiện nay?",
    "Có mối liên hệ nào giữa các tổ chức tài chính và chính phủ trong các quyết định gần đây?",
    "Thông tin này ảnh hưởng tích cực đến thị trường chứng khoán như thế nào?",
    "Các mã cổ phiếu nào có thể hưởng lợi từ các chính sách mới?",
]

ENTITY_TYPES = ["Person", "Organization", "Government", "Policy", "Law", "Event", "Location", "FinancialInstrument", "EconomicIndicator", "Agreement"]

grag = GraphRAG(
    working_dir="./data-finance",
    domain=DOMAIN,
    example_queries="\n".join(EXAMPLE_QUERIES),
    entity_types=ENTITY_TYPES
)

# print(grag.query("chính quyền ông Trump muốn làm gì ?").response)

print(grag.query("Mỹ muốn vòng đàm phán như vậy với nước nào ?").response)