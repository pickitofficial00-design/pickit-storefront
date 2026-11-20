export function calculateUsdRetailPrice(supplierCostUsd, customMultiplier = null) {
  const cost = Math.max(0.5, Number(supplierCostUsd) || 1);
  let mult = customMultiplier;
  if (!mult) {
    if (cost < 10) mult = 2.8;
    else if (cost < 30) mult = 2.2;
    else if (cost < 80) mult = 1.85;
    else mult = 1.55;
  }
  const raw = cost * mult;
  const retail = Math.max(cost + 3, Math.ceil(raw) - 0.01);
  const compareAt = Math.ceil(retail * 1.28) - 0.01;
  return {
    cost_price: Number(cost.toFixed(2)),
    retail_price: Number(retail.toFixed(2)),
    compare_at_price: Number(compareAt.toFixed(2))
  };
}
