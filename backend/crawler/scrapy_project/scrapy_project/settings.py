# Scrapy settings for scrapy_project project
#
# For simplicity, this file contains only settings considered important or
# commonly used. You can find more settings consulting the documentation:
#
#     https://docs.scrapy.org/en/latest/topics/settings.html
#     https://docs.scrapy.org/en/latest/topics/downloader-middleware.html
#     https://docs.scrapy.org/en/latest/topics/spider-middleware.html

import os
import logging
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BOT_NAME = 'scrapy_project'

SPIDER_MODULES = ['scrapy_project.spiders']
NEWSPIDER_MODULE = 'scrapy_project.spiders'

# Obey robots.txt rules
ROBOTSTXT_OBEY = False  # Set to False for financial news sites

# Configure pipelines
ITEM_PIPELINES = {
    'scrapy_project.pipelines.LoggingPipeline': 100,
    'scrapy_project.pipelines.ValidationPipeline': 200,
    'scrapy_project.pipelines.DuplicatesPipeline': 300,
    'scrapy_project.pipelines.PostgresPipeline': 400,
    'scrapy_project.pipelines.StatsLoggingPipeline': 500,
}

# Configure a delay for requests for the same website (default: 0)
# See https://docs.scrapy.org/en/latest/topics/settings.html#download-delay
# See also autothrottle settings and docs
DOWNLOAD_DELAY = 2
# The download delay setting will honor only one of:
CONCURRENT_REQUESTS_PER_DOMAIN = 1
CONCURRENT_REQUESTS_PER_IP = 1

# Disable cookies (enabled by default)
COOKIES_ENABLED = False

# Disable Telnet Console (enabled by default)
TELNETCONSOLE_ENABLED = False

# Override the default request headers:
DEFAULT_REQUEST_HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}

# Enable or disable spider middlewares
# See https://docs.scrapy.org/en/latest/topics/spider-middleware.html
SPIDER_MIDDLEWARES = {
    'scrapy_project.middlewares.ScrapyProjectSpiderMiddleware': 543,
}

# Enable or disable downloader middlewares
# See https://docs.scrapy.org/en/latest/topics/downloader-middleware.html
DOWNLOADER_MIDDLEWARES = {
    'scrapy_project.middlewares.ScrapyProjectDownloaderMiddleware': 543,
    'scrapy_project.middlewares.RandomDelayMiddleware': 550,
    'scrapy_project.middlewares_logging.LoggingMiddleware': 560,
    'scrapy_project.middlewares_logging.StatsLoggingMiddleware': 570,
    'scrapy.downloadermiddlewares.useragent.UserAgentMiddleware': None,
    'scrapy_user_agents.middlewares.RandomUserAgentMiddleware': 400,
}

# Enable and configure the AutoThrottle extension (disabled by default)
# See https://docs.scrapy.org/en/latest/topics/autothrottle.html
AUTOTHROTTLE_ENABLED = True
# The initial download delay
AUTOTHROTTLE_START_DELAY = 1
# The maximum download delay to be set in case of high latencies
AUTOTHROTTLE_MAX_DELAY = 10
# The average number of requests Scrapy should be sending in parallel to
# each remote server
AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0
# Enable showing throttling stats for every response received:
AUTOTHROTTLE_DEBUG = True

# Enable and configure HTTP caching (disabled by default)
# See https://docs.scrapy.org/en/latest/topics/downloader-middleware.html#httpcache-middleware-settings
HTTPCACHE_ENABLED = True
HTTPCACHE_EXPIRATION_SECS = 3600
HTTPCACHE_DIR = 'httpcache'
HTTPCACHE_IGNORE_HTTP_CODES = [503, 504, 505, 500, 403, 404, 408, 429]

# PostgreSQL Database settings
POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
POSTGRES_PORT = int(os.getenv('POSTGRES_PORT', 5432))
POSTGRES_DB = os.getenv('POSTGRES_DB', 'postgres')
POSTGRES_USER = os.getenv('POSTGRES_USER', 'postgres')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'password')

# Random delay settings
RANDOM_DELAY_RANGE = [1, 3]

# Log level
LOG_LEVEL = 'INFO'

# Create logs directory if it doesn't exist
LOGS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
os.makedirs(LOGS_DIR, exist_ok=True)

# Generate timestamp for log file
timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
LOG_FILE = os.path.join(LOGS_DIR, f'scrapy_{timestamp}.log')

# Configure logging
LOG_ENABLED = True
LOG_ENCODING = 'utf-8'
LOG_STDOUT = False  # Set to False to prevent duplicate console output
LOG_FORMAT = '%(levelname)s: %(asctime)s [%(name)s] %(message)s'
LOG_DATEFORMAT = '%Y-%m-%d %H:%M:%S'

# Custom logging configuration
LOG_SETTINGS = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'detailed': {
            'format': '%(asctime)s [%(name)s] %(levelname)s: %(message)s',
            'datefmt': '%Y-%m-%d %H:%M:%S'
        },
        'simple': {
            'format': '%(levelname)s: %(message)s'
        }
    },
    'handlers': {
        'file': {
            'class': 'logging.FileHandler',
            'filename': LOG_FILE,
            'mode': 'a',
            'encoding': 'utf-8',
            'formatter': 'detailed',
            'level': 'DEBUG'
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
            'level': 'INFO'
        }
    },
    'loggers': {
        'scrapy': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': False
        },
        'scrapy.core.scraper': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False
        },
        'scrapy.spiders': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': False
        }
    },
    'root': {
        'handlers': ['file', 'console'],
        'level': 'INFO'
    }
}

# Request timeout
DOWNLOAD_TIMEOUT = 30

# Retry settings
RETRY_ENABLED = True
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 408, 429]

# Set settings whose default value is deprecated to a future-proof value
REQUEST_FINGERPRINTER_IMPLEMENTATION = '2.7'
TWISTED_REACTOR = 'twisted.internet.asyncioreactor.AsyncioSelectorReactor'
