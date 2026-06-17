# 株式材料監視ダッシュボード テスト計画書 v0.1.1

## 1. ドキュメント情報

| 項目      | 内容                                                                      |
| ------- | ----------------------------------------------------------------------- |
| ドキュメント名 | 株式材料監視ダッシュボード テスト計画書                                                    |
| バージョン   | 0.1.1                                                                   |
| 対応要件定義  | 株式材料監視ダッシュボード v0.1.3                                                    |
| 対応DB設計  | DB設計書 v0.1                                                              |
| 対応業務ルール | 業務ルール設計書 v0.1                                                           |
| 対応API設計 | API設計書 v0.1                                                             |
| 対応画面設計  | 画面設計書 v0.1                                                              |
| 技術想定    | Next.js App Router / TypeScript / Prisma / Supabase PostgreSQL / Vitest |
| 主な更新内容  | Codexによるテスト実行・失敗記録・原因分析・修正・再実行ループを追加                                    |

---

## 2. v0.1.1での更新方針

v0.1のテスト計画書は、主に「何をテストするか」を定義していた。

v0.1.1では、それに加えて以下を定義する。

* Codexが実装後に必ず実行するテストコマンド
* テスト失敗時に残す成果物
* テスト失敗原因の記録方法
* 修正と再実行のループ
* テストを通すためにやってはいけないこと
* Codexの作業完了条件

この更新により、Codexに単に実装させるだけではなく、**自分の実装をテストで検証し、失敗時に修正できる状態**を作る。

---

# 14. テスト実行・修正ループ方針

## 14.1 基本方針

Codexは、実装後に必ずテストを実行する。

テストに失敗した場合、失敗ログを削除せず、原因を分析し、修正し、再度テストを実行する。

この流れを最大3回まで繰り返す。

---

## 14.2 Codexが実行する基本コマンド

Codexは、実装単位ごとに以下を実行する。

```bash
npm run typecheck
npm run lint
npm run test:run
```

必要に応じて、以下も実行する。

```bash
npm run build
```

Prisma変更がある場合は、以下も確認する。

```bash
npx prisma validate
npx prisma generate
```

---

## 14.3 実行順序

テストは以下の順序で実行する。

```text
1. npx prisma validate
2. npx prisma generate
3. npm run typecheck
4. npm run lint
5. npm run test:run
6. npm run build
```

Prismaに変更がない場合、1と2は省略してよい。

ただし、`schema.prisma` を変更した場合は必ず実行する。

---

## 14.4 修正ループ

テスト失敗時は以下のループを行う。

```text
テスト実行
  ↓
失敗ログを保存
  ↓
失敗原因を分析
  ↓
修正方針を記録
  ↓
実装コードを修正
  ↓
再テスト
  ↓
成功なら完了
  ↓
失敗なら最大3回まで繰り返す
```

---

## 14.5 最大ループ回数

Codexによる自動修正ループは最大3回までとする。

|    回数 | 扱い                  |
| ----: | ------------------- |
|   1回目 | 通常の修正               |
|   2回目 | 原因分析を見直して修正         |
|   3回目 | 影響範囲を確認して修正         |
| 4回目以降 | 自動修正を停止し、未解決事項として記録 |

3回修正しても解決できない場合、Codexは無理に通そうとせず、未解決事項を明記して停止する。

---

# 15. テスト結果成果物

## 15.1 保存方針

Codexは、テスト結果を会話上の報告だけで終わらせない。

リポジトリ内に、テスト実行結果を成果物として保存する。

---

## 15.2 保存先

以下のディレクトリを追加する。

```text
docs/
  test-runs/
    YYYYMMDD-HHMM-test-run.md

artifacts/
  test-results/
    latest/
      typecheck.txt
      lint.txt
      unit-test.txt
      build.txt
      summary.md
```

---

## 15.3 各ファイルの役割

| ファイル                                          | 内容                        |
| --------------------------------------------- | ------------------------- |
| `docs/test-runs/YYYYMMDD-HHMM-test-run.md`    | 人間が読むためのテスト実行記録           |
| `artifacts/test-results/latest/typecheck.txt` | `npm run typecheck` の実行結果 |
| `artifacts/test-results/latest/lint.txt`      | `npm run lint` の実行結果      |
| `artifacts/test-results/latest/unit-test.txt` | `npm run test:run` の実行結果  |
| `artifacts/test-results/latest/build.txt`     | `npm run build` の実行結果     |
| `artifacts/test-results/latest/summary.md`    | 最新テスト結果の要約                |

