---
title: 怎麼評估一個 RAG 系統
slug: rag-evaluation
category: practice
tags: [RAG, 評估, RAGAS]
updated: 2026-11-16
summary: 把「檢索有沒有撈對」和「回答有沒有忠於資料」拆開評估，才知道該修哪一段。
sources: [https://docs.ragas.io/]
---

## 一句話理解

RAG 有兩個會出錯的地方：**找資料**和**寫答案**。評估時要把兩者拆開量，否則只看到「答案不好」，卻不知道是誰的錯。

> 比喻：學生考不好，可能是沒翻到對的頁（檢索問題），也可能是翻到了卻看錯（生成問題）。

## 先準備評估集

評估集（Evaluation Set）是一組人工確認過的資料，每筆包含：

- 問題（question）
- 標準答案（ground truth）
- 應該被撈到的段落（relevant contexts）

數量不用多，30～100 題、涵蓋各種問題類型就很有參考價值。最好讓領域專家（例如課程教師）一起確認。

## 檢索端指標

| 指標 | 問的問題 |
|---|---|
| Hit Rate@k | 前 k 段裡，有沒有至少一段是對的？ |
| MRR | 對的段落排在第幾名？越前面越好 |
| Context Precision | 撈回來的段落中，有多少是真的相關？ |
| Context Recall | 該撈到的資訊，撈回來了多少？ |

## 生成端指標

| 指標 | 問的問題 |
|---|---|
| Faithfulness（忠實度） | 答案裡的每個說法，是不是都能在撈回的段落中找到依據？ |
| Answer Relevancy | 答案有沒有回答到問題本身？ |
| Answer Correctness | 和標準答案相比對不對？ |

RAGAS 這類套件會用 LLM 當評審（LLM-as-a-Judge）自動算出這些分數。自動分數適合比較版本，但重要決策前仍要抽樣人工檢查。

```python
# 概念示意：比較兩種切段策略
for strategy in ["by_heading", "fixed_500"]:
    index = build_index(docs, strategy)
    hits = [gold in index.search(q, top_k=5) for q, gold in eval_set]
    print(strategy, sum(hits) / len(hits))
```

## 診斷對照表

| 檢索分數 | 忠實度 | 該修哪裡 |
|---|---|---|
| 低 | — | 切段、嵌入模型、Top-k、加入關鍵字檢索 |
| 高 | 低 | 提示詞要求「只根據資料回答」、換更強的生成模型 |
| 高 | 高但使用者不滿意 | 回頭檢查評估集是否貼近真實問題 |

## 延伸閱讀

- [[rag-basics]]
- [[chunking-strategies]]
