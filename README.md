# Claude Chat

CCA Foundations Lab 01（Customer Support Agent）の学習用プロジェクト。  
Claude API の tool_use / tool_result・エージェントループ・履歴管理を手を動かして理解することが目的。

## 技術スタック

- TypeScript + ts-node
- `@anthropic-ai/sdk`

## 学習スコープ

- tool_use / tool_result の基本
- エージェントループ（stop_reason による分岐）
- 複数 tool_use ブロックの順次処理（並列呼び出しへの対応）
- messages への履歴管理

## ドキュメント

- [仕様](docs/requirement.md)
- [実装タスクリスト](docs/tasklist.md)
