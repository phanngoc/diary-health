import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { BlogPost, BlogPostStatus } from '../entities/blog-post.entity';
import { CreateBlogPostDto, UpdateBlogPostDto, BlogPostQueryDto } from '../dto/blog-post.dto';

@Injectable()
export class BlogPostService {
  constructor(
    @InjectRepository(BlogPost)
    private blogPostRepository: Repository<BlogPost>,
  ) {}

  async create(createBlogPostDto: CreateBlogPostDto): Promise<BlogPost> {
    const blogPost = this.blogPostRepository.create({
      ...createBlogPostDto,
      publishedAt: createBlogPostDto.status === BlogPostStatus.PUBLISHED ? new Date() : null,
    });

    return this.blogPostRepository.save(blogPost);
  }

  async findAll(query: BlogPostQueryDto): Promise<{ data: BlogPost[]; total: number }> {
    const {
      search,
      status,
      type,
      categoryId,
      tagId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = query;

    const queryBuilder = this.blogPostRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tag', 'tag');

    if (search) {
      queryBuilder.andWhere(
        '(post.title ILIKE :search OR post.content ILIKE :search OR post.excerpt ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('post.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('post.type = :type', { type });
    }

    if (categoryId) {
      queryBuilder.andWhere('post.categoryId = :categoryId', { categoryId });
    }

    if (tagId) {
      queryBuilder.andWhere('post.tagId = :tagId', { tagId });
    }

    queryBuilder.orderBy(`post.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: string): Promise<BlogPost> {
    const blogPost = await this.blogPostRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'tag']
    });

    if (!blogPost) {
      throw new NotFoundException('Blog post not found');
    }

    return blogPost;
  }

  async findBySlug(slug: string): Promise<BlogPost> {
    const blogPost = await this.blogPostRepository.findOne({
      where: { slug },
      relations: ['author', 'category', 'tag']
    });

    if (!blogPost) {
      throw new NotFoundException('Blog post not found');
    }

    return blogPost;
  }

  async update(id: string, updateBlogPostDto: UpdateBlogPostDto): Promise<BlogPost> {
    const blogPost = await this.findOne(id);
    
    // Update publishedAt when status changes to published
    if (updateBlogPostDto.status === BlogPostStatus.PUBLISHED && blogPost.status !== BlogPostStatus.PUBLISHED) {
      updateBlogPostDto = { ...updateBlogPostDto, publishedAt: new Date() } as any;
    }

    await this.blogPostRepository.update(id, updateBlogPostDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const blogPost = await this.findOne(id);
    await this.blogPostRepository.remove(blogPost);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.blogPostRepository.increment({ id }, 'viewCount', 1);
  }

  async incrementLikeCount(id: string): Promise<void> {
    await this.blogPostRepository.increment({ id }, 'likeCount', 1);
  }

  async getStatistics(): Promise<any> {
    const total = await this.blogPostRepository.count();
    const published = await this.blogPostRepository.count({
      where: { status: BlogPostStatus.PUBLISHED }
    });
    const draft = await this.blogPostRepository.count({
      where: { status: BlogPostStatus.DRAFT }
    });
    const archived = await this.blogPostRepository.count({
      where: { status: BlogPostStatus.ARCHIVED }
    });

    const totalViews = await this.blogPostRepository
      .createQueryBuilder('post')
      .select('SUM(post.viewCount)', 'sum')
      .getRawOne();

    const totalLikes = await this.blogPostRepository
      .createQueryBuilder('post')
      .select('SUM(post.likeCount)', 'sum')
      .getRawOne();

    return {
      total,
      published,
      draft,
      archived,
      totalViews: parseInt(totalViews.sum) || 0,
      totalLikes: parseInt(totalLikes.sum) || 0,
    };
  }
}
