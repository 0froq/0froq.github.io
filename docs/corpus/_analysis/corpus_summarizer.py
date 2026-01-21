#!/usr/bin/env python3
# _scripts/corpus_summarizer.py

import os
import re
import sys
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import yaml
import argparse
from pathlib import Path


class CorpusSummarizer:
    def __init__(self, corpus_dir):
        # self.corpus_dir = Path(corpus_dir)
        self.corpus_dir = corpus_dir

        # 精确的层级映射（基于实际目录结构）
        self.layer_map = {
            # Autopsia 自省
            "inc": "000_autopsia/010_incisio",
            "pat": "000_autopsia/020_pathologia",
            "sat": "000_autopsia/030_satura",
            # Ingesta 摄取
            "frag": "100_ingesta/110_fragmenta",
            "rel": "100_ingesta/120_reliquia",
            "imp": "100_ingesta/130_impressio",
            "org": "100_ingesta/140_organon",
            "tox": "100_ingesta/150_toxicon",
            # Neoplasma 增生
            "cor": "200_neoplasma/210_cor",
            "vas": "200_neoplasma/220_vascula",
            "aby": "200_neoplasma/230_oblivium/231_abyssus",
            "nod": "200_neoplasma/230_oblivium/232_nodus",
            "hal": "200_neoplasma/230_oblivium/233_hallucina",
            "flu": "200_neoplasma/230_oblivium/234_fluxus",
            "fra": "200_neoplasma/230_oblivium/235_fractura",
            "chi": "200_neoplasma/230_oblivium/236_chimera",
            "eru": "200_neoplasma/240_eruptio",
            # Putredo 腐朽
            "mia": "300_putredo/310_miasma",
            "ulc": "300_putredo/320_ulcus",
            "exh": "300_putredo/330_exhumatio",
            # 特殊层级
            "del": "400_delirium",
            "vig": "500_vigil",
        }

        # 层级组织
        self.major_layers = {
            "AUTOPSIA": ["inc", "pat", "sat"],
            "INGESTA": ["frag", "rel", "imp", "org", "tox"],
            "NEOPLASMA": [
                "cor",
                "vas",
                "aby",
                "nod",
                "hal",
                "flu",
                "fra",
                "chi",
                "eru",
            ],
            "PUTREDO": ["mia", "ulc", "exh"],
            "SPECIAL": ["del", "vig"],
        }

        # 层级描述
        self.layer_descriptions = {
            "inc": "Incisio - 切入与观察",
            "pat": "Pathologia - 病理诊断",
            "sat": "Satura - 修正缝合",
            "frag": "Fragmenta - 思维碎片",
            "rel": "Reliquia - 学术遗存",
            "imp": "Impressio - 感官印记",
            "org": "Organon - 工具机制",
            "tox": "Toxicon - 毒性思维",
            "cor": "Cor - 核心本体",
            "vas": "Vascula - 连接血管",
            "aby": "Abyssus - 深渊凝视",
            "nod": "Nodus - 复杂结节",
            "hal": "Hallucina - 幻象投射",
            "flu": "Fluxus - 情感洪流",
            "fra": "Fractura - 断裂测量",
            "chi": "Chimera - 混合模型",
            "eru": "Eruptio - 突现爆发",
            "mia": "Miasma - 日常瘴气",
            "ulc": "Ulcus - 项目溃疡",
            "exh": "Exhumatio - 历史挖掘",
            "del": "Delirium - 奇迹殿堂",
            "vig": "Vigil - 夜间守望",
        }

    def analyze_period(self, start_date, end_date, layers=None):
        """分析指定时间段的Corpus活动"""
        results = {
            "period": {
                "start": start_date,
                "end": end_date,
                "days": (end_date - start_date).days + 1,
            },
            "layers": defaultdict(list),
            "status_dist": Counter(),
            "time_patterns": {"creation_hours": [], "creation_days": []},
            "concepts": Counter(),
            "warnings": [],
            "metadata": {"total_files": 0, "total_words": 0},
        }

        for layer_key, layer_path in self.layer_map.items():
            if layers and layer_key not in layers:
                continue

            full_path = self.corpus_dir / layer_path
            if full_path.exists():
                files = self._get_files_in_period(full_path, start_date, end_date)
                results["layers"][layer_key] = files

                # 处理每个文件的元数据
                for file_info in files:
                    self._extract_metadata(file_info, results)
                    results["metadata"]["total_files"] += 1

        self._analyze_patterns(results)
        self._generate_warnings(results)
        return results

    def _get_files_in_period(self, path, start_date, end_date):
        """获取时间段内的文件"""
        files = []
        if not path.exists():
            return files

        for filepath in path.glob("*.md"):
            # 跳过模板文件
            if filepath.name.startswith("tp_"):
                continue

            # 从文件名或文件时间获取创建时间
            file_time = self._extract_creation_time(filepath)

            if file_time and start_date <= file_time <= end_date:
                files.append(
                    {
                        "path": filepath,
                        "filename": filepath.name,
                        "created": file_time,
                        "layer": self._get_layer_from_path(str(path)),
                    }
                )

        return sorted(files, key=lambda x: x["created"])

    def _extract_creation_time(self, filepath):
        """从文件名或文件属性提取创建时间"""
        filename = filepath.name

        # 方法1: 从文件名提取时间戳（如 cmd_name_20241029123456.md）
        timestamp_match = re.search(r"(\d{14})", filename)
        if timestamp_match:
            try:
                return datetime.strptime(timestamp_match.group(1), "%Y%m%d%H%M%S")
            except ValueError:
                pass

        # 方法2: 从文件名提取日期（如 cmd_name_20241029.md）
        date_match = re.search(r"(\d{8})", filename)
        if date_match:
            try:
                return datetime.strptime(date_match.group(1), "%Y%m%d")
            except ValueError:
                pass

        # 方法3: 使用文件的修改时间
        try:
            return datetime.fromtimestamp(filepath.stat().st_mtime)
        except OSError:
            return None

    def _get_layer_from_path(self, path):
        """从路径推断层级"""
        for key, layer_path in self.layer_map.items():
            if layer_path in path:
                return key
        return "unknown"

    def _extract_metadata(self, file_info, results):
        """提取文件元数据和内容分析"""
        try:
            with open(file_info["path"], "r", encoding="utf-8") as f:
                content = f.read()

            # 记录时间模式
            results["time_patterns"]["creation_hours"].append(file_info["created"].hour)
            results["time_patterns"]["creation_days"].append(
                file_info["created"].weekday()
            )

            # 解析 YAML frontmatter
            frontmatter = self._extract_frontmatter(content)
            if frontmatter:
                if "status" in frontmatter:
                    results["status_dist"][frontmatter["status"]] += 1
                if "layer" in frontmatter:
                    # 验证层级一致性
                    declared_layer = frontmatter["layer"].split("/")[-1]
                    if declared_layer != file_info["layer"]:
                        results["warnings"].append(
                            f"层级不一致: {file_info['filename']}"
                        )

            # 内容分析
            body_content = self._extract_body_content(content)
            word_count = len(body_content.split())
            results["metadata"]["total_words"] += word_count

            # 概念提取（改进版）
            concepts = self._extract_concepts(body_content)
            results["concepts"].update(concepts)

            # 存储文件详细信息
            file_info.update(
                {
                    "word_count": word_count,
                    "status": frontmatter.get("status", "unknown"),
                    "concepts": concepts,
                }
            )

        except Exception as e:
            results["warnings"].append(
                f"文件读取错误 {file_info['filename']}: {str(e)}"
            )

    def _extract_frontmatter(self, content):
        """提取YAML frontmatter"""
        if content.startswith("---"):
            try:
                yaml_end = content.find("---", 3)
                if yaml_end != -1:
                    frontmatter_text = content[3:yaml_end].strip()
                    return yaml.safe_load(frontmatter_text)
            except yaml.YAMLError:
                pass
        return {}

    def _extract_body_content(self, content):
        """提取正文内容（去除frontmatter）"""
        if content.startswith("---"):
            yaml_end = content.find("---", 3)
            if yaml_end != -1:
                return content[yaml_end + 3 :].strip()
        return content

    def _extract_concepts(self, content):
        """提取关键概念（改进的NLP处理）"""
        # 移除标点和特殊字符，转为小写
        clean_content = re.sub(r"[^\w\s\u4e00-\u9fff]", " ", content.lower())

        # 提取有意义的词汇（长度>=2）
        words = re.findall(r"[\w\u4e00-\u9fff]{2,}", clean_content)

        # 过滤常用词（可以扩展stopwords列表）
        stopwords = {
            "the",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
            "for",
            "of",
            "with",
            "by",
            "是",
            "的",
            "了",
            "在",
            "和",
            "与",
            "或者",
            "但是",
            "因为",
            "所以",
            "这个",
            "那个",
        }

        meaningful_words = [w for w in words if w not in stopwords and len(w) >= 2]

        return Counter(meaningful_words)

    def _analyze_patterns(self, results):
        """分析活动模式"""
        if results["time_patterns"]["creation_hours"]:
            # 活跃时段分析
            hour_dist = Counter(results["time_patterns"]["creation_hours"])
            results["time_patterns"]["peak_hours"] = hour_dist.most_common(3)

            # 活跃日期分析
            day_names = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
            day_dist = Counter(results["time_patterns"]["creation_days"])
            results["time_patterns"]["active_days"] = [
                (day_names[day], count) for day, count in day_dist.most_common(3)
            ]

            # 创作速度
            total_entries = results["metadata"]["total_files"]
            period_days = results["period"]["days"]
            results["time_patterns"]["velocity"] = total_entries / max(period_days, 1)

            # 平均字数
            if total_entries > 0:
                results["metadata"]["avg_words"] = (
                    results["metadata"]["total_words"] / total_entries
                )

    def _generate_warnings(self, results):
        """生成健康度警告"""
        total_entries = results["metadata"]["total_files"]

        if total_entries == 0:
            results["warnings"].append("⚠️  此期间无任何创作活动")
            return

        # 状态分布警告
        probe_ratio = results["status_dist"].get("probe", 0) / total_entries
        if probe_ratio > 0.8:
            results["warnings"].append("⚠️  过多探索状态(probe)，建议推进思想成熟度")

        # 自省不足警告
        autopsia_layers = ["inc", "pat", "sat"]
        autopsia_count = sum(len(results["layers"][layer]) for layer in autopsia_layers)
        if total_entries > 10 and autopsia_count < 2:
            results["warnings"].append("⚠️  Autopsia活动不足，需要增加自省反思")

        # 项目健康警告
        ulcus_count = len(results["layers"]["ulc"])
        if ulcus_count > 3:
            results["warnings"].append("⚠️  项目溃疡风险较高，关注项目健康度")

        # 增生过度警告
        neoplasma_layers = [
            "cor",
            "vas",
            "aby",
            "nod",
            "hal",
            "flu",
            "fra",
            "chi",
            "eru",
        ]
        neoplasma_count = sum(
            len(results["layers"][layer]) for layer in neoplasma_layers
        )
        if neoplasma_count > total_entries * 0.7:
            results["warnings"].append("⚠️  Neoplasma过度活跃，注意思维结构稳定性")

        # 创作节奏警告
        velocity = results["time_patterns"].get("velocity", 0)
        if velocity < 0.1:
            results["warnings"].append("⚠️  创作活动稀少，建议增加记录频率")
        elif velocity > 5:
            results["warnings"].append("⚠️  创作过于密集，注意质量控制")

    def generate_report(self, results, format_type="standard"):
        """生成报告"""
        if format_type == "detailed":
            return self._generate_detailed_report(results)
        elif format_type == "json":
            import json

            return json.dumps(results, default=str, ensure_ascii=False, indent=2)
        else:
            return self._generate_standard_report(results)

    def _generate_standard_report(self, results):
        """生成标准格式报告"""
        report = []
        period = results["period"]

        # 标题
        report.append("═══════════════════════════════════════════════════")
        report.append("           CORPUS PATHOLOGICAL ANALYSIS")
        report.append("═══════════════════════════════════════════════════")
        report.append(
            f"Period: {period['start'].strftime('%Y-%m-%d')} → {period['end'].strftime('%Y-%m-%d')} ({period['days']} days)"
        )
        report.append("")

        # 概览统计
        total_files = results["metadata"]["total_files"]
        if total_files > 0:
            report.append("CORPUS VITALS:")
            report.append(f"  Total Entries: {total_files}")
            report.append(f"  Total Words: {results['metadata']['total_words']:,}")
            report.append(
                f"  Average Words/Entry: {results['metadata'].get('avg_words', 0):.1f}"
            )
            report.append(
                f"  Creation Velocity: {results['time_patterns'].get('velocity', 0):.2f} entries/day"
            )
            report.append("")

        # 层级活动分析
        report.append("PATHOLOGICAL ACTIVITY BY LAYER:")
        for major_name, layer_keys in self.major_layers.items():
            layer_total = sum(len(results["layers"][key]) for key in layer_keys)
            if layer_total > 0:
                percentage = layer_total / total_files * 100 if total_files > 0 else 0
                report.append(
                    f"  {major_name}: {layer_total} entries ({percentage:.1f}%)"
                )

                # 详细子层级
                for key in layer_keys:
                    count = len(results["layers"][key])
                    if count > 0:
                        desc = self.layer_descriptions.get(key, key.upper())
                        report.append(f"    └─ {desc}: {count}")
                report.append("")

        # 状态分布
        if results["status_dist"]:
            report.append("STATUS DISTRIBUTION:")
            for status, count in results["status_dist"].most_common():
                percentage = count / total_files * 100 if total_files > 0 else 0
                status_desc = {
                    "probe": "探索中",
                    "draft": "草稿",
                    "evergreen": "常青",
                    "canon": "经典",
                    "archive": "存档",
                }.get(status, status)
                report.append(f"  {status_desc}: {count} ({percentage:.1f}%)")
            report.append("")

        # 时间模式
        if results["time_patterns"].get("peak_hours"):
            report.append("TEMPORAL PATTERNS:")
            peak_hours = results["time_patterns"]["peak_hours"]
            peak_times = [
                f"{hour:02d}:00-{hour+1:02d}:00" for hour, _ in peak_hours[:3]
            ]
            report.append(f"  Peak Hours: {' | '.join(peak_times)}")

            if results["time_patterns"].get("active_days"):
                active_days = [
                    day for day, _ in results["time_patterns"]["active_days"][:3]
                ]
                report.append(f"  Most Active Days: {' | '.join(active_days)}")
            report.append("")

        # 概念热点
        if results["concepts"]:
            report.append("CONCEPTUAL HOTSPOTS:")
            top_concepts = results["concepts"].most_common(10)
            concept_lines = []
            for concept, freq in top_concepts:
                if freq > 1:  # 只显示出现多次的概念
                    concept_lines.append(f"{concept}({freq})")
            if concept_lines:
                # 分行显示，每行最多显示5个概念
                for i in range(0, len(concept_lines), 5):
                    report.append(f"  {' | '.join(concept_lines[i:i+5])}")
                report.append("")

        # 健康警告
        if results["warnings"]:
            report.append("⚠️  HEALTH DIAGNOSTICS:")
            for warning in results["warnings"]:
                report.append(f"  {warning}")
            report.append("")

        # 结语
        report.append("─" * 51)
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        return "\n".join(report)

    def save_report(self, report_content, period_end, report_type='weekly'):
        """保存报告到 _sum 目录（修复版）"""
        try:
            # 确保corpus_dir是绝对路径
            if not self.corpus_dir.is_absolute():
                self.corpus_dir = self.corpus_dir.resolve()

            # 创建 _sum 目录
            sum_dir = self.corpus_dir / '_sum'
            sum_dir.mkdir(parents=True, exist_ok=True)

            # 生成安全的文件名
            timestamp = period_end.strftime('%Y%m%d')
            filename = f"corpus_summary_{report_type}_{timestamp}.md"
            report_path = sum_dir / filename

            # 确保路径安全
            if not str(report_path).startswith(str(self.corpus_dir)):
                raise ValueError("Unsafe path detected")

            # 创建报告内容
            full_report = f"""# Corpus {report_type.title()} Summary
    *Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*

    {report_content}

    ---
    *Analysis completed successfully*
    """

            # 写入文件
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write(full_report)

            return report_path

        except Exception as e:
            # 如果保存失败，返回错误信息而不是崩溃
            error_msg = f"Failed to save report: {str(e)}"
            print(f"Warning: {error_msg}", file=sys.stderr)
            return None
    
    def manage_reports(self, action="list", keep_days=90):
        """管理摘要报告"""
        sum_dir = self.corpus_dir / "_sum"

        if action == "list":
            """列出所有报告"""
            if not sum_dir.exists():
                return []

            reports = []
            for report_file in sum_dir.glob("corpus_summary_*.md"):
                # 提取报告信息
                match = re.match(r"corpus_summary_(\w+)_(\d{8})\.md", report_file.name)
                if match:
                    report_type, date_str = match.groups()
                    report_date = datetime.strptime(date_str, "%Y%m%d")
                    reports.append(
                        {
                            "path": report_file,
                            "type": report_type,
                            "date": report_date,
                            "age_days": (datetime.now() - report_date).days,
                        }
                    )

            return sorted(reports, key=lambda x: x["date"], reverse=True)

        elif action == "cleanup":
            """清理旧报告"""
            reports = self.manage_reports("list")
            cleaned = 0

            for report in reports:
                if report["age_days"] > keep_days:
                    report["path"].unlink()
                    cleaned += 1

            return cleaned

        elif action == "index":
            """生成报告索引"""
            reports = self.manage_reports("list")
            if not reports:
                return None

            index_content = ["# Corpus Summary Reports Index\n"]

            # 按类型分组
            by_type = defaultdict(list)
            for report in reports:
                by_type[report["type"]].append(report)

            for report_type, type_reports in by_type.items():
                index_content.append(f"## {report_type.title()} Reports\n")
                for report in type_reports:
                    relative_path = report["path"].name
                    date_str = report["date"].strftime("%Y-%m-%d")
                    age = report["age_days"]
                    index_content.append(
                        f"- [{date_str}](./{relative_path}) ({age} days ago)"
                    )
                index_content.append("")

            # 保存索引
            index_path = sum_dir / "README.md"
            with open(index_path, "w", encoding="utf-8") as f:
                f.write("\n".join(index_content))

            return index_path



