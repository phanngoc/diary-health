import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { CreateTagDto, UpdateTagDto } from '../dto/tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const existingTag = await this.tagRepository.findOne({
      where: [
        { name: createTagDto.name },
        { slug: createTagDto.slug }
      ]
    });

    if (existingTag) {
      throw new ConflictException('Tag with this name or slug already exists');
    }

    const tag = this.tagRepository.create(createTagDto);
    return this.tagRepository.save(tag);
  }

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['blogPosts']
    });
  }

  async findActive(): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['blogPosts']
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async findBySlug(slug: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { slug },
      relations: ['blogPosts']
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);
    
    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const existingTag = await this.tagRepository.findOne({
        where: { name: updateTagDto.name }
      });
      
      if (existingTag) {
        throw new ConflictException('Tag with this name already exists');
      }
    }

    if (updateTagDto.slug && updateTagDto.slug !== tag.slug) {
      const existingTag = await this.tagRepository.findOne({
        where: { slug: updateTagDto.slug }
      });
      
      if (existingTag) {
        throw new ConflictException('Tag with this slug already exists');
      }
    }

    await this.tagRepository.update(id, updateTagDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.findOne(id);
    await this.tagRepository.remove(tag);
  }
}
