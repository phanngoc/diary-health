#!/usr/bin/env python3
"""
Financial News Crawler Management Script
Run with: python crawler_manager.py [command]

Commands:
- crawl: Run the financial news crawler
- setup: Set up database tables
- test: Test database connection
- clean: Clean old data
"""

import os
import sys
import subprocess
import psycopg2
from datetime import datetime, timedelta
import argparse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': int(os.getenv('POSTGRES_PORT', 5432)),
    'database': os.getenv('POSTGRES_DB', 'postgres'),
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'password': os.getenv('POSTGRES_PASSWORD', 'password')
}

SCRAPY_PROJECT_PATH = os.path.join(os.path.dirname(__file__), 'scrapy_project')


def test_database_connection():
    """Test database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Database connection successful!")
        print(f"PostgreSQL version: {version[0]}")
        
        # Check if tables exist
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('sites', 'posts');
        """)
        
        tables = cursor.fetchall()
        if tables:
            print(f"✅ Found tables: {[table[0] for table in tables]}")
        else:
            print("⚠️  No crawler tables found. Run 'setup' command first.")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


def setup_database():
    """Set up database tables"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
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
        
        # Create indexes
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_posts_site_id ON posts(site_id);",
            "CREATE INDEX IF NOT EXISTS idx_posts_published_date ON posts(published_date);",
            "CREATE INDEX IF NOT EXISTS idx_posts_scraped_at ON posts(scraped_at);",
            "CREATE INDEX IF NOT EXISTS idx_sites_name ON sites(name);",
            "CREATE INDEX IF NOT EXISTS idx_posts_title_gin ON posts USING gin(to_tsvector('english', title));",
            "CREATE INDEX IF NOT EXISTS idx_posts_content_gin ON posts USING gin(to_tsvector('english', content));"
        ]
        
        print("📊 Creating database tables...")
        cursor.execute(sites_table)
        cursor.execute(posts_table)
        
        print("📊 Creating indexes...")
        for index in indexes:
            cursor.execute(index)
        
        # Insert initial site data
        print("📊 Inserting initial site data...")
        sites_data = [
            (1, 'VnEconomy', 'https://vneconomy.vn', 'Vietnam Economic News'),
            (2, 'Dân Trí Finance', 'https://fica.dantri.com.vn', 'Dân Trí Financial News'),
            (3, 'CafeF', 'https://cafef.vn', 'CafeF Financial News'),
            (4, 'Vietnam Finance', 'https://vietnamfinance.vn', 'Vietnam Finance News'),
            (5, 'StockBiz', 'https://stockbiz.vn', 'StockBiz Financial News')
        ]
        
        for site_data in sites_data:
            cursor.execute("""
                INSERT INTO sites (id, name, base_url, description)
                VALUES (%s, %s, %s, %s);
            """, site_data)
        
        conn.commit()
        conn.close()
        
        print("✅ Database setup completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        return False


def run_crawler():
    """Run the financial news crawler"""
    if not os.path.exists(SCRAPY_PROJECT_PATH):
        print(f"❌ Scrapy project not found at: {SCRAPY_PROJECT_PATH}")
        return False
    
    print("🕷️  Starting financial news crawler...")
    print(f"📂 Project path: {SCRAPY_PROJECT_PATH}")
    
    try:
        # Change to scrapy project directory and run spider
        cmd = [
            'scrapy', 'crawl', 'financial_news',
            '-s', 'LOG_LEVEL=DEBUG',
            '-s', f'POSTGRES_HOST={DB_CONFIG["host"]}',
            '-s', f'POSTGRES_PORT={DB_CONFIG["port"]}',
            '-s', f'POSTGRES_DB={DB_CONFIG["database"]}',
            '-s', f'POSTGRES_USER={DB_CONFIG["user"]}',
            '-s', f'POSTGRES_PASSWORD={DB_CONFIG["password"]}'
        ]
        
        result = subprocess.run(
            cmd,
            cwd=SCRAPY_PROJECT_PATH,
            capture_output=False,
            text=True
        )
        
        if result.returncode == 0:
            print("✅ Crawler completed successfully!")
            print("Output:", result.stdout[-500:])  # Show last 500 chars
        else:
            print("❌ Crawler failed!")
            print("Error:", result.stderr)
            
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ Failed to run crawler: {e}")
        return False


def clean_old_data(days=30):
    """Clean old scraped data"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        cutoff_date = datetime.now() - timedelta(days=days)
        
        cursor.execute("""
            DELETE FROM posts 
            WHERE scraped_at < %s;
        """, (cutoff_date,))
        
        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()
        
        print(f"✅ Cleaned {deleted_count} posts older than {days} days")
        return True
        
    except Exception as e:
        print(f"❌ Failed to clean old data: {e}")
        return False


def show_stats():
    """Show crawler statistics"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Site statistics
        cursor.execute("""
            SELECT s.name, COUNT(p.id) as post_count,
                   MAX(p.scraped_at) as last_scraped
            FROM sites s
            LEFT JOIN posts p ON s.id = p.site_id
            GROUP BY s.id, s.name
            ORDER BY post_count DESC;
        """)
        
        print("\n📊 Crawler Statistics:")
        print("-" * 60)
        print(f"{'Site':<20} {'Posts':<10} {'Last Scraped':<25}")
        print("-" * 60)
        
        for row in cursor.fetchall():
            site_name, post_count, last_scraped = row
            last_scraped_str = last_scraped.strftime('%Y-%m-%d %H:%M') if last_scraped else 'Never'
            print(f"{site_name:<20} {post_count:<10} {last_scraped_str:<25}")
        
        # Total statistics
        cursor.execute("SELECT COUNT(*) FROM posts;")
        total_posts = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT COUNT(*) FROM posts 
            WHERE scraped_at >= NOW() - INTERVAL '24 hours';
        """)
        recent_posts = cursor.fetchone()[0]
        
        print("-" * 60)
        print(f"Total posts: {total_posts}")
        print(f"Posts in last 24h: {recent_posts}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Failed to get statistics: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description='Financial News Crawler Manager')
    parser.add_argument('command', choices=['crawl', 'setup', 'test', 'clean', 'stats'],
                       help='Command to execute')
    parser.add_argument('--days', type=int, default=30,
                       help='Days to keep data (for clean command)')
    
    args = parser.parse_args()
    
    print("🚀 Financial News Crawler Manager")
    print(f"Database: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
    print("-" * 50)
    
    if args.command == 'test':
        test_database_connection()
        
    elif args.command == 'setup':
        if test_database_connection():
            setup_database()
        
    elif args.command == 'crawl':
        if test_database_connection():
            run_crawler()
            show_stats()
        
    elif args.command == 'clean':
        if test_database_connection():
            clean_old_data(args.days)
            
    elif args.command == 'stats':
        if test_database_connection():
            show_stats()


if __name__ == '__main__':
    main()
