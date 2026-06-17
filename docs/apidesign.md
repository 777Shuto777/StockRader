# 株式材料監視ダッシュボード API設計書 v0.1

## 1. ドキュメント情報

| 項目      | 内容                                                    |
| ------- | ----------------------------------------------------- |
| ドキュメント名 | 株式材料監視ダッシュボード API設計書                                  |
| バージョン   | 0.1                                                   |
| 対応要件定義  | 株式材料監視ダッシュボード v0.1.3                                  |
| 対応DB設計  | DB設計書 v0.1                                            |
| 対応業務ルール | 業務ルール設計書 v0.1                                         |
| 技術構成    | Next.js Route Handlers + Prisma + Supabase PostgreSQL |
| 目的      | フロントエンドとバックエンド間のAPI仕様を定義する                            |

---

## 2. API設計の基本方針

### 2.1 Route Handlers経由でDB操作する

v0.1では、ブラウザからSupabase DBを直接操作しない。

DB操作はすべて Next.js Route Handlers 経由で行う。

理由：

* `service_role key` をブラウザに露出させない
* 業務ルールをサーバー側で必ず検証する
* ロック制御やサイズ超過ブロックを確実に行う
* Prismaで型安全にDB操作する

---

### 2.2 サーバー側で必ず再検証する

フロントエンドでも入力チェックは行うが、以下は必ずAPI側で再検証する。

* 銘柄コード検証
* 注目開示の重複判定
* 材料キーワード分類
* 買い計画の確定条件
* リスク逆算サイジング
* 推奨株数超過ブロック
* 取引計画ロック
* ロック後の更新制御
* 検証ログの取引計画紐づけ

---

### 2.3 v0.1ではREST風APIとする

v0.1では、シンプルなREST風APIで設計する。

GraphQLやtRPCは使わない。

理由：

* Codexに実装させやすい
* Next.js Route Handlersで扱いやすい
* MVPでは複雑なAPI設計が不要

---

## 3. 共通仕様

### 3.1 ベースパス

```text
/api
```

---

### 3.2 データ形式

リクエスト・レスポンスは原則JSONとする。

```http
Content-Type: application/json
```

---

### 3.3 認証・アクセス制御

v0.1では簡易アクセス制御を前提とする。

候補：

* Basic認証
* 簡易ログイン
* middlewareによる保護

APIは、認証されていないリクエストに対して `401 Unauthorized` を返す。

---

### 3.4 共通レスポンス形式

#### 成功時

```json
{
  "success": true,
  "data": {}
}
```

一覧取得の場合：

```json
{
  "success": true,
  "data": [],
  "meta": {
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

---

#### エラー時

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "損切価格はエントリー予定価格より低く入力してください。",
    "details": {}
  }
}
```

---

### 3.5 共通エラーコード

| HTTP Status | code                    | 内容         |
| ----------: | ----------------------- | ---------- |
|         400 | `VALIDATION_ERROR`      | 入力値が不正     |
|         401 | `UNAUTHORIZED`          | 未認証        |
|         403 | `FORBIDDEN`             | 操作権限なし     |
|         404 | `NOT_FOUND`             | 対象データなし    |
|         409 | `CONFLICT`              | 重複・状態競合    |
|         423 | `LOCKED`                | ロック済みで更新不可 |
|         500 | `INTERNAL_SERVER_ERROR` | サーバーエラー    |

---

### 3.6 ページング仕様

一覧APIは以下のクエリを受け取る。

| パラメータ      | 型      | デフォルト | 内容             |
| ---------- | ------ | ----: | -------------- |
| `page`     | number |     1 | ページ番号          |
| `pageSize` | number |    20 | 1ページ件数         |
| `sort`     | string |    任意 | ソート対象          |
| `order`    | string |  desc | `asc` / `desc` |

---

## 4. API一覧

