import React from "react";
import {
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
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function OrdersScreen() {
  const navigation = useNavigation<any>();
  const { orders } = useCart();
  const { user, openAuthModal } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
        <View style={{ backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#111827" }}>My Orders</Text>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 28 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#FFF7ED", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Ionicons name="cube-outline" size={34} color="#FF6B00" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#111827", marginBottom: 8, textAlign: "center" }}>
            Sign in to view your orders
          </Text>
          <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 20, marginBottom: 22 }}>
            Sign in or create a free PICKIT account to track shipments, view receipts, and manage returns.
          </Text>
          <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: "#111827", paddingVertical: 14, borderRadius: 12, alignItems: "center" }}
              onPress={() => openAuthModal("login")}
              activeOpacity={0.85}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 14.5, fontWeight: "800" }}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: "#FF6B00", paddingVertical: 14, borderRadius: 12, alignItems: "center" }}
              onPress={() => openAuthModal("signup")}
              activeOpacity={0.85}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 14.5, fontWeight: "800" }}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSub}>Track shipments & view past PICKIT. purchases</Text>
        </View>
        <View style={styles.shieldPill}>
          <Ionicons name="shield-checkmark" size={14} color="#059669" />
          <Text style={styles.shieldText}>Protected</Text>
        </View>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyBox}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="cube-outline" size={38} color="#FF6B00" />
          </View>
          <Text style={styles.emptyTitle}>No orders placed yet</Text>
          <Text style={styles.emptySub}>
            Once you complete checkout, your order confirmation, items, and live tracking updates will appear right here.
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            <Text style={styles.shopBtnText}>Explore Top Picks</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 14, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderTopRow}>
                <View>
                  <Text style={styles.orderNum}>Order #{item.orderNumber}</Text>
                  <Text style={styles.orderDate}>Placed on {item.date}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.itemsList}>
                {item.items.map((entry) => (
                  <View key={entry.product.id} style={styles.orderItemRow}>
                    <Image
                      source={{ uri: entry.product.image || "https://via.placeholder.com/120" }}
                      style={styles.itemThumb}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {entry.product.name}
                      </Text>
                      <Text style={styles.itemQty}>
                        Qty: {entry.quantity}  •  ${(entry.product.price * entry.quantity).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.totalLabel}>
                  Total Paid: <Text style={styles.totalVal}>${item.total.toFixed(2)}</Text>
                </Text>
                <TouchableOpacity
                  style={styles.trackBtn}
                  onPress={() => navigation.navigate("Account")}
                >
                  <Ionicons name="navigate-outline" size={14} color="#FF6B00" />
                  <Text style={styles.trackBtnText}>Tracking Info</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 21, fontWeight: "900", color: "#111827" },
  headerSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  shieldPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  shieldText: { fontSize: 11.5, fontWeight: "800", color: "#059669" },
  emptyBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 28 },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 19, fontWeight: "900", color: "#111827", marginBottom: 6 },
  emptySub: { fontSize: 13.5, color: "#6B7280", textAlign: "center", lineHeight: 20, marginBottom: 20 },
  shopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#111827",
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 999,
  },
  shopBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  orderNum: { fontSize: 15, fontWeight: "900", color: "#111827" },
  orderDate: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#059669" },
  statusText: { fontSize: 11.5, fontWeight: "800", color: "#059669" },
  itemsList: { paddingVertical: 10, gap: 8 },
  orderItemRow: { flexDirection: "row", alignItems: "center" },
  itemThumb: { width: 46, height: 46, borderRadius: 8, backgroundColor: "#F3F4F6" },
  itemName: { fontSize: 13.5, fontWeight: "700", color: "#111827" },
  itemQty: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  totalLabel: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  totalVal: { fontSize: 15, fontWeight: "900", color: "#111827" },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
  },
  trackBtnText: { fontSize: 12, fontWeight: "800", color: "#FF6B00" },
});