def main():
    parser = argparse.ArgumentParser(description='Corpus Pathological Summarizer')
    parser.add_argument('--period', default='week', 
                       help='Time period: week, month, 30d, quarter, year')
    parser.add_argument('--layer', 
                       help='Filter by layer (comma-separated): inc,pat,sat,frag,rel,...')
    parser.add_argument('--format', default='standard', 
                       choices=['standard', 'detailed', 'json'])
    parser.add_argument('--save', action='store_true', 
                       help='Save report to _sum directory')
    parser.add_argument('--quiet', action='store_true',
                       help='Only print warnings and errors')
    parser.add_argument('--corpus-dir', 
                       help='Override CORPUS_DIR environment variable')
    
    args = parser.parse_args()
    
    # 获取Corpus目录（改进版）
    corpus_dir = args.corpus_dir or os.environ.get('CORPUS_DIR')
    
    if not corpus_dir:
        print("Error: CORPUS_DIR environment variable not set and --corpus-dir not provided", file=sys.stderr)
        print("Please set CORPUS_DIR or use --corpus-dir=/path/to/corpus", file=sys.stderr)
        sys.exit(1)
    
    # 验证目录存在
    corpus_path = Path(corpus_dir)
    if not corpus_path.exists():
        print(f"Error: Corpus directory does not exist: {corpus_dir}", file=sys.stderr)
        sys.exit(1)
    
    if not corpus_path.is_dir():
        print(f"Error: CORPUS_DIR is not a directory: {corpus_dir}", file=sys.stderr)
        sys.exit(1)
    
    # 后续代码保持不变...
    # 解析时间段
    end_date = datetime.now()
    period_mapping = {"week": 7, "month": 30, "quarter": 90, "year": 365}

    if args.period in period_mapping:
        days = period_mapping[args.period]
    elif args.period.endswith("d"):
        try:
            days = int(args.period[:-1])
        except ValueError:
            print(f"Error: Invalid period format '{args.period}'", file=sys.stderr)
            sys.exit(1)
    else:
        days = 7  # 默认一周

    start_date = end_date - timedelta(days=days)

    # 解析层级过滤
    layers = None
    if args.layer:
        layers = [l.strip() for l in args.layer.split(",")]

    # 执行分析
    summarizer = CorpusSummarizer(corpus_dir)
    results = summarizer.analyze_period(start_date, end_date, layers)

    # 生成报告
    report = summarizer.generate_report(results, args.format)

    # 输出报告
    if not args.quiet:
        print(report)

    # 保存报告
    if args.save:
        report_path = summarizer.save_report(report, end_date, args.period)
        if not args.quiet:
            print(f"\nReport saved to: {report_path}")

    # 如果有严重警告，返回非零退出码
    serious_warnings = [w for w in results["warnings"] if "⚠️" in w]
    if serious_warnings and not args.quiet:
        print(f"\n{len(serious_warnings)} health warning(s) detected.", file=sys.stderr)


if __name__ == "__main__":
    main()
