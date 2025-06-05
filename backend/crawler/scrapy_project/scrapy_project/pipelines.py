# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html

import psycopg2
import os
import logging
from datetime import datetime
from itemadapter import ItemAdapter
from scrapy.exceptions import DropItem
import hashlib


class DuplicatesPipeline:
    """Pipeline to filter out duplicate items based on title + site_id"""

    def __init__(self):
        self.ids_seen = set()

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        # Create a unique identifier based on title and site_id
        if adapter.get('title') and adapter.get('site_id'):
            item_id = hashlib.md5(
                f"{adapter['title']}{adapter['site_id']}".encode('utf-8')
            ).hexdigest()
            
            if item_id in self.ids_seen:
                raise DropItem(f"Duplicate item found: {adapter['title']}")
            else:
                self.ids_seen.add(item_id)
                return item
        else:
            raise DropItem("Missing title or site_id")


class ValidationPipeline:
    """Pipeline to validate item data"""

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        
        # Validate required fields
        if not adapter.get('title'):
            raise DropItem("Missing title")
        
        if not adapter.get('site_id'):
            raise DropItem("Missing site_id")
            
        # Clean and validate content
        if adapter.get('content'):
            content = adapter['content'].strip()
            if len(content) < 50:  # Minimum content length
                raise DropItem("Content too short")
            adapter['content'] = content
        
        # Set default values
        if not adapter.get('scraped_at'):
            adapter['scraped_at'] = datetime.now()
            
        return item


