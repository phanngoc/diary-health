import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { BlogPost, BlogPostStatus, BlogPostType } from '../entities/blog-post.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(BlogPost)
    private blogPostRepository: Repository<BlogPost>,
  ) {}

  async seed() {
    // Create admin user
    const existingUser = await this.userRepository.findOne({
      where: { email: 'admin@healthblog.com' }
    });

    let admin = existingUser;
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await this.userRepository.save({
        email: 'admin@healthblog.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
      });
    }

    // Create categories
    const categories = [
      {
        name: 'Sức khỏe tổng quát',
        slug: 'suc-khoe-tong-quat',
        description: 'Các bài viết về sức khỏe tổng quát',
        sortOrder: 1,
      },
      {
        name: 'Thuốc và điều trị',
        slug: 'thuoc-va-dieu-tri',
        description: 'Thông tin về thuốc và phương pháp điều trị',
        sortOrder: 2,
      },
      {
        name: 'Dinh dưỡng',
        slug: 'dinh-duong',
        description: 'Kiến thức về dinh dưỡng và ăn uống lành mạnh',
        sortOrder: 3,
      },
      {
        name: 'Phòng bệnh',
        slug: 'phong-benh',
        description: 'Các biện pháp phòng ngừa bệnh tật',
        sortOrder: 4,
      },
    ];

    const savedCategories = [];
    for (const categoryData of categories) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: categoryData.slug }
      });
      if (!existing) {
        const category = await this.categoryRepository.save(categoryData);
        savedCategories.push(category);
      } else {
        savedCategories.push(existing);
      }
    }

    // Create tags
    const tags = [
      {
        name: 'Tim mạch',
        slug: 'tim-mach',
        description: 'Các vấn đề về tim mạch',
        color: '#ff6b6b',
      },
      {
        name: 'Tiểu đường',
        slug: 'tieu-duong',
        description: 'Bệnh tiểu đường và điều trị',
        color: '#4ecdc4',
      },
      {
        name: 'Huyết áp',
        slug: 'huyet-ap',
        description: 'Vấn đề huyết áp cao/thấp',
        color: '#45b7d1',
      },
      {
        name: 'Vitamin',
        slug: 'vitamin',
        description: 'Các loại vitamin và bổ sung',
        color: '#96ceb4',
      },
    ];

    const savedTags = [];
    for (const tagData of tags) {
      const existing = await this.tagRepository.findOne({
        where: { slug: tagData.slug }
      });
      if (!existing) {
        const tag = await this.tagRepository.save(tagData);
        savedTags.push(tag);
      } else {
        savedTags.push(existing);
      }
    }

    // Create sample blog posts
    const blogPosts = [
      {
        title: '10 Cách giữ gìn sức khỏe tim mạch',
        slug: '10-cach-giu-gin-suc-khoe-tim-mach',
        excerpt: 'Tìm hiểu về những cách đơn giản nhưng hiệu quả để bảo vệ sức khỏe tim mạch của bạn.',
        content: `
# 10 Cách giữ gìn sức khỏe tim mạch

Sức khỏe tim mạch là nền tảng của một cuộc sống khỏe mạnh. Dưới đây là 10 cách hiệu quả để bảo vệ trái tim của bạn:

## 1. Tập thể dục thường xuyên
- Dành ít nhất 30 phút mỗi ngày cho hoạt động thể chất
- Các bài tập tim mạch như đi bộ, chạy bộ, bơi lội

## 2. Ăn uống lành mạnh
- Tăng cường rau xanh và trái cây
- Hạn chế thực phẩm chế biến sẵn
- Chọn chất béo tốt từ cá, hạt

## 3. Kiểm soát cân nặng
- Duy trì BMI trong khoảng bình thường
- Tránh thừa cân béo phì

## 4. Không hút thuốc
- Bỏ thuốc lá hoàn toàn
- Tránh khói thuốc thụ động

## 5. Hạn chế đồ uống có cồn
- Uống có điều độ nếu có
- Nam giới không quá 2 ly/ngày, nữ giới không quá 1 ly/ngày

## 6. Quản lý stress
- Thực hành thiền định, yoga
- Dành thời gian thư giãn

## 7. Ngủ đủ giấc
- 7-9 tiếng mỗi đêm
- Tạo thói quen ngủ tốt

## 8. Kiểm tra sức khỏe định kỳ
- Đo huyết áp thường xuyên
- Xét nghiệm cholesterol

## 9. Kiểm soát các bệnh lý
- Điều trị tiểu đường nếu có
- Kiểm soát huyết áp cao

## 10. Giữ mối quan hệ xã hội tốt
- Duy trì các mối quan hệ tích cực
- Tham gia hoạt động cộng đồng

Hãy bắt đầu từ những thay đổi nhỏ và duy trì lâu dài để có một trái tim khỏe mạnh!
        `,
        status: BlogPostStatus.PUBLISHED,
        type: BlogPostType.HEALTH,
        authorId: admin.id,
        categoryId: savedCategories[0].id,
        tagId: savedTags[0].id,
        publishedAt: new Date(),
        seoMetadata: {
          metaTitle: '10 Cách giữ gìn sức khỏe tim mạch hiệu quả',
          metaDescription: 'Khám phá 10 cách đơn giản nhưng hiệu quả để bảo vệ sức khỏe tim mạch. Hướng dẫn chi tiết từ chuyên gia y tế.',
          keywords: ['sức khỏe tim mạch', 'bảo vệ tim', 'phòng bệnh tim mạch', 'tập thể dục', 'ăn uống lành mạnh']
        }
      },
      {
        title: 'Hiểu đúng về bệnh tiểu đường type 2',
        slug: 'hieu-dung-ve-benh-tieu-duong-type-2',
        excerpt: 'Tất cả những gì bạn cần biết về bệnh tiểu đường type 2, từ nguyên nhân đến cách điều trị.',
        content: `
# Hiểu đúng về bệnh tiểu đường type 2

## Bệnh tiểu đường type 2 là gì?

Bệnh tiểu đường type 2 là tình trạng cơ thể không thể sử dụng insulin hiệu quả, dẫn đến tăng đường huyết.

## Nguyên nhân

### Yếu tố nguy cơ chính:
- Béo phì
- Ít vận động
- Yếu tố di truyền
- Tuổi tác (trên 45 tuổi)
- Tiền sử tiểu đường thai kỳ

## Triệu chứng

- Khát nước nhiều
- Đi tiểu thường xuyên
- Mệt mỏi
- Mờ mắt
- Vết thương lâu lành

## Chẩn đoán

- Xét nghiệm đường huyết lúc đói
- Test HbA1c
- Test dung nạp glucose

## Điều trị

### 1. Thay đổi lối sống
- Chế độ ăn phù hợp
- Tập thể dục đều đặn
- Kiểm soát cân nặng

### 2. Thuốc điều trị
- Metformin
- Insulin (nếu cần)
- Các thuốc khác theo chỉ định

### 3. Theo dõi thường xuyên
- Đo đường huyết tại nhà
- Khám định kỳ
- Theo dõi biến chứng

## Phòng ngừa biến chứng

- Kiểm soát đường huyết tốt
- Theo dõi huyết áp
- Chăm sóc chân
- Khám mắt định kỳ

Việc hiểu đúng và điều trị kịp thời sẽ giúp kiểm soát bệnh hiệu quả!
        `,
        status: BlogPostStatus.PUBLISHED,
        type: BlogPostType.HEALTH,
        authorId: admin.id,
        categoryId: savedCategories[1].id,
        tagId: savedTags[1].id,
        publishedAt: new Date(),
        seoMetadata: {
          metaTitle: 'Bệnh tiểu đường type 2: Nguyên nhân, triệu chứng và điều trị',
          metaDescription: 'Tìm hiểu đầy đủ về bệnh tiểu đường type 2, các yếu tố nguy cơ, triệu chứng và phương pháp điều trị hiệu quả.',
          keywords: ['tiểu đường type 2', 'đường huyết', 'insulin', 'điều trị tiểu đường', 'phòng ngừa biến chứng']
        }
      },
    ];

    for (const postData of blogPosts) {
      const existing = await this.blogPostRepository.findOne({
        where: { slug: postData.slug }
      });
      if (!existing) {
        await this.blogPostRepository.save(postData);
      }
    }

    console.log('✅ Seed data created successfully!');
  }
}
