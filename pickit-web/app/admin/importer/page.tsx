"use client";

import React, { useState } from "react";

interface Candidate {
  id: string;
  title: string;
  category: string;
  supplierCost: number;
  retailPrice: string;
  compareAtPrice: string | null;
  estimatedProfit: string;
  rating: number;
  ordersCount: number;
  shipsToUSA: boolean;
  usCarrier: string;
  shippingDays: string;
  image: string;
  winScore: number;
  highlights: string[];
  specs: Record<string, string>;
  variants: { title: string; priceOffset?: number }[];
  tags: string[];
}

export default function PickitAutoImporterPage() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  // Ship to USA Filter (ON by default)
  const [shipToUsaOnly, setShipToUsaOnly] = useState(true);

  // Pricing Settings (ON by default)
  const [pricingEnabled, setPricingEnabled] = useState(true);
  const [markup, setMarkup] = useState("2.4");
  const [roundTo99, setRoundTo99] = useState(true);
  const [includeCompareAt, setIncludeCompareAt] = useState(true);
  const [compareAtBoost, setCompareAtBoost] = useState("38");
  const [minProfitUsd, setMinProfitUsd] = useState("12");

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const getPricingPayload = () => ({
    enabled: pricingEnabled,
    markupMultiplier: Number(markup) || 2.4,
    roundTo99,
    includeCompareAt,
    compareAtBoostPercent: Number(compareAtBoost) || 38,
    minProfitUsd: Number(minProfitUsd) || 0,
  });

  const runDiscovery = async (overrideCat?: string, overrideUsa?: boolean) => {
    if (!pin.trim()) {
      setStatusBanner({ type: "err", text: "Enter your Admin Importer PIN first." });
      return;
    }
    setLoading(true);
    setStatusBanner(null);
    try {
      const res = await fetch("/api/admin/importer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: pin.trim(),
          action: "discover",
          category: overrideCat ?? category,
          query,
          shipToUsaOnly: overrideUsa ?? shipToUsaOnly,
          pricingSettings: getPricingPayload(),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setStatusBanner({ type: "err", text: data.error || "Invalid PIN or server error." });
        setLoading(false);
        return;
      }
      setUnlocked(true);
      setCandidates(data.candidates || []);
      const autoSelected: Record<string, boolean> = {};
      (data.candidates || []).forEach((c: Candidate) => {
        if (c.winScore >= 92) autoSelected[c.id] = true;
      });
      setSelectedIds(autoSelected);
    } catch (e: any) {
      setStatusBanner({ type: "err", text: e?.message || "Failed to load product selector." });
    } finally {
      setLoading(false);
    }
  };

  const pushSelectedToStore = async () => {
    const chosen = candidates.filter((c) => selectedIds[c.id]);
    if (chosen.length === 0) {
      setStatusBanner({ type: "err", text: "Select at least one product to push to your store." });
      return;
    }
    setImporting(true);
    setStatusBanner(null);
    try {
      const res = await fetch("/api/admin/importer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: pin.trim(),
          action: "import_products",
          shipToUsaOnly,
          pricingSettings: getPricingPayload(),
          products: chosen,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setStatusBanner({ type: "err", text: data.error || "Import failed." });
        setImporting(false);
        return;
      }
      const okCount = (data.results || []).filter((r: any) => r.status === "imported").length;
      const failItem = (data.results || []).find((r: any) => r.status === "failed");
      if (okCount > 0) {
        setStatusBanner({
          type: "ok",
          text: `Pushed ${okCount} Ship-to-USA product(s) with active Pricing Settings live to Shopify, PICKIT Web & Mobile App!`,
        });
      } else {
        setStatusBanner({
          type: "err",
          text: failItem?.error || "Products could not be imported. Verify Test App is installed in Shopify Dev Dashboard.",
        });
      }
    } catch (e: any) {
      setStatusBanner({ type: "err", text: e?.message || "Import request failed." });
    } finally {
      setImporting(false);
    }
  };

  const runDsersOptimizer = async () => {
    setImporting(true);
    setStatusBanner(null);
    try {
      const res = await fetch("/api/admin/importer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: pin.trim(),
          action: "optimize_dsers",
          shipToUsaOnly,
          pricingSettings: getPricingPayload(),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setStatusBanner({ type: "err", text: data.error || "DSers optimization failed." });
      } else {
        setStatusBanner({ type: "ok", text: data.message });
      }
    } catch (e: any) {
      setStatusBanner({ type: "err", text: e?.message || "Request failed." });
    } finally {
      setImporting(false);
    }
  };

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#111827", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E7EB", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em" }}>
              PICK<span style={{ color: "#FF6B00" }}>IT.</span>
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 800, background: "#FFF7ED", color: "#C2410C", padding: "4px 10px", borderRadius: 999, border: "1px solid #FED7AA" }}>
              Auto Product Selector & Store Importer
            </span>
            <span style={{ fontSize: 12, fontWeight: 800, background: "#ECFDF5", color: "#065F46", padding: "4px 10px", borderRadius: 999, border: "1px solid #A7F3D0" }}>
              🇺🇸 Ship to USA: ON
            </span>
            <span style={{ fontSize: 12, fontWeight: 800, background: "#EFF6FF", color: "#1D4ED8", padding: "4px 10px", borderRadius: 999, border: "1px solid #BFDBFE" }}>
              💲 Auto Pricing: {pricingEnabled ? "ON" : "OFF"}
            </span>
          </div>
          <a href="/" style={{ fontSize: 13, fontWeight: 700, color: "#4B5563", textDecoration: "none" }}>
            ← View Live Storefront
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "28px 20px" }}>
        {statusBanner && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              marginBottom: 20,
              fontWeight: 700,
              fontSize: 14,
              background: statusBanner.type === "ok" ? "#ECFDF5" : "#FEF2F2",
              color: statusBanner.type === "ok" ? "#065F46" : "#B91C1C",
              border: `1px solid ${statusBanner.type === "ok" ? "#A7F3D0" : "#FECACA"}`,
            }}
          >
            {statusBanner.text}
          </div>
        )}

        {!unlocked ? (
          <div style={{ maxWidth: 420, margin: "48px auto", background: "#FFFFFF", padding: 28, borderRadius: 18, border: "1px solid #E5E7EB", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Unlock Product Importer</h1>
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 18 }}>
              Enter your <code>ADMIN_IMPORTER_PIN</code> to auto-select Ship-to-USA products and push them to Shopify, Web, and Mobile App.
            </p>
            <input
              type="password"
              placeholder="Enter 6-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runDiscovery()}
              style={{ width: "100%", height: 46, padding: "0 14px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 16, marginBottom: 14, boxSizing: "border-box" }}
            />
            <button
              onClick={() => runDiscovery()}
              disabled={loading}
              style={{ width: "100%", height: 48, borderRadius: 12, border: "none", background: "#FF6B00", color: "#FFFFFF", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
            >
              {loading ? "Loading Catalog..." : "Unlock & Auto-Select Products"}
            </button>
          </div>
        ) : (
          <>
            {/* Shipping & Pricing Automation Rules Card */}
            <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 16, border: "1px solid #E5E7EB", marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>Shipping & Automated Pricing Rules</h2>
                  <p style={{ fontSize: 12.5, color: "#6B7280", margin: "2px 0 0" }}>
                    Applied automatically when selecting products and pushing to your Shopify store, Web & Mobile App.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, background: shipToUsaOnly ? "#ECFDF5" : "#F3F4F6", border: `1px solid ${shipToUsaOnly ? "#10B981" : "#D1D5DB"}`, padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 800, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={shipToUsaOnly}
                      onChange={(e) => {
                        setShipToUsaOnly(e.target.checked);
                        runDiscovery(category, e.target.checked);
                      }}
                    />
                    🇺🇸 Ship to USA Only ({shipToUsaOnly ? "ON" : "OFF"})
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: 8, background: pricingEnabled ? "#FFF7ED" : "#F3F4F6", border: `1px solid ${pricingEnabled ? "#FF6B00" : "#D1D5DB"}`, padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 800, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={pricingEnabled}
                      onChange={(e) => setPricingEnabled(e.target.checked)}
                    />
                    💲 Pricing Settings ({pricingEnabled ? "ON" : "OFF"})
                  </label>
                </div>
              </div>

              {pricingEnabled && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, paddingTop: 12, borderTop: "1px solid #F3F4F6" }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: "#374151", marginBottom: 4 }}>Markup Multiplier (x Cost)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.1"
                      max="8"
                      value={markup}
                      onChange={(e) => setMarkup(e.target.value)}
                      style={{ width: "100%", height: 38, padding: "0 10px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: "#374151", marginBottom: 4 }}>Minimum Profit Floor ($)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={minProfitUsd}
                      onChange={(e) => setMinProfitUsd(e.target.value)}
                      style={{ width: "100%", height: 38, padding: "0 10px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: "#374151", marginBottom: 4 }}>Compare-At Discount (%)</label>
                    <input
                      type="number"
                      step="1"
                      min="10"
                      max="80"
                      value={compareAtBoost}
                      disabled={!includeCompareAt}
                      onChange={(e) => setCompareAtBoost(e.target.value)}
                      style={{ width: "100%", height: 38, padding: "0 10px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                      <input type="checkbox" checked={roundTo99} onChange={(e) => setRoundTo99(e.target.checked)} />
                      End prices in .99 (US Retail)
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                      <input type="checkbox" checked={includeCompareAt} onChange={(e) => setIncludeCompareAt(e.target.checked)} />
                      Set strike-through Compare-At price
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Filter & Push Action Bar */}
            <div style={{ background: "#FFFFFF", padding: 18, borderRadius: 16, border: "1px solid #E5E7EB", marginBottom: 22, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, flex: 1 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 4 }}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      runDiscovery(e.target.value);
                    }}
                    style={{ height: 42, padding: "0 12px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 14, background: "#F9FAFB" }}
                  >
                    <option value="All">All Winning Niches</option>
                    <option value="Tech">Tech & Accessories</option>
                    <option value="Kitchen">Kitchen & Home</option>
                    <option value="Smart Home">Smart Home</option>
                    <option value="Fitness">Fitness & Wellness</option>
                    <option value="Auto">Auto & Gear</option>
                  </select>
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 4 }}>Search Keyword</label>
                  <input
                    type="text"
                    placeholder="e.g. MagSafe, LED, Espresso..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runDiscovery()}
                    style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>

                <button
                  onClick={() => runDiscovery()}
                  disabled={loading}
                  style={{ height: 42, padding: "0 18px", borderRadius: 10, border: "1px solid #111827", background: "#FFFFFF", color: "#111827", fontWeight: 800, fontSize: 13.5, cursor: "pointer" }}
                >
                  {loading ? "Applying..." : "Apply & Recalculate"}
                </button>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={runDsersOptimizer}
                  disabled={importing}
                  style={{ height: 42, padding: "0 16px", borderRadius: 10, border: "1px solid #E5E7EB", background: "#111827", color: "#FFFFFF", fontWeight: 800, fontSize: 13.5, cursor: "pointer" }}
                >
                  Optimize & Publish DSers Drafts
                </button>
                <button
                  onClick={pushSelectedToStore}
                  disabled={importing || selectedCount === 0}
                  style={{ height: 42, padding: "0 20px", borderRadius: 10, border: "none", background: "#FF6B00", color: "#FFFFFF", fontWeight: 900, fontSize: 14, cursor: "pointer", opacity: importing || selectedCount === 0 ? 0.65 : 1 }}
                >
                  {importing ? "Pushing to Store..." : `Push ${selectedCount} Selected to Web & App →`}
                </button>
              </div>
            </div>

            {/* Candidate Product Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 18 }}>
              {candidates.map((item) => {
                const isSelected = !!selectedIds[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 16,
                      overflow: "hidden",
                      border: isSelected ? "2px solid #FF6B00" : "1px solid #E5E7EB",
                      cursor: "pointer",
                      boxShadow: isSelected ? "0 8px 24px rgba(255,107,0,0.12)" : "none",
                    }}
                  >
                    <div style={{ position: "relative", height: 190, background: "#F3F4F6" }}>
                      <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <span style={{ position: "absolute", top: 10, left: 10, background: "#065F46", color: "#FFFFFF", fontSize: 11, fontWeight: 800, padding: "4px 9px", borderRadius: 999 }}>
                        🇺🇸 Ships to USA
                      </span>
                      <span style={{ position: "absolute", top: 10, right: 10, background: isSelected ? "#FF6B00" : "#FFFFFF", color: isSelected ? "#FFFFFF" : "#111827", border: "1px solid #E5E7EB", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 999 }}>
                        {isSelected ? "✓ Selected" : "+ Select"}
                      </span>
                    </div>

                    <div style={{ padding: 16 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", marginBottom: 4 }}>
                        {item.category} • {item.shippingDays}
                      </div>
                      <h3 style={{ fontSize: 15.5, fontWeight: 800, lineHeight: 1.35, marginBottom: 10 }}>{item.title}</h3>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC", padding: "10px 12px", borderRadius: 10, marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 700 }}>Cost</div>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>${item.supplierCost.toFixed(2)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 700 }}>Retail Price</div>
                          <div style={{ fontSize: 16, fontWeight: 900, color: "#059669" }}>
                            ${item.retailPrice}
                            {item.compareAtPrice && (
                              <span style={{ fontSize: 11.5, color: "#9CA3AF", textDecoration: "line-through", marginLeft: 5 }}>
                                ${item.compareAtPrice}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 700 }}>Profit</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>+${item.estimatedProfit}</div>
                        </div>
                      </div>

                      <div style={{ fontSize: 12, color: "#4B5563" }}>
                        ★ {item.rating} ({item.ordersCount.toLocaleString()} orders) • {item.usCarrier}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
