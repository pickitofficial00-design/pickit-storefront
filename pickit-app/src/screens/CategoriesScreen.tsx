import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<CollectionCardMeta | null>(null);

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

  if (selectedDept) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.detailHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setSelectedDept(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
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
            contentContainerStyle={{ padding: 14, paddingBottom: 28 }}
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
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.rowCard}
                onPress={() => navigation.navigate("ProductDetail", { product: item })}
              >
                <Image
                  source={{ uri: item.image || "https://via.placeholder.com/200" }}
                  style={styles.thumb}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.rowBrandLine}>
                    <Text style={styles.brand}>{item.brand || "PICKIT"}</Text>
                    <Ionicons name="checkmark-circle" size={12} color="#FF6B00" />
                  </View>
                  <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          />
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
  container: { flex: 1, backgroundColor: "#F8FAFC" },
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
  catImage: {
    width: "100%",
    height: "100%",
  },
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
  catCardFooter: {
    padding: 11,
  },
  catName: { fontSize: 14, fontWeight: "800", color: "#111827" },
  catSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  thumb: { width: 68, height: 68, borderRadius: 10, backgroundColor: "#F3F4F6" },
  rowBrandLine: { flexDirection: "row", alignItems: "center", gap: 4 },
  brand: { fontSize: 10, fontWeight: "800", color: "#FF6B00", textTransform: "uppercase" },
  name: { fontSize: 14, fontWeight: "700", color: "#111827", marginVertical: 3 },
  price: { fontSize: 15, fontWeight: "900", color: "#111827" },
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
