import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../context/CartContext";

export default function AccountScreen() {
  const navigation = useNavigation<any>();
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const [policyModal, setPolicyModal] = useState<{ title: string; body: string } | null>(null);

  const policies = [
    {
      icon: "📦",
      title: "Track Your Order",
      sub: "Real-time USPS, UPS & FedEx tracking",
      body: "Once your PICKIT order ships (typically within 24–48 business hours), you will receive an automated email and SMS with your live USPS/UPS/FedEx tracking link.",
    },
    {
      icon: "🚚",
      title: "US Shipping Policy",
      sub: "Free standard shipping on orders $50+",
      body: "All orders over $50 qualify for FREE US Standard Shipping (2–5 business days). Orders under $50 ship at a flat $5.99 tracked rate across all 50 US states.",
    },
    {
      icon: "🔄",
      title: "30-Day Return Guarantee",
      sub: "Easy, no-questions-asked returns",
      body: "Not 100% thrilled with your purchase? Return any unused item within 30 days of delivery for a full refund to your original payment method.",
    },
    {
      icon: "💬",
      title: "US Customer Support",
      sub: "Fast response • Mon–Sat, 9am–6pm EST",
      body: "Need help with sizing, orders, or returns? Reach our US support team anytime at support@pickitstore.com and we will respond within 4 business hours.",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileCard}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>
            Your Trusted US Destination for Everyday Quality & Fast Delivery
          </Text>
          <View style={styles.badgeRow}>
            <Text style={styles.trustChip}>🇺🇸 US Storefront</Text>
            <Text style={styles.trustChip}>🛡️ Buyer Protected</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Wishlist ({wishlist.length})</Text>
          {wishlist.length === 0 ? (
            <View style={styles.emptyWish}>
              <Text style={styles.emptyWishText}>
                Tap the ❤️ icon on any product to save it here for later.
              </Text>
            </View>
          ) : (
            wishlist.map((item) => (
              <View key={item.id} style={styles.wishCard}>
                <TouchableOpacity
                  style={{ flexDirection: "row", flex: 1, alignItems: "center" }}
                  onPress={() => navigation.navigate("ProductDetail", { product: item })}
                >
                  <Image
                    source={{ uri: item.image || "https://via.placeholder.com/150" }}
                    style={styles.wishImg}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.wishName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.wishPrice}>${item.price.toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.moveBtn}
                  onPress={() => addToCart(item, 1)}
                >
                  <Text style={styles.moveBtnText}>+ Bag</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ paddingLeft: 10 }}
                  onPress={() => toggleWishlist(item)}
                >
                  <Text style={{ fontSize: 15 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Care & Guarantees</Text>
          {policies.map((p) => (
            <TouchableOpacity
              key={p.title}
              style={styles.menuRow}
              onPress={() => setPolicyModal({ title: p.title, body: p.body })}
            >
              <Text style={styles.menuIcon}>{p.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{p.title}</Text>
                <Text style={styles.menuSub}>{p.sub}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footerNote}>PICKIT. Official Mobile App • Powered by Shopify SSL</Text>
      </ScrollView>

      <Modal visible={!!policyModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{policyModal?.title}</Text>
            <Text style={styles.modalBody}>{policyModal?.body}</Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setPolicyModal(null)}
            >
              <Text style={styles.modalCloseText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { padding: 16, paddingBottom: 32 },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 18,
  },
  logo: { width: 150, height: 48, marginBottom: 8 },
  tagline: { fontSize: 13, color: "#4B5563", textAlign: "center", lineHeight: 19, marginBottom: 12 },
  badgeRow: { flexDirection: "row", gap: 8 },
  trustChip: {
    backgroundColor: "#F3F4F6",
    color: "#111827",
    fontSize: 11.5,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 10 },
  emptyWish: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyWishText: { fontSize: 13, color: "#6B7280", textAlign: "center" },
  wishCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  wishImg: { width: 52, height: 52, borderRadius: 8, backgroundColor: "#F3F4F6" },
  wishName: { fontSize: 13.5, fontWeight: "700", color: "#111827" },
  wishPrice: { fontSize: 14, fontWeight: "900", color: "#FF6B00", marginTop: 2 },
  moveBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
  },
  moveBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  menuIcon: { fontSize: 20 },
  menuTitle: { fontSize: 14.5, fontWeight: "800", color: "#111827" },
  menuSub: { fontSize: 12, color: "#6B7280", marginTop: 1 },
  chevron: { fontSize: 22, color: "#9CA3AF" },
  footerNote: { textAlign: "center", fontSize: 11.5, color: "#9CA3AF", marginTop: 8 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.55)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 22 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#111827", marginBottom: 10 },
  modalBody: { fontSize: 14, color: "#4B5563", lineHeight: 21, marginBottom: 18 },
  modalCloseBtn: {
    backgroundColor: "#FF6B00",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
});
