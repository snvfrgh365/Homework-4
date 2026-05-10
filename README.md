# 作業4：CPU 價格觀測站（Express + SQLite + Vanilla JS）

這個專案是一個最小可交版的「個人化 CPI 物價追蹤網站」（主題：CPU）：
- 可輸入【日期 / CPU 型號 / 商品價格】（CPU 型號為固定選單）
- 以表格呈現歷史紀錄
- 支援文字搜尋（簡易查詢）
- 使用 SQLite 持久保存（重新整理頁面資料仍存在）
- 用 OpenSpec 紀錄規格與實作任務
- （選做/加分）可從 PChome 抓取目前價格，自動填入價格欄位
- （選做/加分）提供折線圖分析（依 CPU 顯示日期-價格趨勢）

> 折線圖使用 `chart.js`（npm 安裝），由後端透過 `/vendor/chart.umd.min.js` 提供，不依賴 CDN。

## 1) 本機啟動

```bash
npm install

# （可選）建立測試資料
npm run seed

npm start
```

啟動後打開：
- http://localhost:3000

> 若你要改 port：設定環境變數 `PORT`，例如 `PORT=4000 npm start`

## 2) 使用方式

1. 在「新增一筆物價」選擇 CPU 型號，填入日期與價格
2. （選做/加分）可按「從 PChome 抓價」自動填入價格
3. 按「新增」後，下方表格會出現資料
4. 重新整理頁面後資料仍會存在（SQLite）
5. 右上「搜尋」輸入關鍵字，可縮小顯示範圍
6. 在「折線圖分析」選擇 CPU，可看到價格折線圖趨勢

### 修改網站標題

直接改 [public/index.html](public/index.html) 內的 `<title>` 與 `<h1>` 文字即可。

## 3) API 規格（給前端用）

### 取得清單

- `GET /api/prices`
- 可選：`GET /api/prices?q=<keyword>`（以商品名稱模糊搜尋）

回傳：JSON 陣列

### 新增一筆

- `POST /api/prices`
- Header：`Content-Type: application/json`
- Body：

```json
{ "date": "2026-05-11", "name": "AMD Ryzen 7 7800X3D", "price": 12950 }
```

成功：`201` + 新增後的物件
失敗：`400` + `{ "error": "..." }`

### （選做/加分）從 PChome 抓價

- `GET /api/pchome-price?q=<keyword>`
- 範例：`/api/pchome-price?q=Ryzen%207%207800X3D`

回傳：
- `price`：PChome 搜尋結果的第一筆價格
- `url`：對應商品頁

> 注意：此功能是「示範爬蟲/抓價」，使用的是 PChome 搜尋 JSON 介面並取第一筆結果；可能會因為關鍵字或排序而抓到不同商品。

## 4) SQLite 資料庫

- 檔案：`data.db`（專案根目錄）
- 資料表：`prices`（id, date, name, price, created_at）

> `data.db` 已在 `.gitignore` 排除，請不要上傳到 GitHub。

## 5) OpenSpec（如何把實作過程記錄成規格表）

本專案的 change 放在：
- [openspec/changes/hw4-price-tracker](openspec/changes/hw4-price-tracker)

常用指令：

```bash
# 看有哪些 change
openspec list

# 看某個 change 的工件完成度
openspec status --change "hw4-price-tracker"

# 以 markdown 顯示 change（方便貼到 HackMD/Notion）
openspec show "hw4-price-tracker" --type change

# 驗證 spec / change 格式
openspec validate --changes
```

當你確認功能做完、想把 change 封存進主 specs（選做）：

```bash
openspec archive "hw4-price-tracker"
```

## 6) 作業文件建議截圖清單（HackMD/Notion）

- 終端機：`npm start` 啟動成功畫面
- 網頁：
  - 首頁（有標題）
  - 新增一筆資料
  - 看到表格清單
  - 折線圖分析（CPU 價格趨勢）
  - 重新整理後資料仍存在
- OpenSpec：`openspec show hw4-price-tracker --type change` 輸出（當作 spec 規格表/實作紀錄）

> 若 PowerShell 輸出中文亂碼：先跑 `chcp 65001`，再跑 `$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8`
