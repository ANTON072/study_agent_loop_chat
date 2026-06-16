import { customers, orders } from "./resources";

export const getCustomer = (customerId: string) => {
  const customer = customers.find((c) => c.customer_id === customerId);
  if (customer) {
    return customer;
  }
  throw new Error(`Customer with ID ${customerId} not found`);
};

export const lookupOrder = (customerId: string) => {
  return orders.filter((o) => o.customer_id === customerId);
};
