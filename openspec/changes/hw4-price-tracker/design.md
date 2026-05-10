## Context

- 目標：完成作業 4 的「CPU 價格追蹤網站」，包含純前端頁面、Express Web API、SQLite 資料庫。
- 限制：前端不可使用框架；功能以「輸入（日期/CPU/價格）」與「表格/清單呈現歷史紀錄」為主，查詢維持簡易（例如文字搜尋）。
- 使用情境：同學/老師可在本機 `npm install`、`npm start` 後於 `http://localhost:<port>` 操作。

## Goals / Non-Goals

**Goals:**
- 提供單頁面 UI：輸入日期、CPU 型號（固定選單）、商品價格，送出後寫入資料庫。
- 重新整理頁面後仍可看到已保存資料（驗證 SQLite 持久化）。
- 以表格呈現歷史紀錄，並提供一個文字框做簡易搜尋/縮小範圍。
- 後端提供最小必要 API：新增紀錄、列出紀錄。
- （選做/加分）提供按鈕從 PChome 以關鍵字抓取目前價格，並自動填入價格欄位。

**Non-Goals:**
- 不做登入/權限、多使用者、刪除/編輯紀錄、圖表分析、匯出檔案等延伸功能。
- 不做完整比價/多頁爬蟲（例如爬多筆結果、解析規格、比對不同賣場），僅示範用關鍵字抓取第一筆價格。
- 不做雲端部署（若需要加分再另開 change）。

## Decisions

- 技術選擇：
  - 後端：Node.js + Express，並同時提供 static `public/`（不額外上前端伺服器）。
  - DB：SQLite（`sqlite3` 套件），以檔案 `data.db` 保存於專案根目錄。
  - 前端：純 HTML/CSS/JavaScript，使用 `fetch` 呼叫 `/api/prices`。
- 資料模型：建立 `prices` 表：`id`、`date`(YYYY-MM-DD)、`name`、`price`(整數)、`created_at`。
- API 設計（最小集合）：
  - `GET /api/prices`：回傳所有紀錄（可選 `?q=` 作名稱模糊搜尋）。
  - `POST /api/prices`：新增一筆紀錄（JSON：`date`、`name`、`price`）。
- （選做/加分）抓價 API：
  - `GET /api/pchome-price?q=<keyword>`：後端呼叫 PChome 搜尋 JSON 介面並取第一筆結果回傳（包含 `price` 與 `url`）。
- 抓價效能：同一個查詢關鍵字以 60 秒 TTL 快取，避免短時間連續打 PChome。
- （選做/加分）折線圖分析：
  - 前端使用 Chart.js（npm 安裝；後端以 `/vendor` 靜態提供）在同一頁面渲染折線圖。
  - 折線圖依「分析 CPU」下拉選單決定資料集，X 軸為日期、Y 軸為價格。
  - 當使用者新增紀錄或重新載入清單時，折線圖同步更新。
- 輸入驗證：後端驗證欄位存在、價格為非負整數；錯誤回 `400` + JSON 訊息。
- 部署相容：`PORT = process.env.PORT || 3000`（利於加分的 Render/Azure 部署）。

## Risks / Trade-offs

- [sqlite3 原生編譯問題] → 以 Node 版本下限（`engines.node`）與 README 提示降低環境差異；若真的遇到問題可替換 `better-sqlite3`（不在本 change 範圍）。
- [日期格式不一致] → 前端使用 `<input type="date">`；後端僅接受 `YYYY-MM-DD` 字串。
- [資料庫檔案被提交] → 提供 `.gitignore` 排除 `data.db`。
- [PChome 介面變動或暫時不可用] → 抓價失敗時顯示錯誤並允許手動輸入價格；以最小請求與快取降低被擋風險。
- [Chart.js 檔案無法載入] → 顯示提示文字，且不影響手動新增/查詢功能。
