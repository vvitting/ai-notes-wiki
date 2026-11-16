#!/usr/bin/env python3
"""驗證 wiki/ 內的條目，並產生 wiki/manifest.json。

用法：
    python3 scripts/build.py          # 驗證並寫入 manifest.json
    python3 scripts/build.py --check  # 只驗證；manifest.json 過期也算失敗（給 CI 用）
    python3 scripts/build.py --health # 額外列出 wiki 健康度報告

只使用 Python 標準函式庫，不需要安裝任何套件。
"""
from __future__ import annotations

import json
import re
import sys
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WIKI = ROOT / "wiki"
CONFIG = ROOT / "site.config.json"
MANIFEST = WIKI / "manifest.json"

REQUIRED = ["title", "slug", "category", "tags", "updated", "summary"]
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
LINK_RE = re.compile(r"\[\[([^\]|]+)(?:\|[^\]]*)?\]\]")
MAX_SUMMARY = 80
MAX_TAGS = 5


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """解析簡化版 YAML frontmatter：只支援 `key: value` 與 `key: [a, b]`。"""
    if not text.startswith("---"):
        raise ValueError("檔案開頭缺少 frontmatter（---）")
    parts = text.split("\n---", 1)
    if len(parts) < 2:
        raise ValueError("frontmatter 沒有結束的 ---")
    head = parts[0][3:]
    body = parts[1].lstrip("-").lstrip("\n")
    meta: dict = {}
    for lineno, raw in enumerate(head.splitlines(), start=2):
        line = raw.split(" #", 1)[0].strip()  # 允許行尾註解
        if not line:
            continue
        if ":" not in line:
            raise ValueError(f"frontmatter 第 {lineno} 行格式錯誤：{raw!r}")
        key, value = line.split(":", 1)
        key, value = key.strip(), value.strip()
        if value.startswith("[") and value.endswith("]"):
            inner = value[1:-1].strip()
            meta[key] = [v.strip().strip("'\"") for v in inner.split(",") if v.strip()] if inner else []
        else:
            meta[key] = value.strip("'\"")
    return meta, body


def validate(path: Path, meta: dict, body: str, categories: set[str]) -> list[str]:
    errs = []
    for key in REQUIRED:
        if key not in meta or meta[key] in ("", []):
            errs.append(f"缺少必填欄位 `{key}`")
    slug = meta.get("slug", "")
    if slug and not SLUG_RE.match(slug):
        errs.append(f"slug `{slug}` 只能用小寫英文、數字與連字號")
    if slug and slug != path.stem:
        errs.append(f"slug `{slug}` 必須與檔名 `{path.stem}` 相同")
    if meta.get("category") and meta["category"] not in categories:
        errs.append(f"category `{meta['category']}` 不在 site.config.json 中（可用：{', '.join(sorted(categories))}）")
    tags = meta.get("tags", [])
    if not isinstance(tags, list):
        errs.append("tags 必須是 [a, b] 格式的清單")
    elif len(tags) > MAX_TAGS:
        errs.append(f"tags 最多 {MAX_TAGS} 個（目前 {len(tags)} 個）")
    if meta.get("updated"):
        try:
            datetime.strptime(meta["updated"], "%Y-%m-%d")
        except ValueError:
            errs.append(f"updated `{meta['updated']}` 必須是 YYYY-MM-DD")
    if len(meta.get("summary", "")) > MAX_SUMMARY:
        errs.append(f"summary 超過 {MAX_SUMMARY} 字")
    if "sources" in meta and not isinstance(meta["sources"], list):
        errs.append("sources 必須是 [a, b] 格式的清單")
    prose = re.sub(r"^```.*?^```", "", body, flags=re.MULTILINE | re.DOTALL)  # 排除程式碼區塊
    if re.search(r"^# ", prose, re.MULTILINE):
        errs.append("內文不可使用 H1（#），請從 ## 開始")
    if "## 一句話理解" not in body:
        errs.append("缺少必要小節「## 一句話理解」")
    if "## 延伸閱讀" not in body:
        errs.append("缺少必要小節「## 延伸閱讀」")
    fences = re.findall(r"^```(.*)$", body, re.MULTILINE)
    openers = fences[0::2]
    if len(fences) % 2:
        errs.append("程式碼區塊 ``` 沒有成對")
    elif any(not lang.strip() for lang in openers):
        errs.append("程式碼區塊必須標示語言，例如 ```python")
    return errs


