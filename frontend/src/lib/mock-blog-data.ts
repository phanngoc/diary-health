// Mock blog data for development and testing
import { BlogPost } from '@/lib/blog-api';

export const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Hướng dẫn sử dụng thuốc an toàn tại nhà',
    content: `
      <h2>Giới thiệu</h2>
      <p>Việc sử dụng thuốc đúng cách tại nhà là một yếu tố quan trọng trong việc chữa trị bệnh hiệu quả và đảm bảo an toàn cho sức khỏe.</p>
      
      <h2>Các nguyên tắc cơ bản</h2>
      <ul>
        <li>Đọc kỹ hướng dẫn sử dụng trước khi uống thuốc</li>
        <li>Tuân thủ đúng liều lượng và thời gian uống thuốc</li>
        <li>Bảo quản thuốc ở nơi khô ráo, thoáng mát</li>
        <li>Kiểm tra hạn sử dụng trước khi sử dụng</li>
      </ul>

      <h2>Những lưu ý quan trọng</h2>
      <p>Không tự ý thay đổi liều lượng hoặc ngừng thuốc mà không có sự tư vấn của bác sĩ. Nếu có tác dụng phụ bất thường, hãy liên hệ với cơ sở y tế ngay lập tức.</p>
    `,
    excerpt: 'Hướng dẫn chi tiết về cách sử dụng thuốc an toàn tại nhà, bao gồm các nguyên tắc cơ bản và những lưu ý quan trọng.',
    category: 'thuoc',
    tags: ['thuốc', 'an toàn', 'hướng dẫn', 'sử dụng'],
    featured_image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
    status: 'published',
    author_id: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    published_at: '2024-01-15T10:00:00Z',
    meta_description: 'Hướng dẫn sử dụng thuốc an toàn tại nhà với các nguyên tắc cơ bản và lưu ý quan trọng',
    meta_keywords: 'thuốc, an toàn, hướng dẫn, sử dụng, y tế',
    views_count: 1250
  },
  {
    id: '2',
    title: '10 thói quen tốt cho sức khỏe tim mạch',
    content: `
      <h2>Tại sao tim mạch quan trọng?</h2>
      <p>Tim là cơ quan quan trọng nhất trong cơ thể, bơm máu và cung cấp oxy cho toàn bộ cơ thể. Chăm sóc tim mạch tốt sẽ giúp bạn sống khỏe mạnh và lâu hơn.</p>
      
      <h2>10 thói quen tốt cho tim</h2>
      <ol>
        <li>Tập thể dục đều đặn ít nhất 30 phút mỗi ngày</li>
        <li>Ăn nhiều rau xanh và trái cây</li>
        <li>Hạn chế muối và đường trong chế độ ăn</li>
        <li>Không hút thuốc và hạn chế rượu bia</li>
        <li>Duy trì cân nặng hợp lý</li>
        <li>Ngủ đủ 7-8 tiếng mỗi đêm</li>
        <li>Quản lý stress hiệu quả</li>
        <li>Kiểm tra sức khỏe định kỳ</li>
        <li>Uống đủ nước mỗi ngày</li>
        <li>Duy trì mối quan hệ xã hội tích cực</li>
      </ol>
    `,
    excerpt: 'Khám phá 10 thói quen đơn giản nhưng hiệu quả để bảo vệ và cải thiện sức khỏe tim mạch của bạn.',
    category: 'suc-khoe',
    tags: ['tim mạch', 'sức khỏe', 'thói quen', 'phòng bệnh'],
    featured_image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=400&fit=crop',
    status: 'published',
    author_id: 'admin',
    created_at: '2024-01-14T14:30:00Z',
    updated_at: '2024-01-14T14:30:00Z',
    published_at: '2024-01-14T14:30:00Z',
    meta_description: '10 thói quen tốt cho sức khỏe tim mạch giúp bạn sống khỏe mạnh và lâu hơn',
    meta_keywords: 'tim mạch, sức khỏe, thói quen, phòng bệnh, chăm sóc',
    views_count: 890
  },
  {
    id: '3',
    title: 'Hiểu về bệnh tiểu đường và cách quản lý',
    content: `
      <h2>Bệnh tiểu đường là gì?</h2>
      <p>Bệnh tiểu đường là một rối loạn chuyển hóa mãn tính được đặc trưng bởi nồng độ glucose trong máu cao do cơ thể không sản xuất đủ insulin hoặc không sử dụng insulin hiệu quả.</p>
      
      <h2>Các loại tiểu đường</h2>
      <ul>
        <li><strong>Tiểu đường type 1:</strong> Cơ thể không sản xuất insulin</li>
        <li><strong>Tiểu đường type 2:</strong> Cơ thể không sử dụng insulin hiệu quả</li>
        <li><strong>Tiểu đường thai kỳ:</strong> Xảy ra trong thời gian mang thai</li>
      </ul>

      <h2>Cách quản lý bệnh</h2>
      <p>Quản lý bệnh tiểu đường bao gồm kiểm soát chế độ ăn, tập thể dục đều đặn, uống thuốc theo chỉ định và theo dõi đường huyết thường xuyên.</p>
    `,
    excerpt: 'Tìm hiểu về bệnh tiểu đường, các loại tiểu đường khác nhau và phương pháp quản lý hiệu quả.',
    category: 'y-te',
    tags: ['tiểu đường', 'bệnh học', 'quản lý', 'điều trị'],
    status: 'draft',
    author_id: 'admin',
    created_at: '2024-01-13T09:00:00Z',
    updated_at: '2024-01-13T09:00:00Z',
    meta_description: 'Hiểu về bệnh tiểu đường, các loại và phương pháp quản lý bệnh hiệu quả',
    meta_keywords: 'tiểu đường, bệnh học, quản lý, điều trị, y tế',
    views_count: 0
  },
  {
    id: '4',
    title: 'Chế độ dinh dưỡng cho người cao tuổi',
    content: `
      <h2>Nhu cầu dinh dưỡng đặc biệt</h2>
      <p>Người cao tuổi có nhu cầu dinh dưỡng đặc biệt do sự thay đổi về sinh lý và khả năng hấp thụ chất dinh dưỡng giảm.</p>
      
      <h2>Các nguyên tắc dinh dưỡng</h2>
      <ul>
        <li>Tăng cường protein chất lượng cao</li>
        <li>Bổ sung vitamin D và canxi</li>
        <li>Uống đủ nước mỗi ngày</li>
        <li>Ăn nhiều chất xơ từ rau củ</li>
        <li>Hạn chế muối và đường</li>
      </ul>
    `,
    excerpt: 'Hướng dẫn chế độ dinh dưỡng phù hợp cho người cao tuổi để duy trì sức khỏe tốt.',
    category: 'suc-khoe',
    tags: ['dinh dưỡng', 'cao tuổi', 'chăm sóc', 'sức khỏe'],
    featured_image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=400&fit=crop',
    status: 'published',
    author_id: 'admin',
    created_at: '2024-01-12T16:45:00Z',
    updated_at: '2024-01-12T16:45:00Z',
    published_at: '2024-01-12T16:45:00Z',
    meta_description: 'Chế độ dinh dưỡng phù hợp cho người cao tuổi để duy trì sức khỏe tốt',
    meta_keywords: 'dinh dưỡng, cao tuổi, chăm sóc, sức khỏe, người già',
    views_count: 567
  },
  {
    id: '5',
    title: 'Tác dụng phụ của thuốc kháng sinh và cách phòng tránh',
    content: `
      <h2>Thuốc kháng sinh là gì?</h2>
      <p>Thuốc kháng sinh là loại thuốc được sử dụng để điều trị các bệnh nhiễm trùng do vi khuẩn gây ra.</p>
      
      <h2>Tác dụng phụ thường gặp</h2>
      <ul>
        <li>Rối loạn tiêu hóa</li>
        <li>Phản ứng dị ứng</li>
        <li>Kháng thuốc</li>
        <li>Mất cân bằng vi khuẩn đường ruột</li>
      </ul>

      <h2>Cách phòng tránh</h2>
      <p>Sử dụng đúng liều lượng, uống đủ thời gian điều trị và không tự ý ngừng thuốc.</p>
    `,
    excerpt: 'Tìm hiểu về tác dụng phụ của thuốc kháng sinh và cách sử dụng an toàn để tránh các tác dụng không mong muốn.',
    category: 'thuoc',
    tags: ['kháng sinh', 'tác dụng phụ', 'an toàn', 'sử dụng'],
    status: 'archived',
    author_id: 'admin',
    created_at: '2024-01-10T11:20:00Z',
    updated_at: '2024-01-10T11:20:00Z',
    published_at: '2024-01-10T11:20:00Z',
    meta_description: 'Tác dụng phụ của thuốc kháng sinh và cách sử dụng an toàn',
    meta_keywords: 'kháng sinh, tác dụng phụ, an toàn, sử dụng, thuốc',
    views_count: 234
  }
];

export const mockBlogStats = {
  total_posts: 5,
  published_posts: 3,
  draft_posts: 1,
  archived_posts: 1,
  categories: {
    'y-te': 1,
    'suc-khoe': 2,
    'thuoc': 2
  },
  recent_posts: mockBlogPosts.slice(0, 3)
};

// Mock API responses for development
export class MockBlogAPI {
  static async getPosts(filters: any = {}) {
    let filteredPosts = [...mockBlogPosts];
    
    // Apply filters
    if (filters.category) {
      filteredPosts = filteredPosts.filter(post => post.category === filters.category);
    }
    
    if (filters.status) {
      filteredPosts = filteredPosts.filter(post => post.status === filters.status);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: filteredPosts.slice(startIndex, endIndex),
      total: filteredPosts.length,
      page,
      limit
    };
  }
  
  static async getStats() {
    return mockBlogStats;
  }
}
