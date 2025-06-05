'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Upload, Eye, Save, Send } from 'lucide-react';
import { BlogPost, CreateBlogPost, UpdateBlogPost, blogAPI } from '@/lib/blog-api';
import { toast } from 'sonner';

const blogPostSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề tối đa 200 ký tự'),
  content: z.string().min(1, 'Nội dung không được để trống'),
  excerpt: z.string().min(1, 'Tóm tắt không được để trống').max(500, 'Tóm tắt tối đa 500 ký tự'),
  category: z.enum(['y-te', 'suc-khoe', 'thuoc'], {
    required_error: 'Vui lòng chọn danh mục'
  }),
  tags: z.string(),
  featured_image: z.string().optional(),
  status: z.enum(['draft', 'published']),
  meta_description: z.string().max(160, 'Mô tả SEO tối đa 160 ký tự').optional(),
  meta_keywords: z.string().optional(),
});

type BlogPostForm = z.infer<typeof blogPostSchema>;

interface BlogPostEditorProps {
  post?: BlogPost | null;
  onSave: () => void;
  onCancel: () => void;
}

export function BlogPostEditor({ post, onSave, onCancel }: BlogPostEditorProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<BlogPostForm>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      category: 'y-te',
      tags: '',
      status: 'draft',
      meta_description: '',
      meta_keywords: '',
    }
  });

  const watchedContent = watch('content');
  const watchedTitle = watch('title');

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        category: post.category,
        tags: post.tags.join(', '),
        featured_image: post.featured_image || '',
        status: post.status === 'archived' ? 'draft' : post.status,
        meta_description: post.meta_description || '',
        meta_keywords: post.meta_keywords || '',
      });
      setTags(post.tags);
    }
  }, [post, reset]);

  const onSubmit = async (data: BlogPostForm) => {
    try {
      setLoading(true);
      
      const postData = {
        ...data,
        tags: tags,
      };

      if (post) {
        // Update existing post
        await blogAPI.updatePost({
          id: post.id,
          ...postData
        });
        toast.success('Cập nhật bài viết thành công');
      } else {
        // Create new post
        await blogAPI.createPost(postData);
        toast.success('Tạo bài viết thành công');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Không thể lưu bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await blogAPI.uploadImage(file);
      setValue('featured_image', response.url);
      toast.success('Tải ảnh lên thành công');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Không thể tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags.join(', '));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags.join(', '));
  };

  const categoryLabels = {
    'y-te': 'Y tế',
    'suc-khoe': 'Sức khỏe',
    'thuoc': 'Thuốc'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {post ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
          </h2>
          <p className="text-muted-foreground">
            {post ? 'Cập nhật thông tin bài viết' : 'Tạo nội dung mới cho blog y tế & sức khỏe'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreview(!preview)}>
            <Eye className="h-4 w-4 mr-2" />
            {preview ? 'Chỉnh sửa' : 'Xem trước'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <TabsContent value="content" className="space-y-6">
            {preview ? (
              <Card>
                <CardHeader>
                  <CardTitle>{watchedTitle || 'Tiêu đề bài viết'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: watchedContent?.replace(/\n/g, '<br>') || '' }} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Nhập tiêu đề bài viết..."
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Tóm tắt *</Label>
                  <Textarea
                    id="excerpt"
                    {...register('excerpt')}
                    placeholder="Tóm tắt ngắn gọn về nội dung bài viết..."
                    rows={3}
                    className={errors.excerpt ? 'border-red-500' : ''}
                  />
                  {errors.excerpt && (
                    <p className="text-sm text-red-500">{errors.excerpt.message}</p>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Nội dung *</Label>
                  <Textarea
                    id="content"
                    {...register('content')}
                    placeholder="Viết nội dung bài viết..."
                    rows={15}
                    className={errors.content ? 'border-red-500' : ''}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500">{errors.content.message}</p>
                  )}
                </div>

                {/* Featured Image */}
                <div className="space-y-2">
                  <Label>Ảnh đại diện</Label>
                  <div className="flex gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    {uploading && <span className="text-sm text-muted-foreground">Đang tải...</span>}
                  </div>
                  {watch('featured_image') && (
                    <div className="mt-2">
                      <img 
                        src={watch('featured_image')} 
                        alt="Preview" 
                        className="max-w-xs h-auto rounded border"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div className="space-y-2">
                <Label>Danh mục *</Label>
                <Select onValueChange={(value: any) => setValue('category', value)}>
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="y-te">Y tế</SelectItem>
                    <SelectItem value="suc-khoe">Sức khỏe</SelectItem>
                    <SelectItem value="thuoc">Thuốc</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select onValueChange={(value: any) => setValue('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="published">Xuất bản</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Thẻ</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Nhập thẻ..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Thêm
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            {/* Meta Description */}
            <div className="space-y-2">
              <Label htmlFor="meta_description">Mô tả SEO</Label>
              <Textarea
                id="meta_description"
                {...register('meta_description')}
                placeholder="Mô tả ngắn gọn cho công cụ tìm kiếm (tối đa 160 ký tự)..."
                rows={3}
                maxLength={160}
                className={errors.meta_description ? 'border-red-500' : ''}
              />
              {errors.meta_description && (
                <p className="text-sm text-red-500">{errors.meta_description.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {watch('meta_description')?.length || 0}/160 ký tự
              </p>
            </div>

            {/* Meta Keywords */}
            <div className="space-y-2">
              <Label htmlFor="meta_keywords">Từ khóa SEO</Label>
              <Input
                id="meta_keywords"
                {...register('meta_keywords')}
                placeholder="từ khóa 1, từ khóa 2, từ khóa 3..."
                className={errors.meta_keywords ? 'border-red-500' : ''}
              />
              {errors.meta_keywords && (
                <p className="text-sm text-red-500">{errors.meta_keywords.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Phân tách các từ khóa bằng dấu phẩy
              </p>
            </div>
          </TabsContent>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              onClick={() => setValue('status', 'draft')}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Đang lưu...' : 'Lưu nháp'}
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              onClick={() => setValue('status', 'published')}
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Đang xuất bản...' : 'Xuất bản'}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
