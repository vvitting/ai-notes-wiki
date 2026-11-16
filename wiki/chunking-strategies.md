---
title: 切段策略（Chunking）怎麼選
slug: chunking-strategies
category: practice
tags: [RAG, Chunking, 檢索]
updated: 2026-11-16
summary: 段落切太大會混入雜訊、切太小會失去上下文；依文件結構選擇切法並保留中繼資料。
sources: []
---

## 一句話理解

切段（Chunking）是把長文件切成一塊一塊、讓檢索器可以單獨找出來的段落。**切得好不好，決定了 RAG 能不能撈到對的東西。**

> 比喻：替一本教科書做索引卡。一張卡寫一整章，找到了也看不出重點；一張卡只寫一句話，又看不懂前因後果。

## 三種常見切法

| 切法 | 做法 | 適合 | 缺點 |
|---|---|---|---|
| 固定長度 | 每 N 個字切一刀，前後重疊 M 個字 | 格式雜亂的純文字 | 可能把一句話切成兩半 |
| 依結構切 | 依標題、段落、條列切 | Markdown、講義、法規 | 各段長度不均 |
| 語意切段 | 相鄰句子語意差異大時才切 | 長篇敘述文 | 計算成本較高、較難除錯 |

實務上最常用的是「**先依結構切，太長的再用固定長度補切**」。

```python
def chunk_by_heading(markdown: str, max_chars: int = 800, overlap: int = 100):
    sections = markdown.split("\n## ")
    for sec in sections:
        if len(sec) <= max_chars:
            yield sec
        else:
            for i in range(0, len(sec), max_chars - overlap):
                yield sec[i:i + max_chars]
```

## 幾個容易忽略的細節

- **保留中繼資料（Metadata）**：每段記下來源檔名、章節標題、頁碼。回答時才能引用出處，也能用來過濾。
- **把標題黏回段落**：「## 上肢骨骼」底下的段落，切出來時在開頭補上「上肢骨骼：」，檢索時會準很多。
- **表格與圖說要特別處理**：表格切開就看不懂了，盡量整張表當一段。
- **重疊（Overlap）不是越大越好**：重疊太多會讓同樣內容重複出現在 Top-k 裡，擠掉別的段落。

## 怎麼知道切得好不好

不要憑感覺，準備一組「問題＋應該被撈到的段落」，比較不同切法的命中率。方法見 [[rag-evaluation]]。

## 延伸閱讀

- [[rag-basics]]
- [[rag-evaluation]]
