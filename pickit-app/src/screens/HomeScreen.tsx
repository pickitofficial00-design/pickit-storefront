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
      <View style={styles.trustBar}>
        <Text style={styles.trustText}>Free Tracked Shipping on Orders $35+  •  30-Day Easy Returns</Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>VERIFIED US STOREFRONT</Text>
        </View>
        <Text style={styles.heroTitle}>Smart Picks. Everyday Value.</Text>
        <Text style={styles.heroSubtitle}>
          Curated essentials backed by our 30-Day Buyer Protection & fast tracked US delivery.
        </Text>
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>4.9★</Text>
            <Text style={styles.heroStatLabel}>Verified Rating</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>2–5 Days</Text>
            <Text style={styles.heroStatLabel}>US Delivery</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>100%</Text>
            <Text style={styles.heroStatLabel}>Secure Pay</Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
      >
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.catPill, active && styles.catPillActive]}
            >
              <Text style={[styles.catText, active && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === "All" ? "Featured Products" : selectedCategory}{" "}
          <Text style={styles.countText}>({filteredProducts.length})</Text>
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(
            [
              { id: "featured", label: "Featured" },
              { id: "price_asc", label: "Price: Low" },
              { id: "price_desc", label: "Price: High" },
              { id: "rating", label: "Top Rated" },
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
              <Text style={styles.discountText}>SAVE {item.discount}%</Text>
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
          <Text style={styles.brandText} numberOfLines={1}>
            {item.brand || "PICKIT VERIFIED"}
          </Text>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.starText}>★ {rating}</Text>
            <Text style={styles.verifiedTag}>• In Stock</Text>
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
  container: { flex: 1, backgroundColor: "#F8FAFC" },
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
  wordmarkPick: {
    color: "#111827",
  },
  wordmarkIt: {
    color: "#FF6B00",
  },
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
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 42,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },
  trustBar: {
    backgroundColor: "#111827",
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  trustText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700", letterSpacing: 0.2 },
  heroCard: {
    margin: 14,
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 107, 0, 0.18)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  heroBadgeText: { color: "#FF8A34", fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  heroTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", marginBottom: 6 },
  heroSubtitle: { color: "#D1D5DB", fontSize: 13, lineHeight: 19, marginBottom: 14 },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatValue: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  heroStatLabel: { color: "#9CA3AF", fontSize: 11, marginTop: 2 },
  heroDivider: { width: 1, height: 24, backgroundColor: "#374151" },
  catRow: { paddingHorizontal: 14, paddingBottom: 10, gap: 8 },
  catPill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  catPillActive: { backgroundColor: "#FF6B00", borderColor: "#FF6B00" },
  catText: { color: "#374151", fontSize: 13, fontWeight: "700" },
  catTextActive: { color: "#FFFFFF" },
  sectionHeader: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#111827", marginBottom: 8 },
  countText: { color: "#6B7280", fontWeight: "600", fontSize: 14 },
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
  gridRow: { paddingHorizontal: 14, justifyContent: "space-between", marginBottom: 12 },
  card: {
    width: "48.2%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  imageWrap: { width: "100%", height: 155, backgroundColor: "#F3F4F6", position: "relative" },
  productImage: { width: "100%", height: "100%" },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF6B00",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
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
  cardBody: { padding: 11 },
  brandText: { fontSize: 10, fontWeight: "800", color: "#6B7280", textTransform: "uppercase", marginBottom: 3 },
  productName: { fontSize: 13.5, fontWeight: "700", color: "#111827", lineHeight: 18, minHeight: 36 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 6, marginBottom: 8 },
  starText: { fontSize: 12, fontWeight: "800", color: "#F59E0B" },
  verifiedTag: { fontSize: 11, color: "#059669", fontWeight: "700", marginLeft: 4 },
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
