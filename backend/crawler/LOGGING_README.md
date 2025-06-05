# Scrapy Enhanced Logging System

This enhanced logging system provides comprehensive logging, monitoring, and management capabilities for the Scrapy financial news crawler.

## Features

### 🔍 **Enhanced Logging**
- **Timestamped Log Files**: Each run creates a uniquely timestamped log file
- **Structured Logging**: Detailed logs with emojis for easy visual parsing
- **Multiple Log Levels**: DEBUG, INFO, WARNING, ERROR with appropriate filtering
- **Pipeline Logging**: Track item processing through each pipeline stage
- **Statistics Tracking**: Real-time statistics during spider execution

### 📊 **Log Analysis**
- **Performance Metrics**: Articles/minute, success rates, runtime analysis
- **Error Tracking**: Automatic error and warning collection
- **Historical Analysis**: Analyze multiple log files for trends
- **Success/Failure Rates**: Track spider reliability over time

### 🔄 **Log Management**
- **Automatic Rotation**: Size and age-based log rotation
- **Compression**: Archive old logs with gzip compression
- **Cleanup**: Automatic removal of very old archived logs
- **Real-time Monitoring**: Follow logs as they're written

## File Structure

```
crawler/
├── run_scrapy.sh              # Enhanced runner script
├── log_manager.py            # Log management utility
├── logs/                     # Log files directory
│   ├── scrapy_20250605_143022.log
│   ├── scrapy_20250605_151534.log
│   └── archive/              # Archived/compressed logs
│       ├── scrapy_20250604_120000.log.gz
│       └── scrapy_20250603_090000.log.gz
└── scrapy_project/
    ├── settings.py           # Enhanced logging configuration
    ├── pipelines.py          # Logging pipelines added
    ├── middlewares_logging.py # Custom logging middleware
    └── spiders/
        └── financial_news.py # Enhanced spider with detailed logging
```

## Quick Start

### 1. Run Scrapy with Enhanced Logging

```bash
# Basic run with default settings
./run_scrapy.sh

# Run with custom database settings
./run_scrapy.sh -h localhost -d mydb -u myuser -w mypass

# Run with log rotation and real-time monitoring
./run_scrapy.sh -r -f

# Run in debug mode with post-run analysis
./run_scrapy.sh -l DEBUG -a
```

### 2. Monitor Logs in Real-time

```bash
# Follow the latest log file
python3 log_manager.py tail -f

# Show last 100 lines
python3 log_manager.py tail -n 100
```

### 3. Analyze Historical Performance

```bash
# Analyze all log files
python3 log_manager.py analyze

# Analyze specific pattern
python3 log_manager.py analyze --pattern "scrapy_202406*.log"
```

### 4. Manage Log Files

```bash
# Rotate logs (compress files > 50MB or > 30 days old)
python3 log_manager.py rotate

# Cleanup archives older than 90 days
python3 log_manager.py cleanup

# Custom rotation settings
python3 log_manager.py rotate --max-size 100 --max-age 7
```

## Log Format Examples

### Spider Startup
```
INFO: 2025-06-05 14:30:22 [financial_news] 🚀 Starting financial_news spider at 2025-06-05 14:30:22
INFO: 2025-06-05 14:30:22 [financial_news] 📋 Configured domains: vneconomy.vn
INFO: 2025-06-05 14:30:22 [financial_news] 🔗 Start URLs: 1 URLs to process
```

### Site Registration
```
INFO: 2025-06-05 14:30:25 [financial_news] 🏢 Registering site: VnEconomy (vneconomy.vn)
INFO: 2025-06-05 14:30:25 [financial_news] ✅ Site registered successfully: VnEconomy
```

### Article Processing
```
INFO: 2025-06-05 14:30:28 [financial_news] 🔍 Parsing homepage for vneconomy.vn: https://vneconomy.vn/
INFO: 2025-06-05 14:30:28 [financial_news] 📰 Found 25 article links using selector: h3.story__title > a
INFO: 2025-06-05 14:30:30 [financial_news] ✅ [1] Article scraped successfully: Thị trường chứng khoán: Cổ phiếu ngân hàng dẫn dắt...
INFO: 2025-06-05 14:30:32 [financial_news] ✅ [2] Article scraped successfully: Kinh tế Việt Nam: Triển vọng tăng trưởng năm 2025...
```

### Pipeline Processing
```
INFO: 2025-06-05 14:30:30 [scrapy.pipelines.logging] 📰 [1] Processing article: Thị trường chứng khoán: Cổ phiếu ngân hàng dẫn dắt...
DEBUG: 2025-06-05 14:30:30 [scrapy.pipelines.logging]    URL: https://vneconomy.vn/thi-truong-chung-khoan-123456.htm
DEBUG: 2025-06-05 14:30:30 [scrapy.pipelines.logging]    Author: Nguyễn Văn A
DEBUG: 2025-06-05 14:30:30 [scrapy.pipelines.logging]    Content length: 2847 chars
```

