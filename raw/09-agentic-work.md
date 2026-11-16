# 原始筆記：第 09 週「換你當老闆：Agentic Work 與 AI 工作現場」

> 這是 raw/ 資料夾的範例：上課當下的速記，不追求格式。AI 會把它整理成 wiki/ 裡的條目。

- AI Agent = AI Model + Harness。模型負責想（理解、規劃、判斷），Harness 負責做（真的去開檔、跑程式，再把結果回報給模型）。
- 課程路線：Prompt Engineering → Context Engineering → Harness Engineering → Loop Engineering → Graph Engineering。
- 上一單元用 AISuite 自己寫 agent（Reflection / Tool Use / Planning），自己寫函數當工具、自己寫 system prompt、自己處理錯誤重試。
- 現成的 agentic 工具：工具換成內建的讀寫檔、終端機、搜尋；system prompt 換成 CLAUDE.md / AGENTS.md；錯誤處理交給產品。
- Harness 六件套：工作環境（沙盒）、工具、連接器（MCP）、技能（SKILL.md）、規則檔（CLAUDE.md / AGENTS.md）、排程。
- 對話式 vs 代理式：問問題 vs 交辦工作；顧問 vs 同事；一問一答 vs 多步驟自己做；拿到回答 vs 拿到成品。
- 例子：「幫我整理桌面」。Chat 模式下 AI 出一張嘴、事情都你做；Agent 模式下你出一張嘴、AI 做。
- 好老闆交辦要講清楚三件事：要什麼成品、有什麼限制、怎麼算做完。重點：不要讓 AI 猜。
- 好的交辦範例：指定資料夾、分類依據、命名語言、不要刪檔、看不出用途放「待確認」、動手前先給計畫、做完列出每個檔案去哪。
- 專案型 agent 通常設一個專案資料夾，裡面放一本「員工手冊」（CLAUDE.md / AGENTS.md），每次開新對話先叫 AI 讀它。好處：對話太長、換電腦都不怕。手冊不用一次寫完美，可以和 AI 一起持續改。
- 範例：呆一布講義資料夾 = CLAUDE.md + ideas + slide_notes + assets + index.html + presentation。
- Karpathy 的 LLM Wiki：raw（你找的資料）→ AI 依規則產生/修改 → wiki（含 index.md）。等於打造自己的 Wikipedia。
