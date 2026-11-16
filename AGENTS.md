# AGENTS.md — AI 工程筆記本（AI Notes Wiki）員工手冊

> 給所有在這個專案工作的 AI（Claude、Codex、Gemini…）與人類協作者。
> **開始任何工作前，請先完整讀完這份文件。** 有衝突時，以本文件為準。

---

## 1. 專案目的

這是一個「LLM Wiki」型態的個人知識庫網站，主題是 **LLM 應用工程**（RAG、AI Agent、評估、MLOps）。

- 我（專案擁有者）負責：丟原始資料、決定要寫什麼、驗收。
- 你（AI）負責：把原始資料整理成結構一致的 Wiki 條目、維護條目之間的連結、確保網站能正常建置與瀏覽。
- 目標讀者：正在學 LLM 應用的研究生與工程師。寫作要像「學長姐的整理筆記」——精準、有例子、不賣弄。

網站是純靜態網頁，部署在 GitHub Pages，不需要後端。

---

## 2. 資料夾結構（不要任意新增頂層資料夾）

```
ai-notes-wiki/
├── AGENTS.md              ← 本文件（規則的唯一來源）
├── CLAUDE.md              ← 只是轉址到 AGENTS.md，不要在裡面寫規則
├── README.md              ← 給人類看的專案介紹
├── log.md                 ← 變更紀錄（每次修改都要追加一行）
├── site.config.json       ← 網站名稱、分類清單（分類只能從這裡選）
├── index.html             ← 網站入口（單頁應用，通常不需修改）
├── assets/
│   ├── style.css          ← 全站樣式（所有樣式都寫在這裡）
│   ├── app.js             ← 前端路由與渲染
│   └── vendor/marked.min.js ← Markdown 解析器（第三方，禁止修改）
├── raw/                   ← 原始資料：上課筆記、論文摘要、網頁剪貼（AI 只讀不改）
├── wiki/                  ← Wiki 條目（AI 主要工作區）
│   ├── <slug>.md
│   └── manifest.json      ← 由腳本自動產生，禁止手動編輯
├── templates/
│   └── entry.md           ← 新條目的範本
├── scripts/
│   └── build.py           ← 驗證條目並產生 manifest.json
└── .github/workflows/check.yml ← 推上 GitHub 時自動驗證
```

### 各區權限

| 位置 | AI 可以 | AI 不可以 |
|---|---|---|
| `raw/` | 讀取、引用 | 修改或刪除（這是原始證據） |
| `wiki/*.md` | 新增、修改 | 刪除條目（需先問我） |
| `wiki/manifest.json` | 透過 `build.py` 重新產生 | 手動編輯 |
| `assets/style.css`, `assets/app.js` | 在我要求改版面時修改 | 為了單一條目去改全站樣式 |
| `assets/vendor/` | — | 任何修改 |
| `site.config.json` | 我同意後新增分類 | 自行發明新分類 |
| `AGENTS.md` | 提出修改建議 | 未經同意直接改寫規則 |

---

## 3. 網頁風格

- **調性**：像一本乾淨的研究筆記本。米白紙張底色、深墨色文字、單一強調色（墨綠 `--accent`）。支援深色模式（跟隨系統）。
- **字體**：標題用襯線字（Noto Serif TC / 思源宋體 fallback），內文用無襯線字。全部使用系統或 fallback 字體，不載入外部字型 CDN。
- **版面**：左側為分類導覽＋搜尋，右側為內容。手機版導覽收合到頂部。
- **條目頁面**組成固定為：麵包屑（分類）→ 標題 → 摘要 → 標籤與更新日期 → 內文 → 參考來源 → 「連到這頁的條目」（反向連結）。
- **不要**加入：彈跳視窗、動畫特效、表情符號標題、外部追蹤碼、外部 CDN 腳本。
- 所有顏色、間距只能用 `style.css` 頂部定義的 CSS 變數，不要在條目或 JS 裡寫死顏色。

---

## 4. 新增一個 Wiki 條目的標準作業流程（SOP）

當我說「幫我新增一篇關於 X 的條目」或「把 raw/ 裡的 Y 整理進 wiki」時，依序執行：

1. **先讀**：`site.config.json`（有哪些分類）、`wiki/manifest.json`（已有哪些條目，避免重複）、相關的 `raw/` 檔案。
2. **檢查重複**：如果已有主題相近的條目，優先「擴充既有條目」而不是新開一篇，並先告訴我你的判斷。
3. **複製範本**：以 `templates/entry.md` 為基礎，建立 `wiki/<slug>.md`。
4. **填寫 frontmatter**（格式見第 5 節）。
5. **撰寫內文**（格式見第 6 節）。
6. **建立連結**：至少用 `[[slug]]` 連到 1 篇既有條目；如果既有條目應該提到新條目，也回頭在該條目加上連結。
7. **執行驗證**：`python3 scripts/build.py`，必須顯示 `✓` 且沒有錯誤。有錯誤就修到通過為止。
8. **寫紀錄**：在 `log.md` 最上方追加一行（格式見第 8 節）。
9. **回報**：告訴我新增/修改了哪些檔案、連到哪些條目、有沒有拿不準需要我確認的內容。

