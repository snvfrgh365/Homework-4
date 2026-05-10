## 1. 專案初始化

- [x] 1.1 建立 Node.js 專案（package.json、npm scripts：start）
- [x] 1.2 新增 `.gitignore`（排除 `node_modules/`、`data.db`、`.env`）
- [x] 1.3 建立 Express 入口 `server.js` 與 `public/` 靜態目錄

## 2. SQLite 與 Web API

- [x] 2.1 建立 SQLite 連線並初始化 `prices` 資料表
- [x] 2.2 實作 `GET /api/prices` 回傳歷史紀錄（支援 `?q=` 模糊搜尋可選）
- [x] 2.3 實作 `POST /api/prices` 新增紀錄（驗證 date/name/price）
- [x] 2.4 以 `process.env.PORT || 3000` 啟動伺服器並同時提供 static + API

## 3. 前端頁面（純 HTML/CSS/JS）

- [x] 3.1 首頁顯示網站標題、輸入表單（日期/商品/價格）
- [x] 3.2 前端用 `fetch` 呼叫 API：新增後重新載入清單
- [x] 3.3 以表格/清單呈現歷史紀錄
- [x] 3.4 加入文字搜尋（縮小目前顯示範圍）

## 4. 驗證與文件

- [x] 4.1 本機可 `npm install` 與 `npm start` 成功啟動
- [x] 4.2 準備至少 3 筆測試資料（可透過 UI 新增）
- [x] 4.3 撰寫 README：本機執行流程、API 說明、截圖清單
- [x] 4.4 以 `openspec validate` / `openspec status` 確認 change 工件完整

## 5. CPU 主題與 PChome 抓價（選做/加分）

- [x] 5.1 將商品名稱改為 CPU 型號下拉選單（鎖定 Intel/AMD 幾個型號）
- [x] 5.2 後端新增 `GET /api/pchome-price`：以關鍵字抓取 PChome 第一筆搜尋結果價格
- [x] 5.3 前端新增「從 PChome 抓價」按鈕：自動填入價格並顯示來源連結

## 6. 折線圖分析（選做/加分）

- [x] 6.1 首頁新增折線圖分析區塊（選擇 CPU + canvas）
- [x] 6.2 前端載入圖表套件並將歷史紀錄繪製成折線圖
- [x] 6.3 新增/載入資料後折線圖同步更新；無資料顯示提示
