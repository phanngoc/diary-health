#!/usr/bin/env python3
"""
Scrapy Log Manager and Monitor

This script provides utilities for managing Scrapy log files:
- Log rotation based on size and age
- Log monitoring and analysis
- Real-time log viewing
- Statistics extraction from logs
"""

import os
import gzip
import glob
import argparse
import re
from datetime import datetime, timedelta
from pathlib import Path
import subprocess
import time


class ScrapyLogManager:
    def __init__(self, logs_dir):
        self.logs_dir = Path(logs_dir)
        self.logs_dir.mkdir(exist_ok=True)
        
    def rotate_logs(self, max_size_mb=50, max_age_days=30, compress=True):
        """
        Rotate log files based on size and age
        
        Args:
            max_size_mb (int): Maximum size in MB before rotation
            max_age_days (int): Maximum age in days before archiving
            compress (bool): Whether to compress old logs
        """
        print(f"🔄 Starting log rotation in: {self.logs_dir}")
        
        # Find all log files
        log_files = list(self.logs_dir.glob("scrapy_*.log"))
        
        for log_file in log_files:
            # Check file size
            size_mb = log_file.stat().st_size / (1024 * 1024)
            
            # Check file age
            file_age = datetime.now() - datetime.fromtimestamp(log_file.stat().st_mtime)
            
            should_rotate = False
            reason = ""
            
            if size_mb > max_size_mb:
                should_rotate = True
                reason = f"size ({size_mb:.1f}MB > {max_size_mb}MB)"
            elif file_age.days > max_age_days:
                should_rotate = True
                reason = f"age ({file_age.days} days > {max_age_days} days)"
            
            if should_rotate:
                self._rotate_file(log_file, compress, reason)
        
        print("✅ Log rotation completed")
    
    def _rotate_file(self, log_file, compress, reason):
        """Rotate a single log file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if compress:
            archive_name = f"{log_file.stem}_{timestamp}.log.gz"
            archive_path = self.logs_dir / "archive" / archive_name
            archive_path.parent.mkdir(exist_ok=True)
            
            # Compress the file
            with open(log_file, 'rb') as f_in:
                with gzip.open(archive_path, 'wb') as f_out:
                    f_out.writelines(f_in)
            
            print(f"📦 Compressed and archived: {log_file.name} -> {archive_name} ({reason})")
        else:
            archive_name = f"{log_file.stem}_{timestamp}.log"
            archive_path = self.logs_dir / "archive" / archive_name
            archive_path.parent.mkdir(exist_ok=True)
            log_file.rename(archive_path)
            print(f"📁 Archived: {log_file.name} -> {archive_name} ({reason})")
        
        # Remove original file if it was compressed
        if compress and log_file.exists():
            log_file.unlink()
    
    def cleanup_old_archives(self, max_archive_age_days=90):
        """Remove old archived log files"""
        archive_dir = self.logs_dir / "archive"
        if not archive_dir.exists():
            return
        
        cutoff_date = datetime.now() - timedelta(days=max_archive_age_days)
        cleaned_count = 0
        
        for archive_file in archive_dir.glob("*"):
            file_age = datetime.fromtimestamp(archive_file.stat().st_mtime)
            if file_age < cutoff_date:
                archive_file.unlink()
                cleaned_count += 1
                print(f"🗑️  Removed old archive: {archive_file.name}")
        
        if cleaned_count > 0:
            print(f"✅ Cleaned up {cleaned_count} old archive files")
        else:
            print("📂 No old archives to clean up")
    
    def get_latest_log(self):
        """Get the path to the most recent log file"""
        log_files = list(self.logs_dir.glob("scrapy_*.log"))
        if not log_files:
            return None
        
        # Sort by modification time
        latest_log = max(log_files, key=lambda f: f.stat().st_mtime)
        return latest_log
    
    def tail_log(self, lines=50, follow=False):
        """Display the last N lines of the latest log file"""
        latest_log = self.get_latest_log()
        if not latest_log:
            print("❌ No log files found")
            return
        
        print(f"📖 Viewing log: {latest_log.name}")
        print("=" * 80)
        
        if follow:
            # Use tail -f for real-time monitoring
            try:
                subprocess.run(["tail", "-f", "-n", str(lines), str(latest_log)])
            except KeyboardInterrupt:
                print("\n👋 Log monitoring stopped")
        else:
            # Read last N lines
            with open(latest_log, 'r', encoding='utf-8') as f:
                lines_list = f.readlines()
                for line in lines_list[-lines:]:
                    print(line.rstrip())
    
    def analyze_logs(self, log_pattern="scrapy_*.log"):
        """Analyze log files and extract statistics"""
        log_files = list(self.logs_dir.glob(log_pattern))
        if not log_files:
            print("❌ No log files found")
            return
        
        print(f"📊 Analyzing {len(log_files)} log files...")
        
        stats = {
            'total_runs': len(log_files),
            'successful_runs': 0,
            'failed_runs': 0,
            'total_articles': 0,
            'total_sites': 0,
            'errors': [],
            'warnings': [],
            'avg_runtime': timedelta(),
            'runs_by_date': {}
        }
        
        for log_file in log_files:
            run_stats = self._analyze_single_log(log_file)
            
            # Aggregate statistics
            if run_stats['success']:
                stats['successful_runs'] += 1
            else:
                stats['failed_runs'] += 1
            
            stats['total_articles'] += run_stats.get('articles_scraped', 0)
            stats['total_sites'] += run_stats.get('sites_processed', 0)
            stats['errors'].extend(run_stats.get('errors', []))
            stats['warnings'].extend(run_stats.get('warnings', []))
            
            if run_stats.get('runtime'):
                stats['avg_runtime'] += run_stats['runtime']
            
            # Group by date
            date_key = run_stats['start_time'].date() if run_stats.get('start_time') else 'unknown'
            if date_key not in stats['runs_by_date']:
                stats['runs_by_date'][date_key] = 0
            stats['runs_by_date'][date_key] += 1
        
        # Calculate averages
        if stats['total_runs'] > 0:
            stats['avg_runtime'] = stats['avg_runtime'] / stats['total_runs']
        
        self._print_analysis_results(stats)
        return stats
    
    def _analyze_single_log(self, log_file):
        """Analyze a single log file"""
        stats = {
            'success': False,
            'articles_scraped': 0,
            'sites_processed': 0,
            'errors': [],
            'warnings': [],
            'start_time': None,
            'end_time': None,
            'runtime': None
        }
        
        try:
            with open(log_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Extract start time
                start_match = re.search(r'Starting (\w+) spider at (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})', content)
                if start_match:
                    try:
                        stats['start_time'] = datetime.strptime(start_match.group(2), '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        pass
                
                # Extract final statistics
                articles_match = re.search(r'Articles scraped: (\d+)', content)
                if articles_match:
                    stats['articles_scraped'] = int(articles_match.group(1))
                
                sites_match = re.search(r'Sites processed: (\d+)', content)
                if sites_match:
                    stats['sites_processed'] = int(sites_match.group(1))
                
                # Check for successful completion
                if 'Spider finished' in content or 'finished' in content.lower():
                    stats['success'] = True
                
                # Extract errors and warnings
                error_matches = re.findall(r'ERROR: (.+)', content)
                stats['errors'] = error_matches[:10]  # Limit to first 10
                
                warning_matches = re.findall(r'WARNING: (.+)', content)
                stats['warnings'] = warning_matches[:10]  # Limit to first 10
                
                # Extract duration
                duration_match = re.search(r'Duration: (.+)', content)
                if duration_match:
                    try:
                        # Parse duration string (e.g., "0:05:23.123456")
                        duration_str = duration_match.group(1)
                        time_parts = duration_str.split(':')
                        if len(time_parts) >= 3:
                            hours = int(time_parts[0])
                            minutes = int(time_parts[1])
                            seconds = float(time_parts[2])
                            stats['runtime'] = timedelta(hours=hours, minutes=minutes, seconds=seconds)
                    except (ValueError, IndexError):
                        pass
                
        except Exception as e:
            print(f"❌ Error analyzing {log_file.name}: {e}")
        
        return stats
    
    def _print_analysis_results(self, stats):
        """Print formatted analysis results"""
        print("\n" + "=" * 80)
        print("📊 LOG ANALYSIS RESULTS")
        print("=" * 80)
        
        print(f"📈 OVERALL STATISTICS:")
        print(f"   • Total runs: {stats['total_runs']}")
        print(f"   • Successful runs: {stats['successful_runs']}")
        print(f"   • Failed runs: {stats['failed_runs']}")
        print(f"   • Success rate: {(stats['successful_runs'] / max(stats['total_runs'], 1) * 100):.1f}%")
        print(f"   • Average runtime: {stats['avg_runtime']}")
        
        print(f"\n📰 SCRAPING STATISTICS:")
        print(f"   • Total articles scraped: {stats['total_articles']}")
        print(f"   • Total sites processed: {stats['total_sites']}")
        
        if stats['total_runs'] > 0:
            print(f"   • Average articles per run: {stats['total_articles'] / stats['total_runs']:.1f}")
            print(f"   • Average sites per run: {stats['total_sites'] / stats['total_runs']:.1f}")
        
        if stats['runs_by_date']:
            print(f"\n📅 RUNS BY DATE:")
            for date, count in sorted(stats['runs_by_date'].items()):
                print(f"   • {date}: {count} runs")
        
        if stats['errors']:
            print(f"\n❌ RECENT ERRORS ({len(stats['errors'])} total):")
            for error in stats['errors'][:5]:  # Show first 5
                print(f"   • {error}")
        
        if stats['warnings']:
            print(f"\n⚠️  RECENT WARNINGS ({len(stats['warnings'])} total):")
            for warning in stats['warnings'][:5]:  # Show first 5
                print(f"   • {warning}")
        
        print("=" * 80)


def main():
    parser = argparse.ArgumentParser(description="Scrapy Log Manager and Monitor")
    parser.add_argument("--logs-dir", default="logs", help="Directory containing log files")
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Rotate command
    rotate_parser = subparsers.add_parser("rotate", help="Rotate log files")
    rotate_parser.add_argument("--max-size", type=int, default=50, help="Max size in MB before rotation")
    rotate_parser.add_argument("--max-age", type=int, default=30, help="Max age in days before archiving")
    rotate_parser.add_argument("--no-compress", action="store_true", help="Don't compress archived logs")
    
    # Cleanup command
    cleanup_parser = subparsers.add_parser("cleanup", help="Clean up old archived logs")
    cleanup_parser.add_argument("--max-archive-age", type=int, default=90, help="Max age for archived logs in days")
    
    # Tail command
    tail_parser = subparsers.add_parser("tail", help="View recent log entries")
    tail_parser.add_argument("-n", "--lines", type=int, default=50, help="Number of lines to show")
    tail_parser.add_argument("-f", "--follow", action="store_true", help="Follow log file in real-time")
    
    # Analyze command
    analyze_parser = subparsers.add_parser("analyze", help="Analyze log files")
    analyze_parser.add_argument("--pattern", default="scrapy_*.log", help="Log file pattern to analyze")
    
    args = parser.parse_args()
    
    manager = ScrapyLogManager(args.logs_dir)
    
    if args.command == "rotate":
        manager.rotate_logs(
            max_size_mb=args.max_size,
            max_age_days=args.max_age,
            compress=not args.no_compress
        )
    elif args.command == "cleanup":
        manager.cleanup_old_archives(max_archive_age_days=args.max_archive_age)
    elif args.command == "tail":
        manager.tail_log(lines=args.lines, follow=args.follow)
    elif args.command == "analyze":
        manager.analyze_logs(log_pattern=args.pattern)
    else:
        print("❌ Please specify a command. Use --help for available options.")
        parser.print_help()


if __name__ == "__main__":
    main()
