# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy
from itemloaders.processors import TakeFirst, MapCompose, Join
from w3lib.html import remove_tags


def clean_text(text):
    """Clean and normalize text content"""
    if not text:
        return ''
    # Remove extra whitespace and newlines
    return ' '.join(text.strip().split())


class PostItem(scrapy.Item):
    # define the fields for your item here like:
    site_id = scrapy.Field(output_processor=TakeFirst())
    title = scrapy.Field(
        input_processor=MapCompose(remove_tags, clean_text),
        output_processor=TakeFirst()
    )
    content = scrapy.Field(
        input_processor=MapCompose(remove_tags, clean_text),
        output_processor=TakeFirst()
    )
    url = scrapy.Field(output_processor=TakeFirst())
    excerpt = scrapy.Field(
        input_processor=MapCompose(remove_tags, clean_text),
        output_processor=TakeFirst()
    )
    published_date = scrapy.Field(output_processor=TakeFirst())
    author = scrapy.Field(
        input_processor=MapCompose(remove_tags, clean_text),
        output_processor=TakeFirst()
    )
    tags = scrapy.Field()  # Keep as list for tags
    image_url = scrapy.Field(output_processor=TakeFirst())
    scraped_at = scrapy.Field(output_processor=TakeFirst())


class SiteItem(scrapy.Item):
    name = scrapy.Field(output_processor=TakeFirst())
    base_url = scrapy.Field(output_processor=TakeFirst())
    description = scrapy.Field(
        input_processor=MapCompose(remove_tags, clean_text),
        output_processor=TakeFirst()
    )
