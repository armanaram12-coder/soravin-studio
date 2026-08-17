#!/bin/bash
# Script to replace headers in all HTML files

for f in *.html; do
    if [ "$f" = "index.html" ] || [ "$f" = "shop.html" ] || [ "$f" = "tech-news.html" ] || [ "$f" = "news-detail.html" ]; then
        continue  # Already processed
    fi
    
    # Find line numbers for header tags
    start_line=$(grep -n "<header" "$f" | head -1 | cut -d: -f1)
    end_line=$(grep -n "</header>" "$f" | head -1 | cut -d: -f1)
    
    if [ -n "$start_line" ] && [ -n "$end_line" ]; then
        # Check if it's an auth header (login/register/dashboard)
        if grep -q 'class="auth-header"' "$f" || grep -q 'class="admin-header"' "$f"; then
            # Keep auth/admin headers as-is for now
            continue
        fi
        
        # Replace header block
        sed -i "${start_line},${end_line}c\\
<header id=\"siteHeader\"></header>\\
<script type=\"module\" src=\"js/site-header.js\"></script>" "$f"
        
        echo "Updated: $f"
    fi
done
