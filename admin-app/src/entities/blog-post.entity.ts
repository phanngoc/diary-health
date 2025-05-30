import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';

export enum BlogPostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum BlogPostType {
  HEALTH = 'health',
  MEDICINE = 'medicine',
  WELLNESS = 'wellness',
  DISEASE_PREVENTION = 'disease_prevention',
  NUTRITION = 'nutrition'
}

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  featuredImage: string;

  @Column({ 
    type: 'enum',
    enum: BlogPostStatus,
    default: BlogPostStatus.DRAFT
  })
  status: BlogPostStatus;

  @Column({ 
    type: 'enum',
    enum: BlogPostType,
    default: BlogPostType.HEALTH
  })
  type: BlogPostType;

  @Column({ type: 'json', nullable: true })
  seoMetadata: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.blogPosts)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column('uuid')
  authorId: string;

  @ManyToOne(() => Category, category => category.blogPosts, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column('uuid', { nullable: true })
  categoryId: string;

  @ManyToOne(() => Tag, tag => tag.blogPosts, { nullable: true })
  @JoinColumn({ name: 'tagId' })
  tag: Tag;

  @Column('uuid', { nullable: true })
  tagId: string;
}