| No | Method | Endpoint                            | 内容            |
| -: | ------ | ----------------------------------- | ------------- |
|  1 | GET    | `/api/health`                       | ヘルスチェック       |
|  2 | GET    | `/api/stocks`                       | 銘柄一覧取得        |
|  3 | PATCH  | `/api/stocks/{code}`                | 銘柄メモ更新        |
|  4 | GET    | `/api/disclosures`                  | 注目開示一覧取得      |
|  5 | POST   | `/api/disclosures`                  | 注目開示登録        |
|  6 | PATCH  | `/api/disclosures/{id}`             | 注目開示更新        |
|  7 | DELETE | `/api/disclosures/{id}`             | 注目開示削除        |
|  8 | POST   | `/api/disclosures/{id}/watchlist`   | 開示から監視リスト追加   |
|  9 | POST   | `/api/disclosures/{id}/trade-plans` | 開示から取引計画作成    |
| 10 | GET    | `/api/watchlist`                    | 監視リスト一覧取得     |
| 11 | POST   | `/api/watchlist`                    | 監視リスト手動登録     |
| 12 | PATCH  | `/api/watchlist/{id}`               | 監視リスト更新       |
| 13 | DELETE | `/api/watchlist/{id}`               | 監視リスト削除       |
| 14 | POST   | `/api/watchlist/{id}/trade-plans`   | 監視リストから取引計画作成 |
| 15 | GET    | `/api/trade-plans`                  | 取引計画一覧取得      |
| 16 | POST   | `/api/trade-plans`                  | 取引計画手動作成      |
| 17 | GET    | `/api/trade-plans/{id}`             | 取引計画詳細取得      |
| 18 | PATCH  | `/api/trade-plans/{id}`             | 取引計画更新        |
| 19 | POST   | `/api/trade-plans/{id}/commit`      | 取引計画確定        |
| 20 | POST   | `/api/trade-plans/{id}/execute`     | 取引計画実行済みに変更   |
| 21 | POST   | `/api/trade-plans/{id}/close`       | 取引計画終了        |
| 22 | DELETE | `/api/trade-plans/{id}`             | 下書き取引計画削除     |
| 23 | POST   | `/api/trade-plans/calculate-risk`   | リスク逆算サイジング計算  |
| 24 | GET    | `/api/verification-logs`            | 検証ログ一覧取得      |
| 25 | POST   | `/api/verification-logs`            | 検証ログ作成        |
| 26 | PATCH  | `/api/verification-logs/{id}`       | 検証ログ更新        |
| 27 | GET    | `/api/keyword-rules`                | キーワードルール一覧取得  |
| 28 | GET    | `/api/app-settings`                 | アプリ設定取得       |

---

## 5. ヘルスチェックAPI

## 5.1 GET `/api/health`

### 目的

アプリとDB接続が正常か確認する。

### レスポンス例

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected"
  }
}
```

---

## 6. 銘柄API

## 6.1 GET `/api/stocks`

### 目的

銘柄マスタを検索・一覧取得する。

### Query Parameters

| パラメータ      | 型      | 内容          |
| ---------- | ------ | ----------- |
| `q`        | string | 銘柄コード・銘柄名検索 |
| `page`     | number | ページ番号       |
| `pageSize` | number | 件数          |

### レスポンス例

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "code": "6659",
      "name": "メディアリンクス",
      "market": null,
      "memo": null,
      "createdAt": "2026-05-28T06:30:00.000Z",
      "updatedAt": "2026-05-28T06:30:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## 6.2 PATCH `/api/stocks/{code}`

### 目的

銘柄メモや市場区分を更新する。

### 更新可能項目

| 項目       | 内容     |
| -------- | ------ |
| `name`   | 銘柄名    |
| `market` | 市場区分   |
| `memo`   | 銘柄全体メモ |

### リクエスト例

```json
{
  "memo": "赤字小型株。材料で急騰しやすいがリスク高い。"
}
```

---

## 7. 注目開示API

## 7.1 GET `/api/disclosures`

### 目的

登録済みの注目開示を一覧取得する。

### Query Parameters

| パラメータ       | 型       | 内容               |
| ----------- | ------- | ---------------- |
| `q`         | string  | 銘柄コード・銘柄名・タイトル検索 |
| `stockCode` | string  | 銘柄コード            |
| `category`  | string  | 主カテゴリ            |
| `isChecked` | boolean | 確認済み             |
| `from`      | string  | 開示日時From         |
| `to`        | string  | 開示日時To           |
| `page`      | number  | ページ番号            |
| `pageSize`  | number  | 件数               |

### レスポンス例

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "disclosedAt": "2026-05-28T06:30:00.000Z",
      "stockCode": "6659",
      "stockNameSnapshot": "メディアリンクス",
      "title": "大口受注に関するお知らせ",
      "url": "https://example.com",
      "primaryCategory": "大口受注",
      "matchedCategories": [
        {
          "category": "大口受注",
          "keyword": "大口受注",
          "score": 4,
          "priority": 80
        }
      ],
      "autoScore": 4,
      "userPriority": null,
      "isChecked": false
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## 7.2 POST `/api/disclosures`

### 目的

注目開示を手動登録する。

### 処理内容

1. 入力値を正規化する
2. 銘柄コードを検証する
3. 未登録銘柄なら `stocks` を作成する
4. `unique_key` を生成する
5. 重複チェックを行う
6. `keyword_rules` で材料分類する
7. `disclosures` に保存する

### リクエスト例

```json
{
  "disclosedAt": "2026-05-28T15:30:00+09:00",
  "stockCode": "6659",
  "stockName": "メディアリンクス",
  "title": "大口受注に関するお知らせ",
  "url": "https://example.com",
  "userPriority": null
}
```

### バリデーション

| 項目             | ルール            |
| -------------- | -------------- |
| `disclosedAt`  | 必須             |
| `stockCode`    | 必須。4〜5文字の半角英数字 |
| `stockName`    | 必須             |
| `title`        | 必須             |
| `url`          | 任意             |
| `userPriority` | 任意             |

### エラー例：重複開示

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "同じ開示がすでに登録されています。",
    "details": {}
  }
}
```

