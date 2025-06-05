# Financial News Crawler

Scrapy-based crawler for Vietnamese financial news websites with PostgreSQL storage.

## Features

- ✅ Crawls 5 major Vietnamese financial news sites
- ✅ Extracts articles with title, content, author, date, tags
- ✅ Stores data in PostgreSQL with proper schema
- ✅ Handles duplicates and data validation
- ✅ Respectful crawling with delays and user agent rotation
- ✅ Management script for easy operation

## Supported Websites

1. **VnEconomy** (vneconomy.vn) - Economic and financial news
2. **Dân Trí Finance** (fica.dantri.com.vn) - Finance section of Dân Trí
3. **CafeF** (cafef.vn) - Stock market and financial news
4. **Vietnam Finance** (vietnamfinance.vn) - Financial news and analysis
5. **StockBiz** (stockbiz.vn) - Stock market and business news

## Database Schema

### Sites Table
```sql
CREATE TABLE sites (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    base_url VARCHAR(500) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Posts Table
```sql
CREATE TABLE posts (
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
```

## Installation

### 1. Install Python Dependencies

```bash
cd /path/to/project/backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create or update `.env` file in the backend directory:

```env
# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

### 3. Set up Database

```bash
cd crawler
python crawler_manager.py setup
```

### 4. Test Database Connection

```bash
python crawler_manager.py test
```

## Usage

### Running the Crawler

```bash
# Run the financial news crawler
python crawler_manager.py crawl

# Show crawler statistics
python crawler_manager.py stats

# Clean old data (older than 30 days)
python crawler_manager.py clean

# Clean old data (custom days)
python crawler_manager.py clean --days 7
```

### Manual Scrapy Commands

```bash
cd scrapy_project

# Run spider with custom settings
scrapy crawl financial_news -s LOG_LEVEL=DEBUG

# Save to JSON file
scrapy crawl financial_news -o output.json

# Run with custom database settings
scrapy crawl financial_news -s POSTGRES_HOST=localhost -s POSTGRES_PASSWORD=mypass
```

## Configuration

### Scrapy Settings

Key settings in `scrapy_project/settings.py`:

- `DOWNLOAD_DELAY = 2` - Delay between requests
- `CONCURRENT_REQUESTS_PER_DOMAIN = 1` - One request per domain at a time
- `AUTOTHROTTLE_ENABLED = True` - Auto-adjust delays based on response times
- `HTTPCACHE_ENABLED = True` - Cache responses to avoid re-downloading

### Spider Configuration

Each website has specific configuration in `financial_news.py`:

```python
site_configs = {
    'vneconomy.vn': {
        'id': 1,
        'name': 'VnEconomy',
        'article_selectors': {
            'title': 'h1.detail-title, h1.title-detail',
            'content': '.detail-content, .article-content',
            # ... more selectors
        }
    }
    # ... other sites
}
```

## Data Processing Pipeline

1. **ValidationPipeline** - Validates required fields and content quality
2. **DuplicatesPipeline** - Filters duplicate articles based on title + site_id
3. **PostgresPipeline** - Saves data to PostgreSQL with conflict resolution

## Monitoring and Logs

### View Logs
```bash
# Real-time crawler logs
tail -f scrapy_project/scrapy.log

# Filter for errors
grep ERROR scrapy_project/scrapy.log
```

### Statistics Query
```sql
-- Posts per site
SELECT s.name, COUNT(p.id) as post_count 
FROM sites s 
LEFT JOIN posts p ON s.id = p.site_id 
GROUP BY s.name;

-- Recent articles
SELECT title, author, published_date, scraped_at 
FROM posts 
WHERE scraped_at >= NOW() - INTERVAL '24 hours'
ORDER BY scraped_at DESC;

-- Popular tags
SELECT UNNEST(tags) as tag, COUNT(*) as count
FROM posts 
WHERE tags IS NOT NULL 
GROUP BY tag 
ORDER BY count DESC 
LIMIT 20;
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql
   
   # Start PostgreSQL
   sudo systemctl start postgresql
   ```

2. **Permission Denied**
   ```bash
   # Make crawler_manager.py executable
   chmod +x crawler_manager.py
   ```

3. **Module Not Found**
   ```bash
   # Install missing dependencies
   pip install scrapy scrapy-user-agents selenium beautifulsoup4
   ```

4. **Website Blocks Crawler**
   - Check robots.txt compliance
   - Increase delays in settings.py
   - Rotate user agents (already configured)

### Debugging Spider

```bash
# Test specific URL
scrapy shell "https://vneconomy.vn/"

# Debug selectors in Scrapy shell
>>> response.css('h1.detail-title::text').get()
>>> response.css('.article-content p::text').getall()
```

## Scheduling

### Using Cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add entry to run every 6 hours
0 */6 * * * cd /path/to/project/backend/crawler && /usr/bin/python3 crawler_manager.py crawl

# Run daily cleanup at 2 AM
0 2 * * * cd /path/to/project/backend/crawler && /usr/bin/python3 crawler_manager.py clean
```

### Using systemd Timer (Linux)

Create `/etc/systemd/system/financial-crawler.service`:
```ini
[Unit]
Description=Financial News Crawler
After=network.target

[Service]
Type=oneshot
User=your_username
WorkingDirectory=/path/to/project/backend/crawler
ExecStart=/usr/bin/python3 crawler_manager.py crawl
```

Create `/etc/systemd/system/financial-crawler.timer`:
```ini
[Unit]
Description=Run Financial News Crawler every 6 hours
Requires=financial-crawler.service

[Timer]
OnCalendar=*-*-* 00,06,12,18:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start:
```bash
sudo systemctl enable financial-crawler.timer
sudo systemctl start financial-crawler.timer
```

## Performance Optimization

### Database Indexes

The setup script creates indexes for:
- `site_id` for joins
- `published_date` for date filtering
- `scraped_at` for cleanup operations
- Full-text search on `title` and `content`

### Scrapy Optimization

- HTTP caching enabled to avoid re-downloading
- Auto-throttling adjusts delays based on server response
- User agent rotation to avoid blocks
- Concurrent requests limited to be respectful

## Extensions

### Adding New Websites

1. Add domain to `allowed_domains` in spider
2. Add URL to `start_urls`
3. Configure selectors in `site_configs`
4. Update database with new site info

### Custom Data Processing

Create custom pipeline in `pipelines.py`:

```python
class CustomProcessingPipeline:
    def process_item(self, item, spider):
        # Your custom processing logic
        return item
```

Add to `ITEM_PIPELINES` in settings.py.

## API Integration

The crawled data can be accessed via the FastAPI backend:

```python
# Example API endpoint to get latest financial news
@app.get("/api/financial-news")
async def get_financial_news(
    site_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Post)
    if site_id:
        query = query.filter(Post.site_id == site_id)
    
    posts = query.order_by(Post.scraped_at.desc()).limit(limit).all()
    return posts
```
