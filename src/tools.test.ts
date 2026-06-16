import { describe, expect, it } from "vitest";
import { getCustomer, lookupOrder } from "./tools";

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
  it("lookupOrderにcustomer_idを渡すと、オーダー配列が返却される", () => {
    const result = lookupOrder("CUST-003");
    expect(result).toEqual([
      {
        order_id: "ORD-001",
        customer_id: "CUST-003",
        item: "ワイヤレスイヤホン",
        status: "delivered",
        amount: 12800,
      },
    ]);
  });
});