---

## 5. 條目檔案格式

### 5.1 檔名與 slug

- 檔名 = `wiki/<slug>.md`，slug 必須與 frontmatter 的 `slug` 完全相同。
- slug 只用**小寫英文、數字、連字號**：`rag-basics`、`chunking-strategies`。不要用中文、空白、底線。
- slug 一旦發布就**不要改**（會讓別人的連結失效）。要改名只改 `title`。
- 以 `_` 開頭的檔案（例如 `_draft-xxx.md`）會被建置腳本忽略，可當草稿。

### 5.2 Frontmatter（必填）

```yaml
---
title: 條目的中文標題
slug: kebab-case-slug
category: concept          # 只能是 site.config.json 裡 categories 的 id
tags: [RAG, 檢索]           # 1–5 個，中英文皆可，沿用既有標籤優先
updated: 2026-11-16        # YYYY-MM-DD，每次實質修改都要更新
summary: 一句話說明這頁在講什麼（80 字以內）
sources: [raw/09-agentic-work.md, https://example.com]   # 選填，但有就要寫
---
```

- frontmatter 只支援「`key: value`」與「`key: [a, b, c]`」兩種寫法，不要用多行 YAML 清單。
- 目前分類（以 `site.config.json` 為準）：`concept` 概念、`practice` 實作、`course` 課程筆記。

---

## 6. 內文寫作規則

1. **不要寫 H1（`#`）**，標題由 frontmatter 自動顯示。內文從 `##` 開始。
2. 每篇固定骨架（可依內容增加小節，但這三節必須有）：
   - `## 一句話理解` — 用白話＋比喻講清楚核心概念。
   - 中間若干 `##` 小節 — 正文。
   - `## 延伸閱讀` — 用 `[[slug]]` 列出相關條目。
3. **內部連結**用 `[[slug]]` 或 `[[slug|顯示文字]]`。不要寫成 `[文字](wiki/xxx.md)`。
4. 外部連結用一般 Markdown `[文字](https://...)`，並且要列進 `sources`。
5. 程式碼區塊必須標語言：```` ```python ````。
6. 用**繁體中文**、台灣用語（「程式碼」而非「代碼」、「資料」而非「數據」）。專有名詞第一次出現時附英文，例如「檢索增強生成（Retrieval-Augmented Generation, RAG）」。
7. 每篇長度建議 400–1500 字。太長就拆成兩篇並互相連結。
8. **不確定的事不要編**。資料不足時寫 `> ⚠️ 待確認：...`，並在回報中告訴我。
9. 引用 `raw/` 的內容要改寫成自己的話，不要大段照抄。
10. 表格適合比較，清單適合步驟，不要整篇都是條列。

---

## 7. 修改網站程式（只在我明確要求時）

- 不引入任何建置工具（webpack、Vite、React…）。保持「打開就能跑」的純 HTML/CSS/JS。
- 新功能優先在 `app.js` 既有的函式中擴充，不新增 JS 檔。
- 改完必須在本機預覽確認：`python3 -m http.server 8000`，打開 `http://localhost:8000`，至少檢查首頁、一篇條目、一個標籤頁、手機寬度。
- 不要為了某一篇條目在 JS 裡寫特例。

---

## 8. 變更紀錄格式（log.md）

每次修改在 `log.md` 的「## 紀錄」下方**最上面**追加一行：

```
- 2026-11-16 | add | rag-evaluation | 新增 RAG 評估條目，連到 rag-basics、chunking-strategies
```

動作只能是：`add`（新增）、`update`（修改）、`link`（只加連結）、`site`（改網站程式或樣式）、`rule`（改 AGENTS.md）。

---

## 9. 完成的定義（Definition of Done）

一項工作只有在以下全部成立時才算完成：

- [ ] `python3 scripts/build.py` 通過，沒有錯誤
- [ ] 新條目在首頁與分類中出現，`[[連結]]` 都能點
- [ ] frontmatter 的 `updated` 已更新
- [ ] `log.md` 已追加紀錄
- [ ] 已向我回報變更內容與待確認事項

---

## 10. 常見指令範例（我可能會這樣交辦）

| 我說 | 你應該做 |
|---|---|
| 「把 raw/xxx.md 整理成條目」 | 走第 4 節 SOP，分類由你判斷並說明理由 |
| 「幫 rag-basics 補一段 Hybrid Search」 | 修改既有條目，更新 `updated`，log 記 `update` |
| 「檢查一下 wiki 健康度」 | 跑 `build.py`，列出：孤兒條目（沒有任何反向連結）、超過 90 天沒更新的條目、只有 1 個標籤的條目 |
| 「新增分類：工具」 | 先確認 id 與名稱，再改 `site.config.json`，log 記 `rule` |