---

## 7.3 PATCH `/api/disclosures/{id}`

### 目的

注目開示の確認済みフラグやユーザー重要度を更新する。

### 更新可能項目

| 項目             | 内容      |
| -------------- | ------- |
| `isChecked`    | 確認済みフラグ |
| `userPriority` | ユーザー重要度 |
| `url`          | URL     |
| `title`        | 開示タイトル  |

### 注意

`title` を更新した場合、材料分類を再実行する。

---

## 7.4 DELETE `/api/disclosures/{id}`

### 目的

注目開示を削除する。

### 削除条件

以下に関連データがない場合のみ削除可能。

* `watchlist_items`
* `trade_plans`

関連データが存在する場合は `409 CONFLICT` を返す。

---

## 7.5 POST `/api/disclosures/{id}/watchlist`

### 目的

注目開示から監視リストを作成する。

### リクエスト例

```json
{
  "reason": "大口受注で短期資金が入りそうなため監視",
  "watchMemo": "赤字企業なので長期ではなく短期目線",
  "status": "UNCHECKED"
}
```

### 引き継ぎ項目

| watchlist_items     | disclosures         |
| ------------------- | ------------------- |
| `stockCode`         | `stockCode`         |
| `stockNameSnapshot` | `stockNameSnapshot` |
| `disclosureId`      | `id`                |
| `category`          | `primaryCategory`   |
| `reason`            | 指定がなければ `title`     |

---

## 7.6 POST `/api/disclosures/{id}/trade-plans`

### 目的

注目開示から直接取引計画を作成する。

### リクエスト例

```json
{
  "planType": "WATCH"
}
```

### 初期値

| trade_plans         | disclosures                         |
| ------------------- | ----------------------------------- |
| `stockCode`         | `stockCode`                         |
| `stockNameSnapshot` | `stockNameSnapshot`                 |
| `disclosureId`      | `id`                                |
| `thesis`            | `title`                             |
| `planStatus`        | `DRAFT`                             |
| `tradingUnit`       | `app_settings.default_trading_unit` |

---

## 8. 監視リストAPI

## 8.1 GET `/api/watchlist`

### 目的

監視リストを一覧取得する。

### Query Parameters

| パラメータ       | 型      | 内容             |
| ----------- | ------ | -------------- |
| `q`         | string | 銘柄コード・銘柄名・理由検索 |
| `stockCode` | string | 銘柄コード          |
| `status`    | string | 監視ステータス        |
| `category`  | string | 材料カテゴリ         |
| `page`      | number | ページ番号          |
| `pageSize`  | number | 件数             |

---

## 8.2 POST `/api/watchlist`

### 目的

監視リストを手動登録する。

### リクエスト例

```json
{
  "stockCode": "6659",
  "stockName": "メディアリンクス",
  "reason": "大口受注材料が気になる",
  "category": "大口受注",
  "status": "UNCHECKED",
  "watchMemo": "出来高と翌日の寄り付き確認"
}
```

### 処理内容

* 銘柄コード検証
* 未登録銘柄なら `stocks` 作成
* `watchlist_items` 作成

---

## 8.3 PATCH `/api/watchlist/{id}`

