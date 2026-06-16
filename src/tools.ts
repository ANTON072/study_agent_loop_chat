import type Anthropic from "@anthropic-ai/sdk";
import { customers, orders } from "./resources";

type ToolResult = Anthropic.Messages.ToolResultBlockParam;

export const getCustomer = (customerId: string) => {
  const customer = customers.find((c) => c.customer_id === customerId);
  if (customer) {
    return customer;
  }
  throw new Error(`Customer with ID ${customerId} not found`);
};

export const lookupOrder = (orderId: string) => {
  const order = orders.find((o) => o.order_id === orderId);
  if (order) {
    return order;
  }
  throw new Error(`Order with ID ${orderId} not found`);
};

export const executeTool = (
  toolName: string,
  toolId: string,
  args: Record<string, unknown>,
): ToolResult => {
  try {
    if (toolName === "get_customer") {
      return {
        type: "tool_result",
        tool_use_id: toolId,
        content: JSON.stringify(getCustomer(args.customer_id as string)),
      };
    }
    if (toolName === "lookup_order") {
      return {
        type: "tool_result",
        tool_use_id: toolId,
        content: JSON.stringify(lookupOrder(args.order_id as string)),
      };
    }
    throw new Error(`tool not found`);
  } catch (error) {
    return {
      type: "tool_result",
      tool_use_id: toolId,
      content: error instanceof Error ? error.message : "Unknown error",
      is_error: true,
    };
  }
};

export const tools: Anthropic.Messages.Tool[] = [
  {
    name: "get_customer",
    description: "カスタマーオブジェクトを引き当てる関数",
    input_schema: {
      type: "object",
      properties: {
        customer_id: { type: "string" },
      },
      required: ["customer_id"],
    },
  },
  {
    name: "lookup_order",
    description: "オーダーオブジェクトを引き当てる関数",
    input_schema: {
      type: "object",
      properties: {
        order_id: { type: "string" },
      },
      required: ["order_id"],
    },
  },
];
