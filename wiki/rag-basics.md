---
title: RAG 是什麼：讓模型開書考試
slug: rag-basics
category: concept
tags: [RAG, 檢索, 向量資料庫]
updated: 2026-11-16
summary: 先從知識庫找出相關段落，再交給 LLM 根據這些段落回答，降低幻覺並能引用來源。
sources: [https://arxiv.org/abs/2005.11401]
---

## 一句話理解

檢索增強生成（Retrieval-Augmented Generation, RAG）就是讓模型**開書考試**：回答之前，先去指定的資料裡找出相關段落，把段落和問題一起交給模型，請它「根據這些資料」回答。

> 閉書考試靠記憶，容易亂掰；開書考試可以翻課本，還能告訴你答案在第幾頁。

## 為什麼需要 RAG

- **模型知識有截止日**：訓練之後的新資料它不知道。
- **私有資料模型沒看過**：課程講義、公司文件、你的筆記。
- **降低幻覺（Hallucination）**：有原文可依據，比較不會編造。
- **可以附上出處**：回答時一併列出參考段落，方便查證。

## 基本流程

分成「事先建索引」與「每次提問」兩段：

**建索引（離線做一次）**

1. 載入文件（PDF、網頁、Markdown）
2. 切段（Chunking），細節見 [[chunking-strategies]]
3. 用嵌入模型（Embedding Model）把每段轉成向量
4. 存進向量資料庫（Vector Database）

**每次提問（線上）**

1. 把使用者問題也轉成向量
2. 找出最相似的前 k 段（Top-k Retrieval）
3. 組成提示詞：「請根據以下資料回答……」
4. 交給 LLM 生成答案

```python
# 最小可行的 RAG（概念示意）
q_vec = embed(question)
chunks = vector_db.search(q_vec, top_k=5)
prompt = f"根據以下資料回答，找不到就說不知道：\n{chunks}\n\n問題：{question}"
answer = llm(prompt)
```

## 常見的失敗點

| 症狀 | 可能原因 |
|---|---|
| 答非所問 | 檢索沒撈到對的段落（切段太碎或太大） |
| 答案正確但沒引用 | 提示詞沒要求標註來源 |
| 明明有資料卻說不知道 | Top-k 太小，或問題用詞與文件差很多 |
| 引用了卻講錯 | 模型沒有忠於段落，要用評估指標抓出來 |

要知道系統到底哪裡壞，需要有系統地評估，見 [[rag-evaluation]]。

## 延伸閱讀

- [[chunking-strategies]]
- [[rag-evaluation]]
- [[agent-harness]] — RAG 也可以被當成 Agent 的一個工具
