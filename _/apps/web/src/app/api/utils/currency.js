// Simple mock currency conversion service
// Base currency is IRR

const rates = {
  USD: 1 / 500000,
  EUR: 1 / 540000,
  AED: 1 / 136000,
  IRR: 1,
};

export function convertFromIRR(amountIRR, targetCurrency) {
  const rate = rates[targetCurrency] || rates.IRR;
  return amountIRR * rate;
}

export function formatCurrency(amount, currency) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "IRR" ? 0 : 2,
  });
  return formatter.format(amount);
}