class PostgresPipeline:
    """Pipeline to save items to PostgreSQL database"""

    def __init__(self, postgres_host, postgres_port, postgres_db, 
                 postgres_user, postgres_password):
        self.postgres_host = postgres_host
        self.postgres_port = postgres_port
        self.postgres_db = postgres_db
        self.postgres_user = postgres_user
        self.postgres_password = postgres_password

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            postgres_host=crawler.settings.get("POSTGRES_HOST", "localhost"),
            postgres_port=crawler.settings.get("POSTGRES_PORT", 5432),
            postgres_db=crawler.settings.get("POSTGRES_DB", "postgres"),
            postgres_user=crawler.settings.get("POSTGRES_USER", "postgres"),
            postgres_password=crawler.settings.get("POSTGRES_PASSWORD", "password"),
        )

    def open_spider(self, spider):
        """Initialize database connection and create tables if they don't exist"""
        try:
            self.connection = psycopg2.connect(
                host=self.postgres_host,
                port=self.postgres_port,
                database=self.postgres_db,
                user=self.postgres_user,
                password=self.postgres_password
            )
            self.cursor = self.connection.cursor()
            
            # Create tables if they don't exist
            self.create_tables()
            spider.logger.info("Connected to PostgreSQL database")
            
        except Exception as e:
            spider.logger.error(f"Error connecting to PostgreSQL: {e}")
            raise

    def create_tables(self):
        """Create necessary tables"""
        # Create sites table
        sites_table = """
        CREATE TABLE IF NOT EXISTS sites (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            base_url VARCHAR(500) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        # Create posts table
        posts_table = """
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
            title VARCHAR(1000) NOT NULL,
            content TEXT,
            excerpt TEXT,
            url VARCHAR(1000),
            author VARCHAR(255),
            tags TEXT[],
            image_url VARCHAR(1000),
            published_date TIMESTAMP,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(title, site_id)
        );
        """
        
        # Create index for better performance
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_posts_site_id ON posts(site_id);",
            "CREATE INDEX IF NOT EXISTS idx_posts_published_date ON posts(published_date);",
            "CREATE INDEX IF NOT EXISTS idx_posts_scraped_at ON posts(scraped_at);",
            "CREATE INDEX IF NOT EXISTS idx_sites_name ON sites(name);"
        ]
        
        try:
            self.cursor.execute(sites_table)
            self.cursor.execute(posts_table)
            
            for index in indexes:
                self.cursor.execute(index)
                
            self.connection.commit()
            
        except Exception as e:
            self.connection.rollback()
            raise e

    def close_spider(self, spider):
        """Close database connection"""
        if hasattr(self, 'connection'):
            self.connection.close()
            spider.logger.info("PostgreSQL connection closed")

    def process_item(self, item, spider):
        """Process and save item to database"""
        adapter = ItemAdapter(item)
        
        try:
            if adapter.get('name'):  # This is a SiteItem
                self.insert_site(adapter)
            else:  # This is a PostItem
                self.insert_post(adapter)
                
            return item
            
        except psycopg2.IntegrityError as e:
            # Handle duplicate entries
            self.connection.rollback()
            spider.logger.warning(f"Duplicate item skipped: {e}")
            return item
            
        except Exception as e:
            self.connection.rollback()
            spider.logger.error(f"Error inserting item: {e}")
            raise DropItem(f"Error inserting item: {e}")

    def insert_site(self, adapter):
        """Insert site data"""
        insert_query = """
        INSERT INTO sites (name, base_url, description)
        VALUES (%s, %s, %s)
        ON CONFLICT (name) DO UPDATE SET
            base_url = EXCLUDED.base_url,
            description = EXCLUDED.description,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id;
        """
        
        self.cursor.execute(insert_query, (
            adapter['name'],
            adapter['base_url'],
            adapter.get('description', '')
        ))
        
        self.connection.commit()

    def insert_post(self, adapter):
        """Insert post data"""
        insert_query = """
        INSERT INTO posts (
            site_id, title, content, excerpt, url, author, 
            tags, image_url, published_date, scraped_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (title, site_id) DO UPDATE SET
            content = EXCLUDED.content,
            excerpt = EXCLUDED.excerpt,
            url = EXCLUDED.url,
            author = EXCLUDED.author,
            tags = EXCLUDED.tags,
            image_url = EXCLUDED.image_url,
            published_date = EXCLUDED.published_date,
            scraped_at = EXCLUDED.scraped_at,
            updated_at = CURRENT_TIMESTAMP;
        """
        
        # Convert tags list to PostgreSQL array format
        tags = adapter.get('tags', [])
        if isinstance(tags, list):
            tags_array = tags
        else:
            tags_array = [tags] if tags else []
        
        self.cursor.execute(insert_query, (
            adapter['site_id'],
            adapter['title'],
            adapter.get('content', ''),
            adapter.get('excerpt', ''),
            adapter.get('url', ''),
            adapter.get('author', ''),
            tags_array,
            adapter.get('image_url', ''),
            adapter.get('published_date'),
            adapter.get('scraped_at', datetime.now())
        ))
        
        self.connection.commit()


class LoggingPipeline:
    """Pipeline to log detailed information about each item being processed"""
    
    def __init__(self):
        self.logger = logging.getLogger('scrapy.pipelines.logging')
        self.items_processed = 0
        self.sites_processed = 0
        self.start_time = datetime.now()
    
    def open_spider(self, spider):
        """Initialize pipeline when spider opens"""
        self.logger.info(f"🔧 LoggingPipeline initialized for spider: {spider.name}")
        self.logger.info(f"📅 Pipeline started at: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    def close_spider(self, spider):
        """Log final statistics when spider closes"""
        end_time = datetime.now()
        duration = end_time - self.start_time
        
        self.logger.info("📊 LoggingPipeline Statistics:")
        self.logger.info(f"   • Total items processed: {self.items_processed}")
        self.logger.info(f"   • Sites processed: {self.sites_processed}")
        self.logger.info(f"   • Pipeline duration: {duration}")
        
        if self.items_processed > 0:
            items_per_minute = self.items_processed / (duration.total_seconds() / 60)
            self.logger.info(f"   • Processing rate: {items_per_minute:.2f} items/minute")
    
    def process_item(self, item, spider):
        """Log each item being processed"""
        adapter = ItemAdapter(item)
        
        if adapter.get('name'):  # This is a SiteItem
            self.sites_processed += 1
            site_name = adapter.get('name', 'Unknown')
            self.logger.info(f"🏢 [{self.sites_processed}] Processing site: {site_name}")
            
        else:  # This is a PostItem
            self.items_processed += 1
            title = adapter.get('title', 'Unknown')[:50] + ('...' if len(adapter.get('title', '')) > 50 else '')
            url = adapter.get('url', 'No URL')
            
            self.logger.info(f"📰 [{self.items_processed}] Processing article: {title}")
            self.logger.debug(f"   URL: {url}")
            
            # Log item details if debug level
            if self.logger.isEnabledFor(logging.DEBUG):
                content_length = len(adapter.get('content', ''))
                author = adapter.get('author', 'Unknown')
                tags_count = len(adapter.get('tags', []))
                
                self.logger.debug(f"   Author: {author}")
                self.logger.debug(f"   Content length: {content_length} chars")
                self.logger.debug(f"   Tags: {tags_count}")
        
        return item


class StatsLoggingPipeline:
    """Pipeline to log processing statistics at regular intervals"""
    
    def __init__(self):
        self.logger = logging.getLogger('scrapy.pipelines.stats')
        self.items_count = 0
        self.sites_count = 0
        self.last_log_time = datetime.now()
        self.log_interval = 30  # Log every 30 seconds
        self.start_time = datetime.now()
    
    def process_item(self, item, spider):
        """Track item counts and log stats periodically"""
        adapter = ItemAdapter(item)
        
        if adapter.get('name'):  # SiteItem
            self.sites_count += 1
        else:  # PostItem
            self.items_count += 1
        
        # Log stats at regular intervals
        current_time = datetime.now()
        if (current_time - self.last_log_time).total_seconds() >= self.log_interval:
            self._log_current_stats()
            self.last_log_time = current_time
        
        return item
    
    def _log_current_stats(self):
        """Log current processing statistics"""
        current_time = datetime.now()
        elapsed = current_time - self.start_time
        elapsed_minutes = elapsed.total_seconds() / 60
        
        if elapsed_minutes > 0:
            items_per_minute = self.items_count / elapsed_minutes
            sites_per_minute = self.sites_count / elapsed_minutes
        else:
            items_per_minute = 0
            sites_per_minute = 0
        
        self.logger.info(
            f"📈 Processing Stats - "
            f"Articles: {self.items_count} ({items_per_minute:.1f}/min), "
            f"Sites: {self.sites_count} ({sites_per_minute:.1f}/min), "
            f"Runtime: {elapsed}"
        )
