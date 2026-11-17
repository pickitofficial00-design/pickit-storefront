import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
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
  keywords: string[];
}

const US_DEPARTMENTS: CollectionCardMeta[] = [
  { id: "All", label: "For you", subtitle: "All Verified Picks", icon: "sparkles-outline", keywords: [] },
  { id: "Mobiles & Accessories", label: "Mobiles & Accessories", subtitle: "Cases, Chargers & Gear", icon: "phone-portrait-outline", keywords: ["phone accessories", "mobile", "phone", "charg", "magsafe"] },
  { id: "Electronics", label: "Electronics", subtitle: "Trending Tech & Audio", icon: "hardware-chip-outline", keywords: ["trending tech products", "tech", "electronic", "audio", "smart"] },
  { id: "Home & Kitchen", label: "Home & Kitchen", subtitle: "Kitchen & Home Essentials", icon: "home-outline", keywords: ["home & kitchen gadgets", "home", "kitchen", "living"] },
  { id: "Fashion", label: "Fashion", subtitle: "Style & Everyday Wear", icon: "shirt-outline", keywords: ["fashion", "wear", "watch", "apparel", "bag"] },
  { id: "Appliances", label: "Appliances", subtitle: "Desk & Workspace Gear", icon: "desktop-outline", keywords: ["desk setup products", "appliance", "desk", "office", "setup"] },
  { id: "Gaming", label: "Gaming", subtitle: "Pro Gaming Accessories", icon: "game-controller-outline", keywords: ["gaming accessories", "gaming", "game", "rgb", "controller"] },
  { id: "Smart Home", label: "Smart Home", subtitle: "Connected Home Gadgets", icon: "bulb-outline", keywords: ["smart home gadgets", "smart home", "lamp", "light", "sensor"] },
  { id: "Sports & Fitness", label: "Sports & Fitness", subtitle: "Outdoor & Fitness Gear", icon: "fitness-outline", keywords: ["outdoor & fitness gadgets", "fitness", "sport", "outdoor", "wellness"] },
  { id: "Travel", label: "Travel", subtitle: "Travel & On-The-Go Gear", icon: "airplane-outline", keywords: ["travel gadgets", "travel", "portable", "luggage", "trip"] },
  { id: "Kids & Toys", label: "Kids & Toys", subtitle: "Fun & Learning for Kids", icon: "happy-outline", keywords: ["kids", "toy", "child", "play"] },
  { id: "Accessories", label: "Accessories", subtitle: "Car & Everyday Add-Ons", icon: "car-sport-outline", keywords: ["car gadgets", "car", "auto", "accessor"] },
  { id: "Pet", label: "Pet", subtitle: "Smart Pet Tech & Care", icon: "paw-outline", keywords: ["pet tech", "pet", "dog", "cat"] },
];

export default function CategoriesScreen() {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>("All");

  useEffect(() => {
    fetchProducts()
      .then((res) => setProducts(res.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const matchProductToDept = (p: Product, dept: CollectionCardMeta) => {
    if (dept.id === "All") return true;
    const catLower = (p.category || "").toLowerCase();
    const nameLower = (p.name || "").toLowerCase();
    return (
      catLower === dept.id.toLowerCase() ||
      dept.keywords.some((kw) => catLower.includes(kw) || nameLower.includes(kw))
    );
  };

  const visibleProducts = useMemo(() => {
    const dept = US_DEPARTMENTS.find((d) => d.id === selected) || US_DEPARTMENTS[0];
    return products.filter((p) => matchProductToDept(p, dept));
  }, [products, selected]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Departments</Text>
        <Text style={styles.headerSub}>PICKIT Assured • Free Tracked US Shipping $35+</Text>
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
          ListHeaderComponent={
            <View style={{ marginBottom: 14 }}>
              <View style={styles.catGrid}>
                {US_DEPARTMENTS.map((dept) => {
                  const active = selected === dept.id;
                  const count = products.filter((p) => matchProductToDept(p, dept)).length;
                  return (
                    <TouchableOpacity
                      key={dept.id}
                      style={[styles.catCard, active && styles.catCardActive]}
                      onPress={() => setSelected(dept.id)}
                    >
                      <View style={[styles.iconBadge, active && styles.iconBadgeActive]}>
                        <Ionicons
                          name={dept.icon}
                          size={20}
                          color={active ? "#FFFFFF" : "#FF6B00"}
                        />
                      </View>
                      <Text
                        style={[styles.catName, active && { color: "#FFFFFF" }]}
                        numberOfLines={1}
                      >
                        {dept.label}
                      </Text>
                      <Text
                        style={[styles.catSub, active && { color: "#D1D5DB" }]}
                        numberOfLines={1}
                      >
                        {dept.subtitle}
                      </Text>
                      <Text style={[styles.catCount, active && { color: "#FF8A34" }]}>
                        {count} {count === 1 ? "item" : "items"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.sectionTitle}>
                {selected === "All" ? "All Verified Items" : selected} ({visibleProducts.length})
              </Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 21, fontWeight: "900", color: "#111827" },
  headerSub: { fontSize: 12.5, color: "#6B7280", marginTop: 2 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  catGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10, marginBottom: 16 },
  catCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  catCardActive: { backgroundColor: "#111827", borderColor: "#111827" },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconBadgeActive: {
    backgroundColor: "#FF6B00",
  },
  catName: { fontSize: 13.5, fontWeight: "800", color: "#111827" },
  catSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  catCount: { fontSize: 11, fontWeight: "800", color: "#FF6B00", marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
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
});