### Statistics Updates
```
INFO: 2025-06-05 14:32:15 [scrapy.pipelines.stats] 📈 Processing Stats - Articles: 15 (5.2/min), Sites: 1 (0.3/min), Runtime: 0:02:53
INFO: 2025-06-05 14:33:45 [scrapy.middleware.stats] 📊 Stats Update - Runtime: 175.3s, Items: 23, Requests: 89, Responses: 87, Errors: 2
```

### Final Summary
```
INFO: 2025-06-05 14:35:22 [financial_news] 🏁 Spider financial_news finished!
INFO: 2025-06-05 14:35:22 [financial_news] 📊 FINAL STATISTICS:
INFO: 2025-06-05 14:35:22 [financial_news]    • Start time: 2025-06-05 14:30:22
INFO: 2025-06-05 14:35:22 [financial_news]    • End time: 2025-06-05 14:35:22
INFO: 2025-06-05 14:35:22 [financial_news]    • Duration: 0:05:00.123456
INFO: 2025-06-05 14:35:22 [financial_news]    • Sites processed: 1
INFO: 2025-06-05 14:35:22 [financial_news]    • Articles scraped: 23
INFO: 2025-06-05 14:35:22 [financial_news]    • Failed articles: 2
INFO: 2025-06-05 14:35:22 [financial_news]    • Success rate: 92.0%
INFO: 2025-06-05 14:35:22 [financial_news]    • Average rate: 4.60 articles/minute
```

## Configuration Options

### run_scrapy.sh Options

| Option | Description | Default |
|--------|-------------|---------|
| `-s, --spider` | Spider name | financial_news |
| `-h, --host` | PostgreSQL host | localhost |
| `-p, --port` | PostgreSQL port | 5432 |
| `-d, --database` | Database name | postgres |
| `-u, --user` | Database user | postgres |
| `-w, --password` | Database password | password |
| `-l, --log-level` | Log level (DEBUG/INFO/WARNING/ERROR) | INFO |
| `-r, --rotate-logs` | Rotate logs before running | false |
| `-f, --follow-logs` | Follow logs in real-time | false |
| `-a, --analyze-logs` | Analyze logs after completion | false |

### log_manager.py Commands

| Command | Description |
|---------|-------------|
| `rotate` | Rotate log files based on size/age |
| `cleanup` | Remove old archived logs |
| `tail` | View recent log entries |
| `analyze` | Analyze log files for statistics |

## Advanced Usage

### Custom Log Analysis

```bash
# Analyze only today's logs
python3 log_manager.py analyze --pattern "scrapy_$(date +%Y%m%d)*.log"

# Get specific statistics
python3 log_manager.py analyze | grep "Success rate"
```

### Automated Log Management (Cron Job)

```bash
# Add to crontab for daily log rotation
0 2 * * * cd /path/to/crawler && python3 log_manager.py rotate

# Weekly cleanup of old archives
0 3 * * 0 cd /path/to/crawler && python3 log_manager.py cleanup
```

### Integration with Monitoring

```bash
# Run spider and get exit code for monitoring
./run_scrapy.sh -l INFO
echo "Exit code: $?"

# Extract metrics for monitoring systems
python3 log_manager.py analyze | grep -E "(articles|Success rate|Duration)"
```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   chmod +x run_scrapy.sh log_manager.py
   ```

2. **Log Directory Not Created**
   ```bash
   mkdir -p logs
   ```

3. **Python Path Issues**
   ```bash
   # Use full path to Python
   /usr/bin/python3 log_manager.py analyze
   ```

4. **Large Log Files**
   ```bash
   # Rotate immediately if logs are too large
   python3 log_manager.py rotate --max-size 10
   ```

### Log File Locations

- **Active logs**: `logs/scrapy_YYYYMMDD_HHMMSS.log`
- **Archived logs**: `logs/archive/scrapy_YYYYMMDD_HHMMSS_TIMESTAMP.log.gz`
- **Configuration**: `scrapy_project/settings.py`

### Performance Tips

1. **Log Level**: Use INFO for production, DEBUG for troubleshooting
2. **Rotation**: Rotate logs regularly to prevent disk space issues
3. **Monitoring**: Use real-time monitoring for long-running spiders
4. **Analysis**: Run periodic analysis to track performance trends

## Example Workflow

```bash
# 1. Rotate old logs
python3 log_manager.py rotate

# 2. Run spider with monitoring
./run_scrapy.sh -r -f -a

# 3. Analyze results
python3 log_manager.py analyze

# 4. Check for issues
python3 log_manager.py tail -n 50 | grep -E "(ERROR|WARNING)"
```

This logging system provides comprehensive monitoring and management capabilities for your Scrapy spiders, making it easy to track performance, debug issues, and maintain your crawling infrastructure.
