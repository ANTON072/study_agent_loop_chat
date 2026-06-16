import "dotenv/config";

import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources";
import * as readline from "readline";
import { executeTool, tools } from "./tools";

const client = new Anthropic();
const messages: MessageParam[] = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function agentLoop() {
  while (true) {
    // APIコール
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      tools: tools,
      messages: messages,
    });
    // レスポンスをmessagesにためる
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find(
        (content) => content.type === "text",
      );
      console.log(`Assistant: ${textBlock?.text}`);
      break;
    }

    if (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.Messages.ToolUseBlock =>
          block.type === "tool_use",
      );
      const toolResults = toolUseBlocks.map((block) => {
        return executeTool(
          block.name,
          block.id,
          block.input as Record<string, unknown>,
        );
      });
      messages.push({
        role: "user",
        content: toolResults,
      });
    }
  }
}

function chat() {
  rl.question("You: ", async (input) => {
    const trimmed = input.trim();

    // 終了条件
    if (trimmed === "exit" || trimmed === "quit") {
      rl.close();
      return;
    }

    // ユーザーの入力をmessagesに追加
    messages.push({ role: "user", content: trimmed });

    // Agent Loop
    await agentLoop();

    // 次の入力を待つ
    chat();
  });
}

chat();
