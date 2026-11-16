---
title: AI Agent = 模型 + Harness
slug: agent-harness
category: course
tags: [AI Agent, Harness, Agentic AI]
updated: 2026-11-16
summary: 決定 AI Agent 好不好用的，往往不是模型本身，而是包在模型外面的那套工作裝備。
sources: [raw/09-agentic-work.md]
---

## 一句話理解

大型語言模型（Large Language Model, LLM）本身只會「產生文字」——它不會開資料夾、不會上網、也不會存檔。讓它「動手」的是外面那一層 **Harness（工作裝備）**：模型說「我要讀這個檔案」，Harness 真的去讀，再把內容回報給模型。

> 比喻：模型是很聰明但被關在房間裡的顧問，Harness 是幫他跑腿、開門、操作電腦的助理團隊。

## Harness 裡有什麼

| 元件 | 負責什麼 | 例子 |
|---|---|---|
| 工作環境 | 一台可以存檔、跑程式的電腦（通常是沙盒） | 雲端容器、本機專案資料夾 |
| 工具（Tools） | 讀寫檔案、終端機、瀏覽器、搜尋 | `read_file`、`bash` |
| 連接器（MCP） | 接上你自己的 App | Gmail、行事曆、雲端硬碟 |
| 技能（Skills） | 一份「標準作業流程」，教它做某件事 | 一個資料夾＋`SKILL.md` |
| 規則檔 | 每次上工前先讀的員工手冊 | [[agents-md]] |
| 排程 | 時間到了自動開工 | 每天早上整理信件 |

## 從自己寫 Agent 到使用現成 Harness

上一個單元用 AISuite 自己刻 Agent 時，這些東西都要自己寫：

```python
# 自己寫工具函數、自己寫 system prompt、自己處理錯誤
tools = [read_file, write_file]
system_prompt = "你是一個會整理檔案的助理……"
```

使用 Claude、Codex 這類 agentic 工具時，對應關係變成：

- 自己寫的 Python 函數 → 產品內建的讀寫檔、終端機、搜尋
- 寫死在程式裡的 system prompt → 專案資料夾裡的 `CLAUDE.md` / `AGENTS.md`
- 自己處理錯誤和重試 → 產品幫你處理

所以「教 AI 做事」的重心，從寫程式轉移到**寫清楚規則**。

## 對話式 vs 代理式

| | 對話式 Chat | 代理式 Agentic |
|---|---|---|
| 你在做的事 | 問問題 | 交辦一件工作 |
| AI 像是 | 顧問 | 員工、同事 |
| 過程 | 一問一答，你全程在場 | 多步驟自己做，你可以離開 |
| 能碰的東西 | 對話框裡的文字 | 檔案、瀏覽器、工具 |
| 你拿到的 | 一段回答 | 一份成品 |

## 當個好老闆：交辦三件事

1. **要什麼成品**：做完會拿到什麼？放哪裡？什麼格式？
2. **有什麼限制**：哪些可以動、哪些不能動？
3. **怎麼算做完**：要怎麼驗收？

核心原則只有一句：**不要讓 AI 猜。**

## 延伸閱讀

- [[agents-md]] — 規則檔怎麼寫
- [[rag-basics]] — 讓模型「查資料」的另一種外掛方式
