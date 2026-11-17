import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { fetchProducts, Product } from "../services/storeApi";
import { useCart } from "../context/CartContext";

type SortOption = "featured" | "price_asc" | "price_desc" | "rating";

function getCategoryMeta(name: string): {
  icon: keyof typeof Ionicons.glyphMap;
  shortLabel: string;
} {
  const key = name.toLowerCase();
  if (key === "all") return { icon: "grid", shortLabel: "All Deals" };
  if (key.includes("phone") || key.includes("mobile"))
    return { icon: "phone-portrait", shortLabel: "Mobiles & Gear" };
  if (key.includes("tech") || key.includes("gadget") || key.includes("electronic"))
    return { icon: "hardware-chip", shortLabel: "Smart Tech" };
  if (key.includes("desk") || key.includes("office") || key.includes("setup"))
    return { icon: "desktop", shortLabel: "Desk Setup" };
  if (key.includes("game") || key.includes("gaming"))
    return { icon: "game-controller", shortLabel: "Gaming" };
  if (key.includes("travel") || key.includes("bag"))
    return { icon: "airplane", shortLabel: "Travel" };
  if (key.includes("fitness") || key.includes("outdoor") || key.includes("sport"))
    return { icon: "fitness", shortLabel: "Fitness" };
  if (key.includes("home") || key.includes("kitchen"))
    return { icon: "home", shortLabel: "Home & Living" };
  if (key.includes("fashion") || key.includes("wear") || key.includes("watch"))
    return { icon: "watch", shortLabel: "Fashion" };
  return { icon: "pricetag", shortLabel: name };
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { addToCart, totalCount, toggleWishlist, isWishlisted } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [addedId, setAddedId] = useState<string | null>(null);

  const loadProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const res = await fetchProducts();
      setProducts(res.products || []);
    } catch (err: any) {
      setError(err?.message || "Unable to load store catalog");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });

    if (sortBy === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "rating") list = [...list].sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
    return list;
  }, [products, selectedCategory, search, sortBy]);

  const handleQuickAdd = (item: Product) => {
    addToCart(item, 1);
    setAddedId(item.id);
    setTimeout(() => setAddedId((prev) => (prev === item.id ? null : prev)), 1100);
  };

  const renderHeader = () => (
    <View>
      {/* Flipkart / Amazon style Visual Category Icon Strip */}
      <View style={styles.catSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            const meta = getCategoryMeta(cat);
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={styles.catTile}
                activeOpacity={0.8}
              >
                <View style={[styles.catIconCircle, active && styles.catIconCircleActive]}>
                  <Ionicons
                    name={meta.icon}
                    size={21}
                    color={active ? "#FFFFFF" : "#111827"}
                  />
                </View>
                <Text
                  style={[styles.catLabel, active && styles.catLabelActive]}
                  numberOfLines={1}
                >
                  {meta.shortLabel}
                </Text>
                <View style={[styles.catIndicator, active && styles.catIndicatorActive]} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Hero Banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Ionicons name="shield-checkmark" size={12} color="#FF8A34" />
          <Text style={styles.heroBadgeText}>VERIFIED US STOREFRONT</Text>
        </View>
        <Text style={styles.heroTitle}>Smart Picks. Everyday Value.</Text>
        <Text style={styles.heroSubtitle}>
          Quality-checked essentials backed by 30-Day Buyer Protection & fast tracked delivery.
        </Text>
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>4.9 ★</Text>
            <Text style={styles.heroStatLabel}>Verified Rating</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>2–5 Days</Text>
            <Text style={styles.heroStatLabel}>Tracked Delivery</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>30-Day</Text>
            <Text style={styles.heroStatLabel}>Easy Returns</Text>
          </View>
        </View>
      </View>

      {/* Amazon / Flipkart Reliability & Guarantees Bar */}
      <View style={styles.trustGrid}>
        <View style={styles.trustItem}>
          <View style={styles.trustIconBox}>
            <Ionicons name="cube-outline" size={17} color="#FF6B00" />
          </View>
          <Text style={styles.trustItemTitle}>Free Delivery</Text>
          <Text style={styles.trustItemSub}>Orders $35+</Text>
        </View>
        <View style={styles.trustItem}>
          <View style={styles.trustIconBox}>
            <Ionicons name="refresh-circle-outline" size={18} color="#FF6B00" />
          </View>
          <Text style={styles.trustItemTitle}>30-Day Return</Text>
          <Text style={styles.trustItemSub}>Easy refund</Text>
        </View>
        <View style={styles.trustItem}>
          <View style={styles.trustIconBox}>
            <Ionicons name="lock-closed-outline" size={17} color="#FF6B00" />
          </View>
          <Text style={styles.trustItemTitle}>Secure Pay</Text>
          <Text style={styles.trustItemSub}>Shopify SSL</Text>
        </View>
        <View style={styles.trustItem}>
          <View style={styles.trustIconBox}>
            <Ionicons name="ribbon-outline" size={17} color="#FF6B00" />
          </View>
          <Text style={styles.trustItemTitle}>Top Quality</Text>
          <Text style={styles.trustItemSub}>100% Tested</Text>
        </View>
      </View>

      {/* Section Title & Sort Chips */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === "All" ? "Top Picks For You" : selectedCategory}{" "}
          <Text style={styles.countText}>({filteredProducts.length})</Text>
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(
            [
              { id: "featured", label: "Featured" },
              { id: "price_asc", label: "Price: Low to High" },
              { id: "price_desc", label: "Price: High to Low" },
              { id: "rating", label: "Customer Top Rated" },
            ] as { id: SortOption; label: string }[]
          ).map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => setSortBy(s.id)}
              style={[styles.sortChip, sortBy === s.id && styles.sortChipActive]}
            >
              <Text style={[styles.sortChipText, sortBy === s.id && styles.sortChipTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderProduct = ({ item }: { item: Product }) => {
    const saved = isWishlisted(item.id);
    const justAdded = addedId === item.id;
    const rating = item.rating && item.rating > 0 ? item.rating.toFixed(1) : "4.8";

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => navigation.navigate("ProductDetail", { product: item })}
      >
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: item.image || "https://via.placeholder.com/400x400.png?text=PICKIT" }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {item.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount}% OFF</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => toggleWishlist(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={saved ? "heart" : "heart-outline"}
              size={17}
              color={saved ? "#EF4444" : "#374151"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.assuredRow}>
            <Text style={styles.brandText} numberOfLines={1}>
              {item.brand || "PICKIT"}
            </Text>
            <View style={styles.assuredPill}>
              <Ionicons name="checkmark-circle" size={11} color="#FF6B00" />
              <Text style={styles.assuredText}>Assured</Text>
            </View>
          </View>

          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Flipkart-style green rating badge + Free Delivery tag */}
          <View style={styles.ratingRow}>
            <View style={styles.greenRatingBadge}>
              <Text style={styles.greenRatingText}>{rating} ★</Text>
            </View>
            <Text style={styles.deliveryTag}>Free Delivery</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
            <TouchableOpacity
              style={[styles.addBtn, justAdded && styles.addBtnSuccess]}
              onPress={() => handleQuickAdd(item)}
            >
              <Text style={styles.addBtnText}>{justAdded ? "✓ Added" : "+ Add"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <Text style={styles.wordmark}>
            <Text style={styles.wordmarkPick}>PICK</Text>
            <Text style={styles.wordmarkIt}>IT.</Text>
          </Text>

          <TouchableOpacity
            style={styles.headerBagBtn}
            onPress={() => navigation.navigate("Cart")}
          >
            <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
            <Text style={styles.headerCartLabel}>Cart</Text>
            {totalCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{totalCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search gadgets, essentials, fashion..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Loading PICKIT storefront...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorTitle}>Connection Issue</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadProducts()}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          renderItem={renderProduct}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProducts(true)}
              tintColor="#FF6B00"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No matching products</Text>
              <Text style={styles.emptySub}>Try clearing your search or choosing another category.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  topHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  wordmark: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  wordmarkPick: { color: "#111827" },
  wordmarkIt: { color: "#FF6B00" },
  headerBagBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },
  headerCartLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
  headerBadge: {
    backgroundColor: "#FF6B00",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  headerBadgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },

  /* Flipkart / Amazon Visual Category Icon Bar */
  catSection: {
    backgroundColor: "#FFFFFF",
    paddingTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  catRow: {
    paddingHorizontal: 12,
    gap: 6,
  },
  catTile: {
    alignItems: "center",
    width: 78,
    paddingHorizontal: 4,
  },
  catIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  catIconCircleActive: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },
  catLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
  },
  catLabelActive: {
    color: "#FF6B00",
    fontWeight: "800",
  },
  catIndicator: {
    height: 3,
    width: 28,
    borderRadius: 2,
    backgroundColor: "transparent",
    marginTop: 6,
  },
  catIndicatorActive: {
    backgroundColor: "#FF6B00",
  },

  /* Hero Card */
  heroCard: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 107, 0, 0.18)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  heroBadgeText: { color: "#FF8A34", fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  heroTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", marginBottom: 4 },
  heroSubtitle: { color: "#D1D5DB", fontSize: 12.5, lineHeight: 18, marginBottom: 12 },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatValue: { color: "#FFFFFF", fontSize: 13.5, fontWeight: "800" },
  heroStatLabel: { color: "#9CA3AF", fontSize: 10.5, marginTop: 1 },
  heroDivider: { width: 1, height: 22, backgroundColor: "#374151" },

  /* 4-Column Store Reliability Strip */
  trustGrid: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  trustItem: {
    flex: 1,
    alignItems: "center",
  },
  trustIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  trustItemTitle: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#111827",
  },
  trustItemSub: {
    fontSize: 9.5,
    color: "#6B7280",
    marginTop: 1,
  },

  sectionHeader: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 },
  sectionTitle: { fontSize: 16.5, fontWeight: "900", color: "#111827", marginBottom: 8 },
  countText: { color: "#6B7280", fontWeight: "600", fontSize: 13.5 },
  sortChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
  },
  sortChipActive: { borderColor: "#FF6B00", backgroundColor: "#FFF7ED" },
  sortChipText: { fontSize: 12, color: "#4B5563", fontWeight: "600" },
  sortChipTextActive: { color: "#FF6B00", fontWeight: "800" },
  listContent: { paddingBottom: 24 },
  gridRow: { paddingHorizontal: 12, justifyContent: "space-between", marginBottom: 10 },
  card: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  imageWrap: { width: "100%", height: 155, backgroundColor: "#F8FAFC", position: "relative" },
  productImage: { width: "100%", height: "100%" },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#059669",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  discountText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { padding: 10 },
  assuredRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  brandText: { fontSize: 10, fontWeight: "800", color: "#6B7280", textTransform: "uppercase", flex: 1 },
  assuredPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  assuredText: { fontSize: 9.5, fontWeight: "800", color: "#FF6B00" },
  productName: { fontSize: 13.5, fontWeight: "700", color: "#111827", lineHeight: 18, minHeight: 36 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 6, marginBottom: 8, gap: 6 },
  greenRatingBadge: {
    backgroundColor: "#15803D",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  greenRatingText: { color: "#FFFFFF", fontSize: 10.5, fontWeight: "800" },
  deliveryTag: { fontSize: 11, color: "#374151", fontWeight: "700" },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  priceText: { fontSize: 16, fontWeight: "900", color: "#111827" },
  addBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnSuccess: { backgroundColor: "#059669" },
  addBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  loadingText: { marginTop: 12, color: "#4B5563", fontSize: 14, fontWeight: "600" },
  errorTitle: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 6 },
  errorSub: { fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 16 },
  retryBtn: { backgroundColor: "#FF6B00", paddingHorizontal: 20, paddingVertical: 11, borderRadius: 10 },
  retryText: { color: "#FFFFFF", fontWeight: "800" },
  emptyBox: { padding: 36, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 4 },
  emptySub: { fontSize: 13, color: "#6B7280", textAlign: "center" },
});
