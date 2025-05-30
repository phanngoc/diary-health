import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  Put,
} from '@nestjs/common';
import { BlogPostService } from '../services/blog-post.service';
import { CreateBlogPostDto, UpdateBlogPostDto, BlogPostQueryDto } from '../dto/blog-post.dto';

@Controller('blog-posts')
export class BlogPostController {
  constructor(private readonly blogPostService: BlogPostService) {}

  @Post()
  create(@Body(ValidationPipe) createBlogPostDto: CreateBlogPostDto) {
    return this.blogPostService.create(createBlogPostDto);
  }

  @Get()
  findAll(@Query(ValidationPipe) query: BlogPostQueryDto) {
    return this.blogPostService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.blogPostService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogPostService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogPostService.findBySlug(slug);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateBlogPostDto: UpdateBlogPostDto,
  ) {
    return this.blogPostService.update(id, updateBlogPostDto);
  }

  @Put(':id/view')
  incrementViewCount(@Param('id') id: string) {
    return this.blogPostService.incrementViewCount(id);
  }

  @Put(':id/like')
  incrementLikeCount(@Param('id') id: string) {
    return this.blogPostService.incrementLikeCount(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogPostService.remove(id);
  }
}
