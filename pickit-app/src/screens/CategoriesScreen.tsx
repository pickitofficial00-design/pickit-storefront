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

function getCategoryIcon(name: string): keyof typeof Ionicons.glyphMap {
  const key = name.toLowerCase();
  if (key.includes("phone") || key.includes("mobile")) return "phone-portrait-outline";
  if (key.includes("tech") || key.includes("gadget") || key.includes("electronic")) return "hardware-chip-outline";
  if (key.includes("desk") || key.includes("office") || key.includes("setup")) return "desktop-outline";
  if (key.includes("game") || key.includes("gaming")) return "game-controller-outline";
  if (key.includes("travel") || key.includes("bag")) return "airplane-outline";
  if (key.includes("fitness") || key.includes("outdoor") || key.includes("sport")) return "fitness-outline";
  if (key.includes("home") || key.includes("kitchen")) return "home-outline";
  if (key.includes("fashion") || key.includes("wear") || key.includes("watch")) return "watch-outline";
  return "layers-outline";
}

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

  const groups = useMemo(() => {
    const map = new Map<string, Product[]>();
    products.forEach((p) => {
      const cat = p.category || "General";
      map.set(cat, [...(map.get(cat) || []), p]);
    });
    return Array.from(map.entries()).map(([name, items]) => ({
      name,
      count: items.length,
    }));
  }, [products]);

  const visibleProducts = useMemo(
    () =>
      selected === "All"
        ? products
        : products.filter((p) => (p.category || "General") === selected),
    [products, selected]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Collections</Text>
        <Text style={styles.headerSub}>Curated categories backed by PICKIT Buyer Protection</Text>
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
                <TouchableOpacity
                  style={[styles.catCard, selected === "All" && styles.catCardActive]}
                  onPress={() => setSelected("All")}
                >
                  <View style={[styles.iconBadge, selected === "All" && styles.iconBadgeActive]}>
                    <Ionicons
                      name={selected === "All" ? "sparkles" : "sparkles-outline"}
                      size={20}
                      color={selected === "All" ? "#FFFFFF" : "#FF6B00"}
                    />
                  </View>
                  <Text style={[styles.catName, selected === "All" && { color: "#FFFFFF" }]}>
                    All Picks
                  </Text>
                  <Text style={[styles.catCount, selected === "All" && { color: "#D1D5DB" }]}>
                    {products.length} items
                  </Text>
                </TouchableOpacity>

                {groups.map((g) => {
                  const active = selected === g.name;
                  return (
                    <TouchableOpacity
                      key={g.name}
                      style={[styles.catCard, active && styles.catCardActive]}
                      onPress={() => setSelected(g.name)}
                    >
                      <View style={[styles.iconBadge, active && styles.iconBadgeActive]}>
                        <Ionicons
                          name={getCategoryIcon(g.name)}
                          size={20}
                          color={active ? "#FFFFFF" : "#FF6B00"}
                        />
                      </View>
                      <Text
                        style={[styles.catName, active && { color: "#FFFFFF" }]}
                        numberOfLines={1}
                      >
                        {g.name}
                      </Text>
                      <Text style={[styles.catCount, active && { color: "#D1D5DB" }]}>
                        {g.count} {g.count === 1 ? "item" : "items"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.sectionTitle}>
                {selected === "All" ? "All Verified Items" : selected}
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
                <Text style={styles.brand}>{item.brand || "PICKIT VERIFIED"}</Text>
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
    padding: 14,
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
    marginBottom: 10,
  },
  iconBadgeActive: {
    backgroundColor: "#FF6B00",
  },
  catName: { fontSize: 14, fontWeight: "800", color: "#111827" },
  catCount: { fontSize: 12, color: "#6B7280", marginTop: 2 },
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
  brand: { fontSize: 10, fontWeight: "800", color: "#FF6B00", textTransform: "uppercase" },
  name: { fontSize: 14, fontWeight: "700", color: "#111827", marginVertical: 3 },
  price: { fontSize: 15, fontWeight: "900", color: "#111827" },
});
