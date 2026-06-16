import { describe, expect, it } from "vitest";
import { getCustomer, lookupOrder, executeTool } from "./tools";

describe("getCustomer", () => {
  it("getCustomerにcustomerIdを渡すと、customerオブジェクトが返される", () => {
    const result = getCustomer("CUST-001");
    expect(result).toEqual({
      customer_id: "CUST-001",
      name: "田中 太郎",
      email: "taro.tanaka@example.com",
    });
  });

  it("getCustomerに存在しないcustomerIdを渡すと、エラーがスローされる", () => {
    expect(() => getCustomer("CUST-999")).toThrow(
      "Customer with ID CUST-999 not found",
    );
  });
});

describe("lookupOrder", () => {
  it("lookupOrderにorder_idを渡すと、オーダーオブジェクトが返却される", () => {
    const result = lookupOrder("ORD-001");
    expect(result).toEqual({
      order_id: "ORD-001",
      customer_id: "CUST-003",
      item: "ワイヤレスイヤホン",
      status: "delivered",
      amount: 12800,
    });
  });

  it("lookupOrderに存在しないorder_idを渡すと、エラーがスローされる", () => {
    expect(() => lookupOrder("ORD-999")).toThrow(
      "Order with ID ORD-999 not found",
    );
  });
});

describe("executeTool", () => {
  it("executeTool経由でgetCustomerを呼び出す", () => {
    const res = executeTool("get_customer", "tool_xxx", {
      customer_id: "CUST-001",
    });

    expect(res).toEqual({
      type: "tool_result",
      tool_use_id: "tool_xxx",
      content: JSON.stringify({
        customer_id: "CUST-001",
        name: "田中 太郎",
        email: "taro.tanaka@example.com",
      }),
    });
  });

  it("executeTool経由で存在しないIDでgetCustomerを呼び出す", () => {
    const res = executeTool("get_customer", "tool_xxx", {
      customer_id: "CUST-999",
    });

    expect(res).toEqual({
      type: "tool_result",
      tool_use_id: "tool_xxx",
      is_error: true,
      content: "Customer with ID CUST-999 not found",
    });
  });

  it("executeTool経由でlookupOrderを呼び出す", () => {
    const res = executeTool("lookup_order", "tool_xxx", {
      order_id: "ORD-001",
    });

    expect(res).toEqual({
      type: "tool_result",
      tool_use_id: "tool_xxx",
      content: JSON.stringify({
        order_id: "ORD-001",
        customer_id: "CUST-003",
        item: "ワイヤレスイヤホン",
        status: "delivered",
        amount: 12800,
      }),
    });
  });

  it("executeTool経由で存在しないIDでlookupOrderを呼び出す", () => {
    const res = executeTool("lookup_order", "tool_xxx", {
      order_id: "ORD-999",
    });

    expect(res).toEqual({
      type: "tool_result",
      tool_use_id: "tool_xxx",
      is_error: true,
      content: "Order with ID ORD-999 not found",
    });
  });
});