### 目的

監視リストのステータス・メモを更新する。

### 更新可能項目

| 項目          | 内容      |
| ----------- | ------- |
| `reason`    | 監視理由    |
| `category`  | 材料カテゴリ  |
| `status`    | 監視ステータス |
| `watchMemo` | 監視メモ    |

---

## 8.4 DELETE `/api/watchlist/{id}`

### 目的

監視リストを削除する。

### 削除条件

関連する `trade_plans` が存在しない場合のみ削除可能。

関連する取引計画が存在する場合は削除不可とし、`status = CLOSED` への変更を促す。

---

## 8.5 POST `/api/watchlist/{id}/trade-plans`

### 目的

監視リストから取引計画を作成する。

### リクエスト例

```json
{
  "planType": "BUY"
}
```

### 初期値

| trade_plans         | watchlist_items                     |
| ------------------- | ----------------------------------- |
| `stockCode`         | `stockCode`                         |
| `stockNameSnapshot` | `stockNameSnapshot`                 |
| `watchlistId`       | `id`                                |
| `disclosureId`      | `disclosureId`                      |
| `thesis`            | `reason`                            |
| `planStatus`        | `DRAFT`                             |
| `tradingUnit`       | `app_settings.default_trading_unit` |

---

## 9. 取引計画API

## 9.1 GET `/api/trade-plans`

### 目的

取引計画を一覧取得する。

### Query Parameters

| パラメータ        | 型       | 内容                                            |
| ------------ | ------- | --------------------------------------------- |
| `q`          | string  | 銘柄コード・銘柄名・仮説検索                                |
| `stockCode`  | string  | 銘柄コード                                         |
| `planType`   | string  | `BUY` / `NO_TRADE` / `WATCH`                  |
| `planStatus` | string  | `DRAFT` / `COMMITTED` / `EXECUTED` / `CLOSED` |
| `isLocked`   | boolean | ロック状態                                         |
| `page`       | number  | ページ番号                                         |
| `pageSize`   | number  | 件数                                            |

---

## 9.2 POST `/api/trade-plans`

### 目的

取引計画を手動作成する。

### リクエスト例：買い計画下書き

```json
{
  "stockCode": "6659",
  "stockName": "メディアリンクス",
  "planType": "BUY",
  "thesis": "大口受注材料により短期資金流入を想定",
  "plannedEntryPrice": 126,
  "plannedStopPrice": 115,
  "plannedTakeProfitPrice": 150,
  "maxHoldingDays": 3,
  "accountSizeSnapshot": 300000,
  "riskPercent": 1,
  "plannedQuantity": 200
}
```

### 作成時の扱い

* 初期 `planStatus` は `DRAFT`
* リスク計算可能な項目が揃っている場合、推奨株数を計算して保存する
* `DRAFT` では出口条件が未入力でも保存可能

---

## 9.3 GET `/api/trade-plans/{id}`

### 目的

取引計画の詳細を取得する。

### レスポンスに含める関連情報

* `stock`
* `disclosure`
* `watchlistItem`
* `verificationLogs`

---

## 9.4 PATCH `/api/trade-plans/{id}`

### 目的

取引計画を更新する。

### 更新可能条件

| 状態          | 更新可否             |
| ----------- | ---------------- |
| `DRAFT`     | 主要項目を更新可能        |
| `COMMITTED` | ロック対象項目は更新不可     |
| `EXECUTED`  | 実績・終了系のみ更新可能     |
| `CLOSED`    | 原則更新不可。検証ログで追記する |

### DRAFTで更新可能な主な項目

* `planType`
* `thesis`
* `noTradeReason`
* `plannedEntryPrice`
* `plannedStopPrice`
* `plannedTakeProfitPrice`
* `maxHoldingDays`
* `accountSizeSnapshot`
* `riskPercent`
* `tradingUnit`
* `plannedQuantity`

### COMMITTED以降で更新不可の項目

* `stockCode`
* `stockNameSnapshot`
* `disclosureId`
* `watchlistId`
* `planType`
* `thesis`
* `noTradeReason`
* `plannedEntryPrice`
* `plannedStopPrice`
* `plannedTakeProfitPrice`
* `maxHoldingDays`
* `accountSizeSnapshot`
* `riskPercent`
* `plannedRiskAmount`
* `plannedLossPerShare`
* `tradingUnit`
* `recommendedQuantity`
* `plannedQuantity`

