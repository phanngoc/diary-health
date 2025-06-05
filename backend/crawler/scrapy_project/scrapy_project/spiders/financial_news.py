import scrapy
from itemloaders import ItemLoader
from scrapy_project.items import PostItem, SiteItem
from datetime import datetime
import re
import logging
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup


class FinancialNewsSpider(scrapy.Spider):
    name = 'financial_news'
    allowed_domains = [
        'vneconomy.vn',
        # 'fica.dantri.com.vn', 
        # 'cafef.vn',
        # 'vietnamfinance.vn',
        # 'stockbiz.vn'
    ]
    
    start_urls = [
        'https://vneconomy.vn/',
        # 'https://fica.dantri.com.vn/',
        # 'https://cafef.vn/',
        # 'https://vietnamfinance.vn/',
        # 'https://stockbiz.vn/'
    ]
    
    def __init__(self, *args, **kwargs):
        super(FinancialNewsSpider, self).__init__(*args, **kwargs)
        self.logger = logging.getLogger(self.name)
        self.start_time = datetime.now()
        self.scraped_articles = 0
        self.failed_articles = 0
        self.sites_processed = 0
        
        self.logger.info(f"🚀 Starting {self.name} spider at {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        self.logger.info(f"📋 Configured domains: {', '.join(self.allowed_domains)}")
        self.logger.info(f"🔗 Start URLs: {len(self.start_urls)} URLs to process")
    
    # Site configurations for each domain
    site_configs = {
        'vneconomy.vn': {
            'id': 1,
            'name': 'VnEconomy',
            'article_selectors': {
                'links': 'h3.story__title > a',
                'title': 'h1.detail__title',
                'content': 'div.detail__content',
                'excerpt': 'h2.detail__summary',
                'author': '.detail__author',
                'published_date': 'div.detail__meta',
                'image': 'figure.detail__avatar'
            }
        },
        # 'fica.dantri.com.vn': {
        #     'id': 2,
        #     'name': 'Dân Trí Finance',
        #     'article_selectors': {
        #         'links': 'a[href*="/tai-chinh/"], a[href*="/chung-khoan/"], a[href*="/kinh-doanh/"]',
        #         'title': 'h1.detail-title, h1.title-detail',
        #         'content': '.detail-content, .singular-content',
        #         'excerpt': '.detail-sapo, .sapo',
        #         'author': '.detail-author, .author',
        #         'published_date': '.detail-time, .publish-time',
        #         'image': '.detail-image img, .featured-image img'
        #     }
        # },
        # 'cafef.vn': {
        #     'id': 3,
        #     'name': 'CafeF',
        #     'article_selectors': {
        #         'links': 'a[href*="/chung-khoan-"], a[href*="/tai-chinh-"], a[href*="/kinh-te-"]',
        #         'title': 'h1.title, h1.detail-title',
        #         'content': '.detail-content, .contentwrap',
        #         'excerpt': '.sapo, .detail-sapo',
        #         'author': '.author, .detail-author',
        #         'published_date': '.time, .detail-time',
        #         'image': '.detail-img img, .thumb img'
        #     }
        # },
        # 'vietnamfinance.vn': {
        #     'id': 4,
        #     'name': 'Vietnam Finance',
        #     'article_selectors': {
        #         'links': 'a[href*="/news/"], a[href*="/market/"], a[href*="/stock/"]',
        #         'title': 'h1.entry-title, h1.post-title',
        #         'content': '.entry-content, .post-content',
        #         'excerpt': '.entry-excerpt, .post-excerpt',
        #         'author': '.author-name, .entry-author',
        #         'published_date': '.entry-date, .post-date',
        #         'image': '.entry-thumbnail img, .post-thumbnail img'
        #     }
        # },
        # 'stockbiz.vn': {
        #     'id': 5,
        #     'name': 'StockBiz',
        #     'article_selectors': {
        #         'links': 'a[href*="/news/"], a[href*="/analysis/"], a[href*="/market/"]',
        #         'title': 'h1.post-title, h1.entry-title',
        #         'content': '.post-content, .entry-content',
        #         'excerpt': '.post-excerpt, .entry-excerpt',
        #         'author': '.post-author, .entry-author',
        #         'published_date': '.post-date, .entry-date',
        #         'image': '.post-thumbnail img, .entry-thumbnail img'
        #     }
        # }
    }

    def start_requests(self):
        """Generate initial requests with site registration"""
        self.logger.info(f"🌐 Generating start requests for {len(self.start_urls)} URLs")
        
        for idx, url in enumerate(self.start_urls, 1):
            domain = urlparse(url).netloc
            if domain in self.site_configs:
                self.logger.info(f"📝 [{idx}/{len(self.start_urls)}] Preparing request for {domain}")
                # First, yield a request to register the site
                yield scrapy.Request(
                    url=url,
                    callback=self.register_site,
                    meta={'domain': domain},
                    dont_filter=True
                )
            else:
                self.logger.warning(f"⚠️  Domain {domain} not found in site_configs, skipping")

    def register_site(self, response):
        """Register site information in database"""
        domain = response.meta['domain']
        config = self.site_configs[domain]
        
        self.logger.info(f"🏢 Registering site: {config['name']} ({domain})")
        
        # Create site item
        site_loader = ItemLoader(item=SiteItem(), response=response)
        site_loader.add_value('name', config['name'])
        site_loader.add_value('base_url', f"https://{domain}")
        site_loader.add_value('description', f"Financial news from {config['name']}")
        
        self.sites_processed += 1
        self.logger.info(f"✅ Site registered successfully: {config['name']}")
        
        yield site_loader.load_item()
        
        # Now crawl articles from this site
        yield from self.parse(response)

    def parse(self, response):
        """Parse homepage and extract article links"""
        domain = urlparse(response.url).netloc
        if domain not in self.site_configs:
            self.logger.error(f"❌ Domain {domain} not found in site_configs")
            return
            
        config = self.site_configs[domain]
        selectors = config['article_selectors']
        
        self.logger.info(f"🔍 Parsing homepage for {domain}: {response.url}")
        
        # Extract article links
        article_links = response.css(selectors['links'])
        self.logger.info(f"📰 Found {len(article_links)} article links using selector: {selectors['links']}")
        
        # If no specific selectors work, try generic article link patterns
        if not article_links:
            self.logger.warning(f"⚠️  No articles found with specific selectors, trying generic patterns...")
            article_links = response.css('a[href*="/"]')
            self.logger.info(f"📰 Found {len(article_links)} generic links")
        
        processed_urls = set()
        valid_articles = 0
        
        for link in article_links[:20]:  # Limit to 20 articles per site
            url = link.css('::attr(href)').get()
            if not url:
                continue
                
            # Convert relative URLs to absolute
            full_url = urljoin(response.url, url)
            
            # Check if URL looks like an article URL
            if self.is_article_url(full_url, domain) and full_url not in processed_urls:
                processed_urls.add(full_url)
                valid_articles += 1
                self.logger.debug(f"📄 [{valid_articles}] Queueing article: {full_url}")
                yield response.follow(
                    url=full_url,
                    callback=self.parse_article,
                    meta={
                        'domain': domain,
                        'site_id': config['id']
                    }
                )
        
        self.logger.info(f"✅ Queued {valid_articles} valid articles from {domain}")
        
        # Also try to find pagination or more links
        next_page_selectors = [
            'a.next', '.next-page a', '.pagination .next',
            'a[rel="next"]', '.paging .next a'
        ]
        
        for selector in next_page_selectors:
            next_page = response.css(selector + '::attr(href)').get()
            if next_page:
                self.logger.info(f"🔄 Found next page: {next_page}")
                yield response.follow(
                    url=next_page,
                    callback=self.parse,
                    meta=response.meta
                )
                break

    def is_article_url(self, url, domain):
        """Check if URL looks like an article URL"""
        # Keywords that indicate article URLs
        article_keywords = [
            'news', 'bai-viet', 'tin-tuc', 'article', 'detail',
            'chung-khoan', 'tai-chinh', 'kinh-te', 'doanh-nghiep',
            'market', 'stock', 'finance', 'economy', 'business'
        ]
        
        # Exclude URLs that are likely not articles
        exclude_keywords = [
            'tag', 'category', 'author', 'search', 'page',
            'login', 'register', 'contact', 'about',
            '.jpg', '.png', '.gif', '.pdf', '.doc'
        ]
        
        url_lower = url.lower()
        
        # Check for exclude keywords first
        if any(keyword in url_lower for keyword in exclude_keywords):
            return False
            
        # Check for article keywords or date patterns
        has_article_keyword = any(keyword in url_lower for keyword in article_keywords)
        has_date_pattern = re.search(r'/\d{4}/', url) or re.search(r'/\d{6}/', url)
        
        return has_article_keyword or has_date_pattern

    def parse_article(self, response):
        """Parse individual article page"""
        domain = response.meta['domain']
        site_id = response.meta['site_id']
        
        if domain not in self.site_configs:
            self.logger.error(f"❌ Domain {domain} not found in site_configs for article: {response.url}")
            return
            
        config = self.site_configs[domain]
        selectors = config['article_selectors']
        
        self.logger.debug(f"📖 Parsing article: {response.url}")
        
        # Create item loader
        loader = ItemLoader(item=PostItem(), response=response)
        loader.add_value('url', response.url)
        loader.add_value('scraped_at', datetime.now())
        
        # Extract title
        title_selectors = selectors['title'].split(', ')
        title = None
        for selector in title_selectors:
            title = response.css(f'{selector}::text').get()
            if title:
                self.logger.debug(f"✅ Title found with selector '{selector}': {title[:50]}...")
                break
        
        if not title:
            # Fallback to meta title or h1
            title = (response.css('title::text').get() or 
                    response.css('h1::text').get() or 
                    response.css('meta[property="og:title"]::attr(content)').get())
            if title:
                self.logger.debug(f"✅ Title found with fallback method: {title[:50]}...")
        
        if title:
            loader.add_value('title', title.strip())
        else:
            # Skip articles without titles
            self.logger.warning(f"⚠️  No title found for article: {response.url}")
            self.failed_articles += 1
            return
        
        # Extract content using BeautifulSoup for better HTML parsing
        content_selectors = selectors['content'].split(',')
        soup = BeautifulSoup(response.body, "html.parser")
        content = None
        
        for selector in content_selectors:
            html_content = soup.select_one(selector.strip())
            self.logger.debug(f"🔍 Trying content selector: {selector.strip()}")
            if html_content:
                # Get all text, preserving paragraphs
                content = '\n'.join(p.get_text(strip=True) for p in soup.find_all(['p', 'li']) if p.get_text(strip=True))
                # Fallback: if no <p> or <li>, get all text
                if not content.strip():
                    content = soup.get_text(separator='\n', strip=True)
                if content.strip():
                    self.logger.debug(f"✅ Content found: {len(content)} characters")
                    break

        if content:
            loader.add_value('content', content)
        else:
            self.logger.warning(f"⚠️  No content found for article: {response.url}")
        
        # Extract excerpt/sapo
        excerpt_selectors = selectors['excerpt'].split(', ')
        for selector in excerpt_selectors:
            excerpt = response.css(f'{selector}::text').get()
            if excerpt:
                loader.add_value('excerpt', excerpt.strip())
                self.logger.debug(f"✅ Excerpt found with selector '{selector}'")
                break
        
        # Extract author
        author_selectors = selectors['author'].split(', ')
        for selector in author_selectors:
            author = response.css(f'{selector}::text').get()
            if author:
                loader.add_value('author', author.strip())
                self.logger.debug(f"✅ Author found: {author.strip()}")
                break
        
        # Extract published date
        date_selectors = selectors['published_date'].split(', ')
        for selector in date_selectors:
            date_text = (response.css(f'{selector}::text').get() or 
                        response.css(f'{selector}::attr(datetime)').get())
            if date_text:
                parsed_date = self.parse_date(date_text.strip())
                if parsed_date:
                    loader.add_value('published_date', parsed_date)
                    self.logger.debug(f"✅ Published date found: {parsed_date}")
                    break
        
        # Extract image
        image_selectors = selectors['image'].split(', ')
        for selector in image_selectors:
            image_url = response.css(f'{selector}::attr(src)').get()
            if image_url:
                full_image_url = urljoin(response.url, image_url)
                loader.add_value('image_url', full_image_url)
                self.logger.debug(f"✅ Image found: {full_image_url}")
                break
        
        # Extract tags (try meta keywords or category links)
        tags = []
        
        # Try meta keywords
        meta_keywords = response.css('meta[name="keywords"]::attr(content)').get()
        if meta_keywords:
            tags.extend([tag.strip() for tag in meta_keywords.split(',')])
        
        # Try category/tag links
        tag_links = response.css('.tags a::text, .categories a::text, .tag a::text').getall()
        if tag_links:
            tags.extend([tag.strip() for tag in tag_links])
        
        if tags:
            loader.add_value('tags', tags[:10])  # Limit to 10 tags
            self.logger.debug(f"✅ Tags found: {', '.join(tags[:5])}{'...' if len(tags) > 5 else ''}")
        
        # Load the item and set site_id directly (not through loader to avoid array conversion)
        item = loader.load_item()
        item['site_id'] = site_id
        
        self.scraped_articles += 1
        self.logger.info(f"✅ [{self.scraped_articles}] Article scraped successfully: {title[:50]}...")
        
        yield item

    def parse_date(self, date_string):
        """Parse date string into datetime object"""
        # Common Vietnamese date patterns
        date_patterns = [
            r'(\d{1,2})/(\d{1,2})/(\d{4})',  # DD/MM/YYYY
            r'(\d{4})-(\d{1,2})-(\d{1,2})',  # YYYY-MM-DD
            r'(\d{1,2})-(\d{1,2})-(\d{4})',  # DD-MM-YYYY
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, date_string)
            if match:
                try:
                    if pattern == date_patterns[1]:  # YYYY-MM-DD
                        year, month, day = map(int, match.groups())
                    else:  # DD/MM/YYYY or DD-MM-YYYY
                        day, month, year = map(int, match.groups())
                    
                    return datetime(year, month, day)
                except (ValueError, TypeError):
                    continue
        
        # Try to parse ISO format
        try:
            return datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        except:
            pass
        
        return None

    def closed(self, reason):
        """Log final statistics when spider closes"""
        end_time = datetime.now()
        duration = end_time - self.start_time
        
        self.logger.info("=" * 80)
        self.logger.info(f"🏁 Spider {self.name} finished!")
        self.logger.info(f"📊 FINAL STATISTICS:")
        self.logger.info(f"   • Start time: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        self.logger.info(f"   • End time: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        self.logger.info(f"   • Duration: {duration}")
        self.logger.info(f"   • Sites processed: {self.sites_processed}")
        self.logger.info(f"   • Articles scraped: {self.scraped_articles}")
        self.logger.info(f"   • Failed articles: {self.failed_articles}")
        self.logger.info(f"   • Success rate: {(self.scraped_articles / max(self.scraped_articles + self.failed_articles, 1) * 100):.1f}%")
        self.logger.info(f"   • Reason for closure: {reason}")
        
        if self.scraped_articles > 0:
            articles_per_minute = self.scraped_articles / (duration.total_seconds() / 60)
            self.logger.info(f"   • Average rate: {articles_per_minute:.2f} articles/minute")
        
        self.logger.info("=" * 80)