---

## 15.4 テスト実行記録フォーマット

Codexは、テスト実行後に以下の形式で `docs/test-runs/` に記録する。

```markdown
# Test Run: YYYY-MM-DD HH:mm

## 実行対象

- 対象ブランチ:
- 対象実装:
- 対象コミット:

## 実行コマンド

- npx prisma validate
- npx prisma generate
- npm run typecheck
- npm run lint
- npm run test:run
- npm run build

## 結果

| コマンド | 結果 |
|---|---|
| prisma validate | PASS / FAIL / SKIP |
| prisma generate | PASS / FAIL / SKIP |
| typecheck | PASS / FAIL |
| lint | PASS / FAIL |
| test:run | PASS / FAIL |
| build | PASS / FAIL / SKIP |

## 失敗内容

### 失敗したテスト・コマンド

- 

### エラーメッセージ要約

- 

## 原因仮説

- 

## 修正方針

- 

## 修正内容

- 

## 再実行結果

| コマンド | 結果 |
|---|---|
| typecheck | PASS / FAIL |
| lint | PASS / FAIL |
| test:run | PASS / FAIL |
| build | PASS / FAIL / SKIP |

## 残課題

- なし
- または未解決事項を記載
```

---

## 15.5 latest summary フォーマット

`artifacts/test-results/latest/summary.md` には、最新のテスト結果を保存する。

```markdown
# Latest Test Summary

## Status

PASS / FAIL

## Last Run

YYYY-MM-DD HH:mm

## Commands

| Command | Result |
|---|---|
| typecheck | PASS / FAIL |
| lint | PASS / FAIL |
| test:run | PASS / FAIL |
| build | PASS / FAIL / SKIP |

## Failed Items

- 

## Fix Attempts

| Attempt | Summary | Result |
|---:|---|---|
| 1 |  | PASS / FAIL |
| 2 |  | PASS / FAIL |
| 3 |  | PASS / FAIL |

## Notes

- 
```

---

# 16. テスト改変禁止ルール

## 16.1 基本方針

Codexは、テストを通すためにテストそのものを弱めてはいけない。

特に、業務ルールを守るためのテストは削除・緩和禁止とする。

---

## 16.2 禁止事項

以下を禁止する。

| 禁止事項                           | 理由              |
| ------------------------------ | --------------- |
| 失敗したテストケースを削除する                | 問題の隠蔽になるため      |
| 期待値を実装に合わせて安易に変更する             | 仕様違反を見逃すため      |
| BUY確定条件を緩める                    | 出口未定の買いを許すため    |
| サイズ超過ブロックを外す                   | リスク管理が崩れるため     |
| ロック後編集不可のテストを削除する              | 後知恵修正防止が崩れるため   |
| `risk-sizing` の計算を雑にnumberで丸める | 金額計算の信頼性が落ちるため  |
| テスト失敗ログを残さずに修正する               | 修正経緯が追えなくなるため   |
| `skip` / `todo` を乱用する          | 実質的にテストを無効化するため |

---

## 16.3 特に削除・緩和禁止のテスト

以下のテストは、Codexが勝手に削除・緩和してはいけない。

| テスト                        | 理由          |
| -------------------------- | ----------- |
| BUY計画で損切価格が未入力なら確定できない     | 出口未定エントリー防止 |
| BUY計画で利確目標価格が未入力なら確定できない   | 出口未定エントリー防止 |
| BUY計画で最大保有日数が未入力なら確定できない   | 握りっぱなし防止    |
| BUY計画で予定株数が推奨株数を超えたら確定できない | サイズ超過防止     |
| BUY計画で推奨株数0なら確定できない        | 最小単元リスク超過防止 |
| COMMITTED後に損切価格を変更できない     | 後知恵修正防止     |
| COMMITTED後に予定株数を変更できない     | 事前計画改ざん防止   |
| `commit` 時にサーバー側でリスク再計算する  | フロント改ざん防止   |
| `lockedPlanHash` が保存される    | 計画確定時の証跡保持  |

---

## 16.4 テスト変更が許される場合

以下の場合のみ、テスト変更を許可する。

| ケース              | 条件                           |
| ---------------- | ---------------------------- |
| 仕様書の誤りが見つかった場合   | 変更理由を `docs/test-runs` に記録する |
| テストコード自体にバグがある場合 | 期待仕様は変えず、テスト実装のみ修正する         |
| 命名変更・型変更に伴う修正    | 業務ルールを変えない範囲で修正する            |
| v0.2以降の仕様変更      | 要件定義書・業務ルール設計書を先に更新する        |

