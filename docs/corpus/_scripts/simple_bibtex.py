#!/usr/bin/env python3
import sys
import re

def extract_bibtex_info(bib_file, citation_key):
    try:
        with open(bib_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # 查找对应的条目
        pattern = rf'@\w+\{{{re.escape(citation_key)}[,\s]'
        match = re.search(pattern, content, re.IGNORECASE)
        
        if not match:
            return None
        
        # 找到条目的开始位置
        start = match.start()
        
        # 找到条目的结束位置（下一个@或文件结尾）
        next_entry = re.search(r'\n@\w+\{', content[start+1:])
        if next_entry:
            end = start + 1 + next_entry.start()
        else:
            end = len(content)
        
        entry = content[start:end]
        
        # 提取字段
        title = extract_field(entry, 'title')
        author = extract_field(entry, 'author')
        year = extract_field(entry, 'year')
        journal = extract_field(entry, 'journal') or extract_field(entry, 'booktitle')
        doi = extract_field(entry, 'doi')
        
        return {
            'title': title,
            'author': author,
            'year': year,
            'journal': journal,
            'doi': doi
        }
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return None

def extract_field(entry, field_name):
    pattern = rf'{field_name}\s*=\s*\{{([^}}]+)\}}'
    match = re.search(pattern, entry, re.IGNORECASE | re.DOTALL)
    if match:
        return match.group(1).strip()
    
    pattern = rf'{field_name}\s*=\s*"([^"]+)"'
    match = re.search(pattern, entry, re.IGNORECASE | re.DOTALL)
    if match:
        return match.group(1).strip()
    
    return ""

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: simple_bibtex.py <bib_file> <citation_key>", file=sys.stderr)
        sys.exit(1)
    
    bib_file, citation_key = sys.argv[1], sys.argv[2]
    
    info = extract_bibtex_info(bib_file, citation_key)
    
    if info and info['title']:
        for key, value in info.items():
            if value:
                print(f"{key}={value}")
        sys.exit(0)
    else:
        print(f"Citation '{citation_key}' not found", file=sys.stderr)
        sys.exit(1)
