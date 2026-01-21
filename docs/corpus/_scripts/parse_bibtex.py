
#!/usr/bin/env python3
import sys
import re

def extract_author_list(raw_author_text):
    """正确处理BibTeX的各种作者格式"""
    if not raw_author_text:
        return ""
    
    text = raw_author_text.strip()
    while text.startswith('{') and text.endswith('}'):
        text = text[1:-1].strip()
    
    # 优先处理 "and" 分割（BibTeX标准格式）
    if ' and ' in text:
        parts = re.split(r'\s+and\s+', text)
        authors = []
        
        for part in parts:
            clean_part = re.sub(r'[{}]', '', part.strip())
            
            # 检查是否是 "Last, First" 格式
            if ', ' in clean_part:
                name_parts = clean_part.split(', ', 1)  # 只分割第一个逗号
                if len(name_parts) == 2:
                    last, first = name_parts
                    last = last.strip()
                    first = first.strip()
                    # 重组为 "First Last"
                    authors.append(f"{first} {last}")
                else:
                    authors.append(clean_part)
            else:
                # 没有逗号，可能已经是 "First Last" 格式
                authors.append(clean_part)
        
        return ', '.join(authors)
    
    # 处理花括号格式 {Author1}, {Author2}
    brace_authors = re.findall(r'\{([^}]+)\}', text)
    if brace_authors:
        return ', '.join(brace_authors)
    
    # 处理纯逗号分隔的情况（可能是中文作者或其他格式）
    parts = [p.strip() for p in text.split(',') if p.strip()]
    
    # 如果偶数个且多于2个，尝试姓名重组
    if len(parts) % 2 == 0 and len(parts) > 2:
        authors = []
        for i in range(0, len(parts), 2):
            if i + 1 < len(parts):
                first_part = parts[i].strip()
                second_part = parts[i + 1].strip()
                
                # 简单检查是否像姓名对
                if (first_part.replace(' ', '').replace('.', '').replace('-', '').isalpha() and
                    second_part.replace(' ', '').replace('.', '').replace('-', '').isalpha() and
                    len(first_part.split()) <= 3 and len(second_part.split()) <= 3):
                    authors.append(f"{second_part} {first_part}")
                else:
                    authors.extend([first_part, second_part])
        
        if len(authors) > 0:
            return ', '.join(authors)
    
    # 中文姓名检测
    if len(parts) <= 1:
        chinese_names = re.findall(r'[\u4e00-\u9fff]{2,4}', text)
        if len(chinese_names) > 1:
            return ', '.join(chinese_names)
    
    # 默认返回原始分割结果
    return ', '.join(parts) if parts else text

def clean_bibtex_field(field_name, value):
    """清理BibTeX字段"""
    if not value:
        return ""
    
    value = value.strip()
    value = re.sub(r'[},\s]*$', '', value)
    value = re.sub(r'^[{\s]*', '', value)
    
    if field_name == 'author':
        return extract_author_list(value)
    elif field_name == 'title':
        value = re.sub(r'\\[a-zA-Z]+\{([^}]*)\}', r'\1', value)
        value = re.sub(r'[{}]', '', value)
    elif field_name == 'year':
        year_match = re.search(r'\b(20[0-2]\d|19[5-9]\d)\b', value)
        if year_match:
            value = year_match.group(1)
        else:
            value = ""
    elif field_name in ['journal', 'doi']:
        value = re.sub(r'[{}]', '', value)
        value = re.sub(r'\s+', ' ', value)
    
    return value.strip()

def parse_bibtex_entry(bib_file, citation_key):
    """解析BibTeX条目"""
    try:
        with open(bib_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except IOError:
        return None
    
    pattern = rf'\w+\{{{re.escape(citation_key)},'
    match = re.search(pattern, content, re.IGNORECASE)
    if not match:
        return None
    
    # 提取条目
    start = match.start()
    brace_count = 0
    for i, char in enumerate(content[start:], start):
        if char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                entry_text = content[start:i+1]
                break
    else:
        entry_text = content[start:]
    
    # 解析字段
    fields = {}
    lines = entry_text.split('\n')[1:]  # 跳过第一行
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
            
        field_match = re.match(r'(\w+)\s*=\s*(.*)', line)
        if field_match:
            field_name = field_match.group(1).lower()
            field_content = field_match.group(2).strip()
            field_lines = [field_content]
            i += 1
            
            if field_content.startswith('{'):
                brace_count = field_content.count('{') - field_content.count('}')
                while i < len(lines) and brace_count > 0:
                    next_line = lines[i].strip()
                    if next_line:
                        field_lines.append(next_line)
                        brace_count += next_line.count('{') - next_line.count('}')
                    i += 1
            
            full_value = ' '.join(field_lines)
            cleaned = clean_bibtex_field(field_name, full_value)
            if cleaned:
                fields[field_name] = cleaned
        else:
            i += 1
    
    return fields

def main():
    if len(sys.argv) != 3:
        sys.exit(1)
    
    bib_file, citation_key = sys.argv[1], sys.argv[2]
    fields = parse_bibtex_entry(bib_file, citation_key)
    
    if not fields:
        sys.exit(1)
    
    for field in ['title', 'author', 'year', 'journal', 'doi']:
        if field in fields and fields[field].strip():
            clean_value = fields[field].strip().rstrip(',}').strip()
            if clean_value:
                print(f"{field}={clean_value}")

if __name__ == "__main__":
    main()

