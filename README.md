# AI 工程筆記本（AI Notes Wiki）

一個依照 **LLM Wiki** 模式打造的個人知識庫：我把上課筆記、論文摘要等原始資料丟進 `raw/`，AI 依照 [`AGENTS.md`](./AGENTS.md) 的規則，整理成 `wiki/` 裡格式一致、互相連結的條目，並自動呈現在網站上。

主題：RAG、AI Agent 與 LLM 應用工程。

🔗 網站：`https://<你的帳號>.github.io/ai-notes-wiki/`

## 這個專案的重點

這不是「做一個網頁」，而是建立**一套可以一直延續的工作方式**：

```
raw/（原始資料）──AI 依 AGENTS.md 整理──▶ wiki/*.md ──build.py 驗證──▶ manifest.json ──▶ 網站
```

| 檔案 | 角色 |
|---|---|
| `AGENTS.md` | 給 AI 的員工手冊：目的、風格、結構、格式、SOP、完成的定義 |
| `CLAUDE.md` | 轉址到 `AGENTS.md`，讓 Claude 也自動讀到同一份規則 |
| `templates/entry.md` | 新條目範本 |
| `scripts/build.py` | 把規則變成可執行的檢查：缺欄位、壞連結、分類錯誤都會報錯 |
| `.github/workflows/check.yml` | 每次 push 自動跑檢查 |
| `log.md` | AI 每次修改都要留下的變更紀錄 |

## 本機預覽

只需要 Python 3，不用安裝任何套件：

```bash
python3 scripts/build.py          # 驗證條目並產生 wiki/manifest.json
python3 -m http.server 8000       # 打開 http://localhost:8000
```

> 直接雙擊 `index.html` 會因為瀏覽器安全限制讀不到資料，請用上面的方式開。

## 讓 AI 新增一篇條目

開新對話後，直接這樣交辦：

```
請先讀 AGENTS.md。
接著把 raw/xxx.md 整理成一篇新的 wiki 條目，依照第 4 節的 SOP 完成，
最後跑 build.py 確認通過，並回報你改了哪些檔案。
```

## 部署到 GitHub Pages

1. 在 GitHub 建立公開 repo `ai-notes-wiki`，把整個資料夾推上去。
2. Repo → **Settings → Pages** → Source 選 **Deploy from a branch**，Branch 選 `main`、資料夾 `/ (root)`，按 Save。
3. 約一分鐘後即可在 `https://<你的帳號>.github.io/ai-notes-wiki/` 瀏覽。
4. 把 `assets/app.js` 最上面的 `REPO_URL` 改成你的 repo 網址（讓「原始檔」與 AGENTS.md 連結正確）。

## 授權

條目內容 © Ting。`assets/vendor/marked.min.js` 為 [marked](https://github.com/markedjs/marked)（MIT License）。
