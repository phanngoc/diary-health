import logging
from datetime import datetime
from scrapy.downloadermiddlewares.stats import DownloaderStats


class LoggingMiddleware:
    """Enhanced logging middleware for detailed request/response tracking"""
    
    def __init__(self):
        self.logger = logging.getLogger('scrapy.middleware.logging')
        self.requests_count = 0
        self.responses_count = 0
        self.errors_count = 0
        self.start_time = datetime.now()
    
    def process_request(self, request, spider):
        """Log outgoing requests"""
        self.requests_count += 1
        
        # Log basic request info
        self.logger.debug(f"🔄 [{self.requests_count}] Request: {request.method} {request.url}")
        
        # Log headers if in debug mode
        if hasattr(spider, 'logger') and spider.logger.isEnabledFor(logging.DEBUG):
            self.logger.debug(f"   Headers: {dict(request.headers)}")
        
        return None
    
    def process_response(self, request, response, spider):
        """Log incoming responses"""
        self.responses_count += 1
        
        # Determine log level based on status code
        if 200 <= response.status < 300:
            log_level = logging.DEBUG
            status_emoji = "✅"
        elif 300 <= response.status < 400:
            log_level = logging.INFO
            status_emoji = "🔄"
        else:
            log_level = logging.WARNING
            status_emoji = "⚠️"
        
        # Log response info
        self.logger.log(
            log_level,
            f"{status_emoji} [{self.responses_count}] Response {response.status}: {request.url} "
            f"(Size: {len(response.body)} bytes)"
        )
        
        return response
    
    def process_exception(self, request, exception, spider):
        """Log request exceptions"""
        self.errors_count += 1
        
        self.logger.error(
            f"❌ [{self.errors_count}] Exception for {request.url}: "
            f"{exception.__class__.__name__}: {str(exception)}"
        )
        
        return None


class StatsLoggingMiddleware:
    """Middleware to periodically log spider statistics"""
    
    def __init__(self):
        self.logger = logging.getLogger('scrapy.middleware.stats')
        self.last_log_time = datetime.now()
        self.log_interval = 60  # Log stats every 60 seconds
    
    def process_response(self, request, response, spider):
        """Check if it's time to log statistics"""
        current_time = datetime.now()
        
        # Log stats every minute
        if (current_time - self.last_log_time).total_seconds() >= self.log_interval:
            self._log_stats(spider)
            self.last_log_time = current_time
        
        return response
    
    def _log_stats(self, spider):
        """Log current spider statistics"""
        if hasattr(spider, 'crawler') and hasattr(spider.crawler, 'stats'):
            stats = spider.crawler.stats.get_stats()
            
            # Extract key statistics
            item_count = stats.get('item_scraped_count', 0)
            request_count = stats.get('downloader/request_count', 0)
            response_count = stats.get('downloader/response_count', 0)
            error_count = stats.get('downloader/exception_count', 0)
            
            # Calculate runtime
            start_time = stats.get('start_time')
            if start_time:
                try:
                    # Handle different types of start_time
                    if isinstance(start_time, datetime):
                        runtime = (datetime.now() - start_time).total_seconds()
                    elif isinstance(start_time, (int, float)):
                        # If it's a timestamp
                        runtime = datetime.now().timestamp() - start_time
                    else:
                        # Try to convert to datetime if it's a string or other format
                        start_time_dt = datetime.fromisoformat(str(start_time))
                        runtime = (datetime.now() - start_time_dt).total_seconds()
                    
                    runtime_str = f"{runtime:.1f}s"
                except (ValueError, TypeError, AttributeError):
                    runtime_str = "unknown"
            else:
                runtime_str = "unknown"
            
            self.logger.info(
                f"📊 Stats Update - Runtime: {runtime_str}, "
                f"Items: {item_count}, Requests: {request_count}, "
                f"Responses: {response_count}, Errors: {error_count}"
            )
