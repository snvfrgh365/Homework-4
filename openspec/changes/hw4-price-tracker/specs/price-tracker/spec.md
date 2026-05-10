## ADDED Requirements

### Requirement: 顯示網站標題
網站首頁 UI **SHALL** 顯示一個可自訂的網站標題文字（與所選商品主題相關）。

#### Scenario: 標題可見
- **WHEN** 使用者打開首頁
- **THEN** 頁面頂部顯示網站標題

### Requirement: 使用者可新增物價紀錄
系統 **SHALL** 讓使用者輸入【日期】、【CPU 型號】、【商品價格】並送出新增一筆物價紀錄。
CPU 型號 **SHALL** 由預先定義的 Intel/AMD 型號清單選擇（避免範圍過大）。

#### Scenario: 成功新增一筆紀錄
- **WHEN** 使用者送出有效的日期、CPU 型號與價格
- **THEN** 系統將紀錄寫入資料庫，且歷史清單出現該筆資料

#### Scenario: 欄位驗證失敗
- **WHEN** 使用者送出缺少欄位或價格不是非負整數
- **THEN** 系統回應錯誤並不建立紀錄

### Requirement: 物價紀錄需持久化保存
系統 **MUST** 使用 SQLite 持久化保存物價紀錄，使重新整理頁面後資料仍存在。

#### Scenario: 重新整理後資料仍存在
- **WHEN** 使用者新增多筆紀錄後重新整理頁面
- **THEN** 頁面仍可載入並顯示先前新增的紀錄

### Requirement: 顯示物價歷史紀錄
網站首頁 UI **SHALL** 以表格或清單呈現所有已保存的物價歷史紀錄。

#### Scenario: 開啟頁面時載入歷史紀錄
- **WHEN** 使用者打開首頁
- **THEN** 前端向後端 API 取得紀錄並以表格/清單顯示

### Requirement: （選做/加分）折線圖分析
網站首頁 UI **SHALL** 提供折線圖分析，以「日期」為 X 軸、「價格」為 Y 軸，顯示使用者所選 CPU 的價格趨勢。

#### Scenario: 有資料時顯示折線圖
- **WHEN** 使用者選擇某一個 CPU 且該 CPU 有歷史紀錄
- **THEN** 系統顯示該 CPU 的日期-價格折線圖

#### Scenario: 沒有資料時顯示提示
- **WHEN** 使用者選擇的 CPU 沒有任何歷史紀錄
- **THEN** 系統顯示提示文字並不顯示折線圖

### Requirement: 簡易查詢（文字搜尋）
網站首頁 UI **SHALL** 提供文字搜尋，讓使用者能縮小目前顯示的歷史紀錄範圍（以 CPU 型號關鍵字比對）。

#### Scenario: 輸入關鍵字後縮小範圍
- **WHEN** 使用者在搜尋框輸入關鍵字
- **THEN** 畫面只顯示 CPU 型號包含該關鍵字的紀錄

### Requirement: （選做/加分）可從 PChome 抓取價格
網站首頁 UI **SHALL** 提供「從 PChome 抓價」功能，依使用者選擇的 CPU 型號關鍵字，向後端請求並自動填入價格欄位。

#### Scenario: 抓價成功並填入價格
- **WHEN** 使用者點擊「從 PChome 抓價」
- **THEN** 系統顯示抓到的價格並填入價格欄位，且提供來源商品頁連結

#### Scenario: 抓價失敗時可手動輸入
- **WHEN** PChome 暫時不可用或找不到商品
- **THEN** 系統顯示錯誤訊息，且使用者仍可手動輸入價格並新增紀錄

### Requirement: 後端提供 Web API 供前端讀寫
後端 **MUST** 提供 JSON Web API，供前端寫入與讀取物價紀錄。

#### Scenario: 取得清單成功
- **WHEN** 前端呼叫 `GET /api/prices`
- **THEN** 後端回傳 `200` 與 JSON 陣列（包含所有紀錄）

#### Scenario: 新增紀錄成功
- **WHEN** 前端以 JSON 呼叫 `POST /api/prices`
- **THEN** 後端回傳 `201`，且資料被持久化保存
