import { describe, expect, it } from "vitest";
import { getCustomer } from "./tools";

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