def build(check_only: bool = False, health: bool = False) -> int:
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    categories = {c["id"] for c in config["categories"]}

    entries, errors, bodies = [], {}, {}
    for path in sorted(WIKI.glob("*.md")):
        if path.name.startswith("_"):
            continue
        rel = path.relative_to(ROOT).as_posix()
        try:
            meta, body = parse_frontmatter(path.read_text(encoding="utf-8"))
        except ValueError as e:
            errors[rel] = [str(e)]
            continue
        errs = validate(path, meta, body, categories)
        if errs:
            errors[rel] = errs
        bodies[meta.get("slug", path.stem)] = body
        entries.append({
            "slug": meta.get("slug", path.stem),
            "title": meta.get("title", path.stem),
            "category": meta.get("category", ""),
            "tags": meta.get("tags", []),
            "updated": meta.get("updated", ""),
            "summary": meta.get("summary", ""),
            "sources": meta.get("sources", []),
            "file": f"wiki/{path.name}",
            "words": len(re.sub(r"\s", "", body)),
        })

    # 連結檢查與反向連結
    slugs = {e["slug"] for e in entries}
    backlinks: dict[str, set[str]] = {s: set() for s in slugs}
    for e in entries:
        links = sorted({m.strip() for m in LINK_RE.findall(bodies.get(e["slug"], ""))})
        e["links"] = [l for l in links if l in slugs]
        broken = [l for l in links if l not in slugs]
        if broken:
            errors.setdefault(e["file"], []).append(f"[[連結]] 指向不存在的條目：{', '.join(broken)}")
        for target in e["links"]:
            if target != e["slug"]:
                backlinks[target].add(e["slug"])
    for e in entries:
        e["backlinks"] = sorted(backlinks.get(e["slug"], set()))

    entries.sort(key=lambda e: (e["updated"], e["slug"]), reverse=True)

    if errors:
        print("✗ 驗證失敗：\n")
        for f, errs in errors.items():
            print(f"  {f}")
            for err in errs:
                print(f"    - {err}")
        return 1

    manifest = {
        "site": config,
        "count": len(entries),
        "tags": sorted({t for e in entries for t in e["tags"]}),
        "entries": entries,
    }
    output = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"

    if check_only:
        current = MANIFEST.read_text(encoding="utf-8") if MANIFEST.exists() else ""
        if current != output:
            print("✗ wiki/manifest.json 已過期，請在本機執行 python3 scripts/build.py 後再提交")
            return 1
    else:
        MANIFEST.write_text(output, encoding="utf-8")

    print(f"✓ {len(entries)} 篇條目驗證通過" + ("" if check_only else "，已更新 wiki/manifest.json"))

    if health:
        today = date.today()
        orphans = [e["slug"] for e in entries if not e["backlinks"]]
        stale = [e["slug"] for e in entries
                 if (today - datetime.strptime(e["updated"], "%Y-%m-%d").date()).days > 90]
        thin = [e["slug"] for e in entries if len(e["tags"]) < 2]
        print("\nWiki 健康度報告")
        print(f"  孤兒條目（沒有被任何條目連到）：{', '.join(orphans) or '無'}")
        print(f"  超過 90 天未更新：{', '.join(stale) or '無'}")
        print(f"  標籤少於 2 個：{', '.join(thin) or '無'}")
    return 0


if __name__ == "__main__":
    sys.exit(build(check_only="--check" in sys.argv, health="--health" in sys.argv))
