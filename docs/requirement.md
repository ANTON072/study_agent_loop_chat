# 顧客情報管理チャット

## 目的

CCA Foundations Lab 01（Customer Support Agent）の学習のため。以下を実際に手を動かして理解する。

- Claude APIのtool_use / tool_resultの仕組み
- エージェントループの実装方法
- messagesへの履歴管理

## 概要

Claude APIを使ったCLIチャットボット。顧客サポートのツール呼び出しを体験するための練習用プロジェクト。

## 技術スタック

- TypeScript
- ts-node
- Anthropic SDK（`@anthropic-ai/sdk`）

## 機能

### 基本機能

- CLIでユーザーが入力 → Claudeが返答する会話ループ
- `exit` または `quit` と入力したら終了
- 会話履歴（messages）を保持し、文脈を理解した返答をする

### ツール

#### `get_customer`

- **概要**: 顧客IDから顧客情報を取得する
- **input**: `customer_id: string`
- **output**: 顧客情報オブジェクト or エラー

#### `lookup_order`

- **概要**: 注文IDから注文情報を取得する
- **input**: `order_id: string`
- **output**: 注文情報オブジェクト or エラー

### ダミーデータ

ツールはDBではなくハードコードされたダミーデータを返す。

**顧客データ例**

| customer_id | name | email |
|---|---|---|
| CUST-001 | 田中太郎 | tanaka@example.com |
| CUST-002 | 鈴木花子 | suzuki@example.com |

**注文データ例**

| order_id | customer_id | item | status | amount |
|---|---|---|---|---|
| ORD-001 | CUST-001 | ノートPC | 配送中 | 120000 |
| ORD-002 | CUST-002 | マウス | 配達完了 | 3000 |

## エージェントループの仕様

1. ユーザーの入力をmessagesに追加
2. Claude APIに投げる（tools付き）
3. `stop_reason === "tool_use"` なら、レスポンスの `content` 内にある **すべての** `tool_use` ブロックを順番に実行し、各結果を `tool_result` としてまとめて1つの `user` メッセージに追加してから再度APIに投げる
4. `stop_reason === "end_turn"` になったらClaudeの返答を表示
5. 1に戻る

### 並列ツール呼び出しについて（試験ポイント）

Claudeは1回のレスポンスで複数の `tool_use` ブロックを返すことがある（例：「田中と鈴木の情報を教えて」で2つの `get_customer` を同時に要求）。

**重要な制約**：複数の `tool_result` は **同一の `user` メッセージ** にまとめて渡す必要がある。1件ずつ別メッセージで返すとAPIエラーになる。

```
// NG: tool_result を別々のメッセージに分ける
messages.push({ role: "user", content: [tool_result_1] });
messages.push({ role: "user", content: [tool_result_2] }); // エラー

// OK: 同一メッセージにまとめる
messages.push({ role: "user", content: [tool_result_1, tool_result_2] });
```

### 連続ツール呼び出しの例

「ORD-002の注文をした顧客は誰ですか？」という質問に対して、Claudeは自律的に以下を実行する。

1. `lookup_order("ORD-002")` → 注文情報（`customer_id: "CUST-017"` を含む）を取得
2. `get_customer("CUST-017")` → 注文情報内の `customer_id` を使って顧客情報を取得

各ツールは1つのことだけをやる。Claudeが結果を解釈して次のツール呼び出しを判断する。

---

## ディレクトリ構成

```
/
├── chat.ts         # エントリーポイント・会話ループ
├── tools.ts        # ツールの実装・スキーマ定義・ダミーデータ
├── package.json
└── tsconfig.json
```


```text
  ユーザー入力
  「ORD-002の注文をした顧客は誰ですか？」
          ↓
  Claude API呼び出し（tools付き）
          ↓
  Claudeが判断：「lookup_orderを呼ぼう」
    → stop_reason: "tool_use"
    → id: "toolu_abc123", name: "lookup_order", input: { order_id: "ORD-002" }
          ↓
  executeTool("lookup_order", { order_id: "ORD-002" })
          ↓
  lookupOrder("ORD-002") → 注文情報（customer_id: "CUST-017" が含まれる）
          ↓
  tool_result を tool_use_id: "toolu_abc123" と一緒にClaudeに返す
          ↓
  Claudeが判断：「次はget_customerを呼ぼう」
    → stop_reason: "tool_use"
    → id: "toolu_xyz456", name: "get_customer", input: { customer_id: "CUST-017" }
          ↓
  executeTool("get_customer", { customer_id: "CUST-017" })
          ↓
  getCustomer("CUST-017") → 顧客情報
          ↓
  tool_result を tool_use_id: "toolu_xyz456" と一緒にClaudeに返す
          ↓
  Claudeが判断：「情報が揃った、答えを返そう」
    → stop_reason: "end_turn"
          ↓
  「ORD-002の注文をしたのは清水 龍さんです」

  tool_use_id は「どのツール呼び出しへの結果か」をClaudeが照合するために使います。複数の
  ツールが同時に呼ばれたときに特に重要です。
```