---

# 17. Codex実装時のテスト完了条件

## 17.1 基本完了条件

Codexは、以下がすべて完了するまで実装完了としてはならない。

| No | 完了条件                                                      |
| -: | --------------------------------------------------------- |
|  1 | `npm run typecheck` が成功している                               |
|  2 | `npm run lint` が成功している                                    |
|  3 | `npm run test:run` が成功している                                |
|  4 | 重要Domainテストが成功している                                        |
|  5 | `POST /api/trade-plans/{id}/commit` 関連テストが成功している          |
|  6 | テスト実行結果が `docs/test-runs` に記録されている                        |
|  7 | 最新結果が `artifacts/test-results/latest/summary.md` に記録されている |
|  8 | 未解決事項がある場合、明示されている                                        |

---

## 17.2 最重要Domainテスト

以下は必ず成功していること。

| ファイル                            |  必須 |
| ------------------------------- | --: |
| `risk-sizing.test.ts`           | Yes |
| `trade-plan-validation.test.ts` | Yes |
| `trade-plan-lock.test.ts`       | Yes |
| `disclosure-classifier.test.ts` | Yes |
| `stock-code.test.ts`            | Yes |

---

## 17.3 最重要APIテスト

以下は必ず成功していること。

| API                                    |  必須 |
| -------------------------------------- | --: |
| `POST /api/trade-plans/{id}/commit`    | Yes |
| `PATCH /api/trade-plans/{id}`          | Yes |
| `POST /api/trade-plans/calculate-risk` | Yes |
| `POST /api/disclosures`                | Yes |
| `POST /api/verification-logs`          | Yes |

---

## 17.4 未解決事項がある場合

3回修正しても解決しない場合、Codexは以下を記録して停止する。

```markdown
## 未解決事項

### 失敗しているコマンド

- 

### 失敗内容

- 

### 試した修正

1. 
2. 
3. 

### 現時点の原因仮説

- 

### 人間に確認してほしいこと

- 
```

---

# 18. GitHub Actions 方針

## 18.1 基本方針

v0.1では、最低限のCIを導入することを推奨する。

push または pull request 時に、以下を実行する。

```text
npm ci
npx prisma generate
npm run typecheck
npm run lint
npm run test:run
npm run build
```

---

## 18.2 CIの目的

CIの目的は、以下である。

* ローカルで見逃した型エラーを検知する
* テスト未実行のまま進むことを防ぐ
* Codex実装後の品質を機械的に確認する
* 重要な業務ルールの回帰を防ぐ

---

## 18.3 v0.1でのCI完了条件

| 項目        |       必須 |
| --------- | -------: |
| typecheck |      Yes |
| lint      |      Yes |
| test:run  |      Yes |
| build     |       推奨 |
| API統合テスト  |     可能なら |
| E2E       | v0.1では任意 |

---

## 18.4 CI失敗時の扱い

CIが失敗した場合、Codexは以下を行う。

1. 失敗ログを確認する
2. `docs/test-runs` に失敗内容を記録する
3. 原因仮説を書く
4. 修正する
5. 再実行する
6. 成功または未解決として記録する

---

# 19. テスト運用設計書との関係

このテスト計画書 v0.1.1 は、主に以下を定義する。

```text
何をテストするか
どのテストを重視するか
テストが成功したと言える条件
Codexに守らせる最低限のテストルール
```

一方、別途作成する `test-operation.md` では、以下をより詳細に定義する。

```text
Codexが実際にどの順番でテストを実行するか
ログをどのファイルにどう保存するか
失敗時にどう修正ループを回すか
CIとどう連携するか
```

したがって、次工程では以下を作成する。

```text
docs/test-operation.md
```

---

# 20. v0.1.1で最も重要な追加ルール

v0.1.1で追加された最重要ルールは以下である。

```text
Codexは、テスト失敗時にログを残し、原因を記録し、修正し、再テストする。
```

```text
Codexは、テストを通すために業務ルールテストを削除・緩和してはいけない。
```

```text
Codexは、3回修正しても解決しない場合、未解決事項として記録して停止する。
```

これにより、Codexによる実装が「作って終わり」ではなく、**テスト結果に基づいて修正されるループ**になる。

---