### エラー例：ロック後編集

```json
{
  "success": false,
  "error": {
    "code": "LOCKED",
    "message": "この取引計画は確定済みのため、事前計画項目は編集できません。",
    "details": {
      "lockedFields": ["plannedStopPrice", "plannedQuantity"]
    }
  }
}
```

---

## 9.5 POST `/api/trade-plans/{id}/commit`

### 目的

取引計画を確定する。

### 処理内容

1. 対象取引計画を取得する
2. `DRAFT` であることを確認する
3. `planType` ごとの確定条件を検証する
4. `BUY` の場合、リスク計算をサーバー側で再実行する
5. `plannedQuantity <= recommendedQuantity` を検証する
6. `planStatus = COMMITTED` にする
7. `isLocked = true` にする
8. `lockedAt` を保存する
9. `lockedPlanHash` を保存する

---

### BUY計画の確定必須項目

| 項目        | カラム                      |
| --------- | ------------------------ |
| 仮説        | `thesis`                 |
| エントリー予定価格 | `plannedEntryPrice`      |
| 損切価格      | `plannedStopPrice`       |
| 利確目標価格    | `plannedTakeProfitPrice` |
| 最大保有日数    | `maxHoldingDays`         |
| 口座資産      | `accountSizeSnapshot`    |
| 許容リスク%    | `riskPercent`            |
| 予定株数      | `plannedQuantity`        |

---

### リクエスト

リクエストボディなし。

```json
{}
```

---

### 成功レスポンス例

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "planStatus": "COMMITTED",
    "isLocked": true,
    "recommendedQuantity": 200,
    "plannedQuantity": 200,
    "lockedAt": "2026-05-28T07:00:00.000Z"
  }
}
```

---

### エラー例：出口未入力

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "買い計画を確定するには、損切価格を入力してください。",
    "details": {
      "field": "plannedStopPrice"
    }
  }
}
```

---

