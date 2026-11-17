import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { fetchProducts, Product } from "../services/storeApi";
import { useCart } from "../context/CartContext";

interface CollectionCardMeta {
  id: string;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  image: string;
  keywords: string[];
}

const US_DEPARTMENTS: CollectionCardMeta[] = [
  {
    id: "All",
    label: "For you",
    subtitle: "Curated Daily Picks",
    icon: "sparkles-outline",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&q=80",
    keywords: [],
  },
  {
    id: "Mobiles & Accessories",
    label: "Mobiles & Accessories",
    subtitle: "Cases, Chargers & Gear",
    icon: "phone-portrait-outline",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80",
    keywords: ["phone accessories", "mobile", "phone", "charg", "magsafe"],
  },
  {
    id: "Electronics",
    label: "Electronics",
    subtitle: "Laptops, Audio & Tech",
    icon: "laptop-outline",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80",
    keywords: ["trending tech products", "tech", "electronic", "audio", "smart", "laptop"],
  },
  {
    id: "Home & Kitchen",
    label: "Home & Kitchen",
    subtitle: "Kitchen & Home Essentials",
    icon: "home-outline",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=400&q=80",
    keywords: ["home & kitchen gadgets", "home", "kitchen", "living"],
  },
  {
    id: "Fashion",
    label: "Fashion",
    subtitle: "Style & Everyday Wear",
    icon: "shirt-outline",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80",
    keywords: ["fashion", "wear", "watch", "apparel", "bag"],
  },
  {
    id: "Appliances",
    label: "Appliances",
    subtitle: "Desk & Workspace Gear",
    icon: "desktop-outline",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80",
    keywords: ["desk setup products", "appliance", "desk", "office", "setup"],
  },
  {
    id: "Gaming",
    label: "Gaming",
    subtitle: "Controllers & Pro Gear",
    icon: "game-controller-outline",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80",
    keywords: ["gaming accessories", "gaming", "game", "rgb", "controller"],
  },
  {
    id: "Smart Home",
    label: "Smart Home",
    subtitle: "Connected Home Devices",
    icon: "bulb-outline",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=80",
    keywords: ["smart home gadgets", "smart home", "lamp", "light", "sensor"],
  },
  {
    id: "Sports & Fitness",
    label: "Sports & Fitness",
    subtitle: "Active & Recovery Gear",
    icon: "fitness-outline",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80",
    keywords: ["outdoor & fitness gadgets", "fitness", "sport", "outdoor", "wellness"],
  },
  {
    id: "Travel",
    label: "Travel",
    subtitle: "Travel & On-The-Go Gear",
    icon: "airplane-outline",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
    keywords: ["travel gadgets", "travel", "portable", "luggage", "trip"],
  },
  {
    id: "Kids & Toys",
    label: "Kids & Toys",
    subtitle: "Fun & Learning for Kids",
    icon: "happy-outline",
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=400&q=80",
    keywords: ["kids", "toy", "child", "play"],
  },
  {
    id: "Accessories",
    label: "Accessories",
    subtitle: "Car & Everyday Add-Ons",
    icon: "car-sport-outline",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80",
    keywords: ["car gadgets", "car", "auto", "accessor"],
  },
  {
    id: "Pet",
    label: "Pet",
    subtitle: "Smart Pet Tech & Care",
    icon: "paw-outline",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80",
    keywords: ["pet tech", "pet", "dog", "cat"],
  },
];

export default function CategoriesScreen() {
  const navigation = useNavigation<any>();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<CollectionCardMeta | null>(null);

  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const buttonTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [toastProduct, setToastProduct] = useState<Product | null>(null);
  const toastAnim = useRef(new Animated.Value(140)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchProducts()
      .then((res) => setProducts(res.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visibleProducts = useMemo(() => {
    if (!selectedDept) return [];
    if (selectedDept.id === "All") return products;
    return products.filter((p) => {
      const catLower = (p.category || "").toLowerCase();
      const nameLower = (p.name || "").toLowerCase();
      return (
        catLower === selectedDept.id.toLowerCase() ||
        selectedDept.keywords.some((kw) => catLower.includes(kw) || nameLower.includes(kw))
      );
    });
  }, [products, selectedDept]);

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

    showCartPopup(item);
  };

  const renderHomeStyleProduct = ({ item }: { item: Product }) => {
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

  if (selectedDept) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.detailHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setSelectedDept(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={19} color="#111827" />
            <Text style={styles.backText}>Categories</Text>
          </TouchableOpacity>
          <View style={styles.detailTitleRow}>
            <View style={styles.detailIconCircle}>
              <Ionicons name={selectedDept.icon} size={20} color="#FF6B00" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>{selectedDept.label}</Text>
              <Text style={styles.headerSub}>{selectedDept.subtitle}</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF6B00" />
          </View>
        ) : (
          <FlatList
            data={visibleProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 90 }}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="cube-outline" size={34} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No products in {selectedDept.label} yet</Text>
                <Text style={styles.emptySub}>New arrivals are added regularly.</Text>
                <TouchableOpacity
                  style={styles.browseAllBtn}
                  onPress={() => setSelectedDept(null)}
                >
                  <Text style={styles.browseAllText}>Back to All Categories</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={renderHomeStyleProduct}
          />
        )}

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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop by Category</Text>
        <Text style={styles.headerSub}>Tap any department to explore verified products</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 32 }}>
        <View style={styles.catGrid}>
          {US_DEPARTMENTS.map((dept) => (
            <TouchableOpacity
              key={dept.id}
              style={styles.catCard}
              activeOpacity={0.85}
              onPress={() => setSelectedDept(dept)}
            >
              <View style={styles.catImageWrap}>
                <Image source={{ uri: dept.image }} style={styles.catImage} resizeMode="cover" />
                <View style={styles.catFloatingIcon}>
                  <Ionicons name={dept.icon} size={17} color="#FF6B00" />
                </View>
              </View>
              <View style={styles.catCardFooter}>
                <Text style={styles.catName} numberOfLines={1}>
                  {dept.label}
                </Text>
                <Text style={styles.catSub} numberOfLines={1}>
                  {dept.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  detailHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  backText: { fontSize: 13, fontWeight: "800", color: "#111827" },
  detailTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#111827" },
  headerSub: { fontSize: 12.5, color: "#6B7280", marginTop: 2 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  catCard: {
    width: "48.2%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  catImageWrap: {
    width: "100%",
    height: 112,
    backgroundColor: "#F1F5F9",
    position: "relative",
  },
  catImage: { width: "100%", height: "100%" },
  catFloatingIcon: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  catCardFooter: { padding: 11 },
  catName: { fontSize: 14, fontWeight: "800", color: "#111827" },
  catSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },

  /* Home-Style 2-Column Product Cards */
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

  inlineResetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
  },
  inlineResetText: { fontSize: 11.5, fontWeight: "800", color: "#DC2626" },
  toastThumbWrap: { position: "relative" },
  toastThumb: { width: 40, height: 40, borderRadius: 9, backgroundColor: "#FFFFFF" },
  toastMiniBadge: {
    position: "absolute",
    bottom: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#111827",
  },
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

  emptyBox: { padding: 36, alignItems: "center" },
  emptyTitle: { fontSize: 15.5, fontWeight: "800", color: "#111827", marginTop: 10 },
  emptySub: { fontSize: 12.5, color: "#6B7280", marginTop: 4, marginBottom: 14 },
  browseAllBtn: {
    backgroundColor: "#FF6B00",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  browseAllText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});
