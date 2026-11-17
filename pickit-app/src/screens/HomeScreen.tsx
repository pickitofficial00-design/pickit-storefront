import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
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
type PriceFilter = "all" | "under_25" | "25_to_50" | "over_50";

interface CollectionItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  keywords: string[];
}

const US_COLLECTIONS: CollectionItem[] = [
  { id: "All", label: "All Deals", icon: "grid", keywords: [] },
  { id: "Top Rated", label: "Top Rated", icon: "trophy", keywords: ["top rated", "best", "featured"] },
  { id: "Mobile & Charging", label: "Mobile & Charging", icon: "phone-portrait", keywords: ["mobile", "phone", "charg", "cable", "magsafe"] },
  { id: "Everyday Tech", label: "Everyday Tech", icon: "hardware-chip", keywords: ["tech", "electronic", "gadget", "smart", "audio"] },
  { id: "Work From Home", label: "Work From Home", icon: "desktop", keywords: ["work", "desk", "office", "setup", "laptop"] },
  { id: "Gaming Setup", label: "Gaming Setup", icon: "game-controller", keywords: ["game", "gaming", "rgb", "controller"] },
  { id: "Travel Essentials", label: "Travel Essentials", icon: "airplane", keywords: ["travel", "bag", "portable", "trip"] },
  { id: "Fitness & Wellness", label: "Fitness & Wellness", icon: "fitness", keywords: ["fitness", "wellness", "outdoor", "sport", "health"] },
  { id: "Home Upgrades", label: "Home Upgrades", icon: "home", keywords: ["home", "kitchen", "living", "lamp"] },
];

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
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Track which product buttons show "Added to Cart" for 4 seconds
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const buttonTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // In-app floating popup banner state
  const [toastProduct, setToastProduct] = useState<Product | null>(null);
  const toastAnim = useRef(new Animated.Value(140)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (priceFilter !== "all") count++;
    if (onlyDeals) count++;
    if (sortBy !== "featured") count++;
    return count;
  }, [priceFilter, onlyDeals, sortBy]);

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      let matchesCat = true;
      if (selectedCategory !== "All") {
        const col = US_COLLECTIONS.find((c) => c.id === selectedCategory);
        const catLower = (p.category || "").toLowerCase();
        const nameLower = (p.name || "").toLowerCase();
        if (selectedCategory === "Top Rated") {
          matchesCat = (p.rating || 4.8) >= 4.7 || catLower.includes("top rated");
        } else if (col) {
          matchesCat =
            catLower === col.id.toLowerCase() ||
            col.keywords.some((kw) => catLower.includes(kw) || nameLower.includes(kw));
        }
      }

      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));

      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "under_25" && p.price < 25) ||
        (priceFilter === "25_to_50" && p.price >= 25 && p.price <= 50) ||
        (priceFilter === "over_50" && p.price > 50);

      const matchesDeal = !onlyDeals || (p.discount && p.discount > 0);

      return matchesCat && matchesSearch && matchesPrice && matchesDeal;
    });

    if (sortBy === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "rating") list = [...list].sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
    return list;
  }, [products, selectedCategory, search, priceFilter, onlyDeals, sortBy]);

  const showCartPopup = (item: Product) => {
    setToastProduct(item);
    if (toastTimer.current) clearTimeout(toastTimer.current);

    toastAnim.setValue(140);
    Animated.spring(toastAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();

    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 140,
        duration: 240,
        useNativeDriver: true,
      }).start(() => setToastProduct(null));
    }, 3600);
  };

  const handleQuickAdd = (item: Product) => {
    addToCart(item, 1);

    // Button changes to "Added to Cart" for 4 seconds (4000ms)
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    if (buttonTimers.current[item.id]) {
      clearTimeout(buttonTimers.current[item.id]);
    }
    buttonTimers.current[item.id] = setTimeout(() => {
      setAddedIds((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }, 4000);

    // Show floating in-app popup
    showCartPopup(item);
  };

  const resetFilters = () => {
    setPriceFilter("all");
    setOnlyDeals(false);
    setSortBy("featured");
    setSelectedCategory("All");
    setSearch("");
  };

  const renderHeader = () => (
    <View>
      {/* Flipkart / Amazon style Visual US Collection Icon Strip */}
      <View style={styles.catSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {US_COLLECTIONS.map((col) => {
            const active = selectedCategory === col.id;
            return (
              <TouchableOpacity
                key={col.id}
                onPress={() => setSelectedCategory(col.id)}
                style={styles.catTile}
                activeOpacity={0.8}
              >
                <View style={[styles.catIconCircle, active && styles.catIconCircleActive]}>
                  <Ionicons
                    name={col.icon}
                    size={21}
                    color={active ? "#FFFFFF" : "#111827"}
                  />
                </View>
                <Text
                  style={[styles.catLabel, active && styles.catLabelActive]}
                  numberOfLines={2}
                >
                  {col.label}
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
          Quality-checked essentials backed by 30-Day Buyer Protection & fast tracked US delivery.
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

      {/* 4-Column Store Reliability Strip */}
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

      {/* Prominent Filter & Sort Action Bar */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === "All" ? "Top Picks For You" : selectedCategory}{" "}
            <Text style={styles.countText}>({filteredProducts.length})</Text>
          </Text>

          <TouchableOpacity
            style={[styles.filterMainBtn, activeFilterCount > 0 && styles.filterMainBtnActive]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons
              name="options-outline"
              size={15}
              color={activeFilterCount > 0 ? "#FFFFFF" : "#111827"}
            />
            <Text
              style={[
                styles.filterMainBtnText,
                activeFilterCount > 0 && styles.filterMainBtnTextActive,
              ]}
            >
              Filter & Sort{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setOnlyDeals((prev) => !prev)}
            style={[styles.sortChip, onlyDeals && styles.sortChipActive]}
          >
            <Ionicons
              name="pricetag-outline"
              size={12}
              color={onlyDeals ? "#FF6B00" : "#4B5563"}
            />
            <Text style={[styles.sortChipText, onlyDeals && styles.sortChipTextActive]}>
              On Sale
            </Text>
          </TouchableOpacity>

          {(
            [
              { id: "featured", label: "Featured" },
              { id: "price_asc", label: "Price: Low → High" },
              { id: "price_desc", label: "Price: High → Low" },
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
    const isAdded = !!addedIds[item.id];
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

          <View style={styles.ratingRow}>
            <View style={styles.greenRatingBadge}>
              <Text style={styles.greenRatingText}>{rating} ★</Text>
            </View>
            <Text style={styles.deliveryTag}>Free Delivery</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
            <TouchableOpacity
              style={[styles.addBtn, isAdded && styles.addBtnSuccess]}
              onPress={() => handleQuickAdd(item)}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isAdded ? "checkmark-circle" : "cart-outline"}
                size={13}
                color="#FFFFFF"
              />
              <Text style={styles.addBtnText}>
                {isAdded ? "Added to Cart" : "Add"}
              </Text>
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

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerFilterBtn, activeFilterCount > 0 && styles.headerFilterBtnActive]}
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons
                name="options-outline"
                size={18}
                color={activeFilterCount > 0 ? "#FFFFFF" : "#111827"}
              />
              {activeFilterCount > 0 && (
                <View style={styles.filterDot}>
                  <Text style={styles.filterDotText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>

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
              <Text style={styles.emptySub}>Try clearing your filters or choosing another collection.</Text>
              <TouchableOpacity style={styles.resetEmptyBtn} onPress={resetFilters}>
                <Text style={styles.resetEmptyText}>Reset All Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* In-App Floating "Added to Cart" Popup Banner */}
      {toastProduct && (
        <Animated.View
          style={[
            styles.toastContainer,
            { transform: [{ translateY: toastAnim }] },
          ]}
        >
          <View style={styles.toastLeft}>
            <View style={styles.toastCheckIcon}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.toastTitle}>Added to Cart</Text>
              <Text style={styles.toastSub} numberOfLines={1}>
                {toastProduct.name} • ${toastProduct.price.toFixed(2)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.toastCartBtn}
            onPress={() => {
              setToastProduct(null);
              navigation.navigate("Cart");
            }}
          >
            <Text style={styles.toastCartBtnText}>View Cart</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Filter & Sort Bottom Sheet Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter & Sort Products</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetLabel}>Sort By</Text>
            <View style={styles.sheetChipWrap}>
              {(
                [
                  { id: "featured", label: "Featured" },
                  { id: "price_asc", label: "Price: Low to High" },
                  { id: "price_desc", label: "Price: High to Low" },
                  { id: "rating", label: "Top Rated" },
                ] as { id: SortOption; label: string }[]
              ).map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setSortBy(s.id)}
                  style={[styles.sheetChip, sortBy === s.id && styles.sheetChipActive]}
                >
                  <Text
                    style={[
                      styles.sheetChipText,
                      sortBy === s.id && styles.sheetChipTextActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sheetLabel}>Price Range</Text>
            <View style={styles.sheetChipWrap}>
              {(
                [
                  { id: "all", label: "All Prices" },
                  { id: "under_25", label: "Under $25" },
                  { id: "25_to_50", label: "$25 – $50" },
                  { id: "over_50", label: "$50+" },
                ] as { id: PriceFilter; label: string }[]
              ).map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setPriceFilter(p.id)}
                  style={[styles.sheetChip, priceFilter === p.id && styles.sheetChipActive]}
                >
                  <Text
                    style={[
                      styles.sheetChipText,
                      priceFilter === p.id && styles.sheetChipTextActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sheetLabel}>Special Offers</Text>
            <TouchableOpacity
              style={[styles.dealToggleRow, onlyDeals && styles.dealToggleRowActive]}
              onPress={() => setOnlyDeals((prev) => !prev)}
            >
              <Ionicons
                name={onlyDeals ? "checkbox" : "square-outline"}
                size={20}
                color={onlyDeals ? "#FF6B00" : "#6B7280"}
              />
              <Text style={styles.dealToggleText}>Show Discounted Deals Only</Text>
            </TouchableOpacity>

            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.clearBtn} onPress={resetFilters}>
                <Text style={styles.clearBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyBtnText}>
                  Show {filteredProducts.length} Results
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerFilterBtn: {
    backgroundColor: "#F3F4F6",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerFilterBtnActive: {
    backgroundColor: "#FF6B00",
  },
  filterDot: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  filterDotText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
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
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  catRow: {
    paddingHorizontal: 12,
    gap: 8,
  },
  catTile: {
    alignItems: "center",
    width: 82,
    paddingHorizontal: 2,
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
    lineHeight: 14,
    minHeight: 28,
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
    marginTop: 4,
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
  trustItem: { flex: 1, alignItems: "center" },
  trustIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  trustItemTitle: { fontSize: 10.5, fontWeight: "800", color: "#111827" },
  trustItemSub: { fontSize: 9.5, color: "#6B7280", marginTop: 1 },

  /* Section Header & Filter Bar */
  sectionHeader: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16.5, fontWeight: "900", color: "#111827" },
  countText: { color: "#6B7280", fontWeight: "600", fontSize: 13.5 },
  filterMainBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  filterMainBtnActive: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },
  filterMainBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },
  filterMainBtnTextActive: {
    color: "#FFFFFF",
  },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  sortChipActive: { borderColor: "#FF6B00", backgroundColor: "#FFF7ED" },
  sortChipText: { fontSize: 12, color: "#4B5563", fontWeight: "600" },
  sortChipTextActive: { color: "#FF6B00", fontWeight: "800" },

  listContent: { paddingBottom: 90 },
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
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  priceText: { fontSize: 15, fontWeight: "900", color: "#111827" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#111827",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnSuccess: { backgroundColor: "#059669" },
  addBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },

  /* In-App Floating Cart Popup Banner */
  toastContainer: {
    position: "absolute",
    bottom: 14,
    left: 14,
    right: 14,
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  toastLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
    gap: 10,
  },
  toastCheckIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },
  toastTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  toastSub: { color: "#D1D5DB", fontSize: 11.5, marginTop: 1 },
  toastCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FF6B00",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
  },
  toastCartBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },

  /* Filter Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.55)",
    justifyContent: "flex-end",
  },
  filterSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    paddingBottom: 28,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  sheetLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#374151",
    marginTop: 10,
    marginBottom: 8,
  },
  sheetChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sheetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  sheetChipActive: {
    borderColor: "#FF6B00",
    backgroundColor: "#FFF7ED",
  },
  sheetChipText: { fontSize: 12.5, fontWeight: "700", color: "#374151" },
  sheetChipTextActive: { color: "#FF6B00", fontWeight: "800" },
  dealToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  dealToggleRowActive: {
    borderColor: "#FF6B00",
    backgroundColor: "#FFF7ED",
  },
  dealToggleText: { fontSize: 13.5, fontWeight: "700", color: "#111827" },
  sheetFooter: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  clearBtnText: { fontSize: 14, fontWeight: "800", color: "#374151" },
  applyBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#FF6B00",
    alignItems: "center",
  },
  applyBtnText: { fontSize: 14, fontWeight: "800", color: "#FFFFFF" },

  centerBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  loadingText: { marginTop: 12, color: "#4B5563", fontSize: 14, fontWeight: "600" },
  errorTitle: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 6 },
  errorSub: { fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 16 },
  retryBtn: { backgroundColor: "#FF6B00", paddingHorizontal: 20, paddingVertical: 11, borderRadius: 10 },
  retryText: { color: "#FFFFFF", fontWeight: "800" },
  emptyBox: { padding: 36, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 4 },
  emptySub: { fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 12 },
  resetEmptyBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  resetEmptyText: { color: "#FFFFFF", fontSize: 12.5, fontWeight: "800" },
});