### エラー例：サイズ超過

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "予定株数が推奨株数を超えています。",
    "details": {
      "recommendedQuantity": 100,
      "plannedQuantity": 200
    }
  }
}
```

---

## 9.6 POST `/api/trade-plans/{id}/execute`

### 目的

確定済みの取引計画を実行済みにする。

### 条件

* `planStatus = COMMITTED`
* 実際エントリー価格・実際株数・実行日時が必須

### リクエスト例

```json
{
  "actualEntryPrice": 126,
  "actualQuantity": 200,
  "executedAt": "2026-05-28T09:05:00+09:00"
}
```

### 注意

v0.1では、`actualQuantity > recommendedQuantity` でも記録可能とする。
ただし、検証ログでサイズ超過として振り返る対象にする。

---

## 9.7 POST `/api/trade-plans/{id}/close`

### 目的

取引計画を終了する。

### 条件

* `COMMITTED` または `EXECUTED` の計画を終了できる
* `closedAt` を保存する

### リクエスト例

```json
{
  "closedAt": "2026-05-29T15:00:00+09:00"
}
```

---

## 9.8 DELETE `/api/trade-plans/{id}`

### 目的

下書き取引計画を削除する。

### 削除条件

| 状態          | 削除可否 |
| ----------- | ---- |
| `DRAFT`     | 削除可  |
| `COMMITTED` | 削除不可 |
| `EXECUTED`  | 削除不可 |
| `CLOSED`    | 削除不可 |

---

## 9.9 POST `/api/trade-plans/calculate-risk`

### 目的

買い計画入力中に、推奨株数を計算する。

DB保存は行わない。

### リクエスト例

```json
{
  "plannedEntryPrice": 126,
  "plannedStopPrice": 115,
  "accountSizeSnapshot": 300000,
  "riskPercent": 1,
  "tradingUnit": 100
}
```

### レスポンス例

```json
{
  "success": true,
  "data": {
    "plannedRiskAmount": 3000,
    "plannedLossPerShare": 11,
    "rawQuantity": 272.7272,
    "recommendedQuantity": 200,
    "isTradable": true
  }
}
```

### 推奨株数0の場合

```json
{
  "success": true,
  "data": {
    "plannedRiskAmount": 1000,
    "plannedLossPerShare": 50,
    "rawQuantity": 20,
    "recommendedQuantity": 0,
    "isTradable": false,
    "message": "この損切幅とリスク許容額では、最小単元を買うとリスク超過になります。"
  }
}
```

---

## 10. 検証ログAPI

## 10.1 GET `/api/verification-logs`

### 目的

検証ログを一覧取得する。

### Query Parameters

| パラメータ          | 型      | 内容                                   |
| -------------- | ------ | ------------------------------------ |
| `tradePlanId`  | string | 取引計画ID                               |
| `stockCode`    | string | 銘柄コード                                |
| `followedPlan` | string | `YES` / `NO` / `PARTIAL` / `UNKNOWN` |
| `from`         | string | 振り返り日From                            |
| `to`           | string | 振り返り日To                              |
| `page`         | number | ページ番号                                |
| `pageSize`     | number | 件数                                   |

---

## 10.2 POST `/api/verification-logs`

### 目的

取引計画に紐づく検証ログを作成する。

### 条件

* `tradePlanId` は必須
* 存在する `trade_plans.id` に紐づける
* `tradePlanId` なしの単独ログ作成は不可

### リクエスト例

```json
{
  "tradePlanId": "clx...",
  "reviewDate": "2026-05-29",
  "result": "翌日寄りは強かったが、その後失速。",
  "lesson": "ストップ高翌日の寄り付き後は出来高を確認する。",
  "followedPlan": "PARTIAL",
  "deviationSummary": "早期利確",
  "deviationReason": "寄り天が怖くなり予定より早く売った。",
  "nextRule": "利確目標前でも売る場合は出来高急減を条件にする。"
}
```

### 作成時の引き継ぎ

| verification_logs   | trade_plans         |
| ------------------- | ------------------- |
| `tradePlanId`       | `id`                |
| `stockCode`         | `stockCode`         |
| `stockNameSnapshot` | `stockNameSnapshot` |

---

## 10.3 PATCH `/api/verification-logs/{id}`

### 目的

検証ログを更新する。

### 更新可能項目

* `reviewDate`
* `result`
* `lesson`
* `followedPlan`
* `deviationSummary`
* `deviationReason`
* `nextRule`

### 注意

v0.1では検証ログの編集は許可する。
ただし、検証ログ削除は原則実装しない。

---

## 11. キーワードルールAPI

## 11.1 GET `/api/keyword-rules`

### 目的

材料分類キーワードを一覧取得する。

### Query Parameters

| パラメータ      | 型       | 内容    |
| ---------- | ------- | ----- |
| `category` | string  | カテゴリ  |
| `isActive` | boolean | 有効フラグ |

### 注意

v0.1では編集APIは必須ではない。
初期データは `seed.ts` で投入する。

---

## 12. アプリ設定API

## 12.1 GET `/api/app-settings`

### 目的

アプリ設定を取得する。

### レスポンス例

```json
{
  "success": true,
  "data": {
    "defaultTradingUnit": 100,
    "defaultRiskPercent": 1,
    "maxRiskPercent": 2
  }
}
```

### 注意

v0.1では更新APIは必須ではない。
初期データは `seed.ts` で投入する。

---

## 13. 業務ロジック責務

### 13.1 API側で必ず実装する関数

| 関数名                           | 役割              |
| ----------------------------- | --------------- |
| `normalizeStockCode`          | 銘柄コード正規化        |
| `validateStockCode`           | 銘柄コード検証         |
| `generateDisclosureUniqueKey` | 開示重複判定キー生成      |
| `classifyDisclosureTitle`     | キーワード分類         |
| `calculateRiskSizing`         | リスク逆算サイジング      |
| `validateBuyCommit`           | BUY計画確定バリデーション  |
| `validateNoTradeCommit`       | 見送り計画確定バリデーション  |
| `validateWatchCommit`         | 監視継続計画確定バリデーション |
| `createLockedPlanHash`        | 確定時ハッシュ生成       |
| `assertTradePlanEditable`     | ロック後更新制御        |

---

## 14. API別の業務ルール適用表

| API                                      | 業務ルール                       |
| ---------------------------------------- | --------------------------- |
| POST `/api/disclosures`                  | 銘柄コード検証、銘柄自動作成、重複判定、材料分類    |
| PATCH `/api/disclosures/{id}`            | title変更時の材料再分類              |
| POST `/api/disclosures/{id}/watchlist`   | 開示情報引き継ぎ                    |
| POST `/api/disclosures/{id}/trade-plans` | 開示情報引き継ぎ、DRAFT作成            |
| POST `/api/watchlist`                    | 銘柄コード検証、銘柄自動作成              |
| PATCH `/api/watchlist/{id}`              | CLOSEDからの利用時は警告             |
| POST `/api/watchlist/{id}/trade-plans`   | 監視リスト情報引き継ぎ、DRAFT作成         |
| POST `/api/trade-plans`                  | DRAFT作成、可能ならリスク計算           |
| PATCH `/api/trade-plans/{id}`            | ロック後更新制御、DRAFT時リスク再計算       |
| POST `/api/trade-plans/{id}/commit`      | 確定条件検証、リスク再計算、サイズ超過ブロック、ロック |
| POST `/api/trade-plans/{id}/execute`     | 実績入力検証                      |
| POST `/api/trade-plans/{id}/close`       | CLOSED遷移                    |
| DELETE `/api/trade-plans/{id}`           | DRAFTのみ削除可                  |
| POST `/api/trade-plans/calculate-risk`   | リスク計算のみ                     |
| POST `/api/verification-logs`            | tradePlanId必須、取引計画から情報引き継ぎ  |

---

## 15. 実装上の注意

### 15.1 金額計算

価格・金額・割合はDecimalとして扱う。

JavaScriptのnumberで雑に計算すると誤差が出るため、Prisma Decimalまたはdecimal.js等を使用する。

---

### 15.2 リスク計算はサーバー側で再計算する

フロントで計算結果を送信しても信用しない。

`commit` 時は必ずAPI側で再計算する。

---

### 15.3 ロック制御はPATCHでも必ず確認する

`isLocked = true` の場合、PATCHでロック対象項目が含まれていないか確認する。

含まれている場合は `423 LOCKED` を返す。

---

### 15.4 DELETEは最小限にする

v0.1では、履歴保全を優先する。

削除できるのは主に以下。

* 関連データのない注目開示
* 関連取引計画のない監視リスト
* DRAFTの取引計画

---

## 16. v0.1で作らないAPI

以下はv0.1では作らない。

| API                  | 理由     |
| -------------------- | ------ |
| 株価取得API              | v0.3以降 |
| 出来高取得API             | v0.3以降 |
| 適時開示自動取得API          | v0.2以降 |
| AI要約API              | v0.4以降 |
| 税・手数料計算API           | v0.3以降 |
| deviation_events API | v0.2以降 |
| 認証ユーザー管理API          | v0.2以降 |
| 複数ユーザー対応API          | v0.2以降 |

---

## 17. テスト観点

| No | API                                    | テスト内容             |
| -: | -------------------------------------- | ----------------- |
|  1 | POST `/api/disclosures`                | 正常登録できる           |
|  2 | POST `/api/disclosures`                | 銘柄コード不正でエラー       |
|  3 | POST `/api/disclosures`                | 重複開示で409          |
|  4 | POST `/api/disclosures`                | キーワード分類される        |
|  5 | POST `/api/disclosures/{id}/watchlist` | 開示情報を引き継げる        |
|  6 | POST `/api/watchlist/{id}/trade-plans` | 監視リストからDRAFT作成    |
|  7 | POST `/api/trade-plans/calculate-risk` | 推奨株数を計算できる        |
|  8 | POST `/api/trade-plans/{id}/commit`    | 出口未入力でエラー         |
|  9 | POST `/api/trade-plans/{id}/commit`    | 損切価格不正でエラー        |
| 10 | POST `/api/trade-plans/{id}/commit`    | サイズ超過でエラー         |
| 11 | POST `/api/trade-plans/{id}/commit`    | 正常確定でロックされる       |
| 12 | PATCH `/api/trade-plans/{id}`          | ロック後の事前計画更新で423   |
| 13 | POST `/api/trade-plans/{id}/execute`   | 実績入力でEXECUTEDになる  |
| 14 | POST `/api/trade-plans/{id}/close`     | CLOSEDになる         |
| 15 | DELETE `/api/trade-plans/{id}`         | DRAFTのみ削除可能       |
| 16 | POST `/api/verification-logs`          | tradePlanIdなしでエラー |
| 17 | POST `/api/verification-logs`          | 取引計画から情報を引き継げる    |

---

## 18. 次工程

このAPI設計書の次に作成するものは以下。

1. 画面モック
2. 画面設計書
3. ディレクトリ構成案
4. テスト設計書
5. 実装タスク分解書
6. Codex依頼プロンプト

---
