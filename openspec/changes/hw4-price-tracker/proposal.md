## Why

這份變更用來完成作業 4「通貨膨脹／個人化 CPI」：以「CPU」為主題建立一個可輸入並追蹤價格的網站，讓使用者用自己的消費資料理解物價變化。

## What Changes

- 新增一個可在本機以 `npm start` 啟動的網站專案（前端 + 後端 + 資料庫）。
- 後端使用 Express.js 提供 Web API：新增一筆物價紀錄、查詢歷史紀錄。
- 資料庫使用 SQLite：將（日期、CPU 型號、商品價格）持久化保存，重新整理後資料仍存在。
- 前端使用純 HTML/CSS/JavaScript：提供輸入介面（CPU 固定選單）與表格/清單方式呈現歷史紀錄，並提供簡易查詢（文字搜尋縮小範圍）。
- （選做/加分）提供從 PChome 抓取目前價格的功能，協助使用者快速填入價格。
- 產出 README/文件模板，方便撰寫 HackMD/Notion 的教學說明。

## Capabilities

### New Capabilities

- `price-tracker`: 物價追蹤（輸入、保存、查詢、呈現）端到端功能與其 API/DB/UI 規格。

### Modified Capabilities

- （無）

## Impact

- 新增 Node.js 專案檔案（`server.js`、`public/`、`package.json` 等）。
- 新增相依：`express`、`sqlite3`。
- 本機會產生 SQLite 檔案（例如 `data.db`），需以 `.gitignore` 排除不提交到 GitHub。
