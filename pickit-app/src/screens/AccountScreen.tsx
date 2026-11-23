import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
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
import { Product } from "../services/storeApi";

export default function AccountScreen() {
  const navigation = useNavigation<any>();
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const { user, openAuthModal, signOut } = useAuth();
  const [policyModal, setPolicyModal] = useState<{ title: string; body: string } | null>(null);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const handleQuickAdd = (item: Product) => {
    addToCart(item, 1);
    setAddedMap((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }, 3000);
  };

  const policies: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    sub: string;
    body: string;
  }[] = [
    {
      icon: "cube-outline",
      title: "Track Your Order",
      sub: "Real-time USPS, UPS & FedEx tracking",
      body: "Once your PICKIT order ships (typically within 24–48 business hours), you will receive an automated email and SMS with your live USPS/UPS/FedEx tracking link.",
    },
    {
      icon: "car-outline",
      title: "US Shipping Policy",
      sub: "Free standard shipping on orders $35+",
      body: "All orders over $35 qualify for FREE Tracked Shipping (2–5 business days). Orders under $35 ship at a flat $5.99 tracked rate across all 50 US states.",
    },
    {
      icon: "refresh-circle-outline",
      title: "7-Day Return Guarantee",
      sub: "Easy, no-questions-asked returns",
      body: "Not 100% thrilled with your purchase? Return any unused item within 7 days of delivery for a full refund to your original payment method.",
    },
    {
      icon: "chatbubble-ellipses-outline",
      title: "US Customer Support",
      sub: "Fast response • Mon–Sat, 9am–6pm EST",
      body: "Need help with sizing, orders, or returns? Reach our US support team anytime at support@pickitstore.com and we will respond within 4 business hours.",
    },
  ];

  const renderWishGridItem = ({ item }: { item: Product }) => {
    const isAdded = !!addedMap[item.id];
    const rating = item.rating && item.rating > 0 ? item.rating.toFixed(1) : "4.8";

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => {
          setWishlistOpen(false);
          navigation.navigate("ProductDetail", { product: item });
        }}
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
            style={styles.heartBtnSaved}
            onPress={(e) => {
              e.stopPropagation?.();
              toggleWishlist(item);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="heart" size={16} color="#EF4444" />
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
              <Text style={styles.addBtnText}>{isAdded ? "Added" : "Add"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={{ backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#111827" }}>My Account</Text>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 28 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#FFF7ED", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Ionicons name="person-outline" size={34} color="#FF6B00" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#111827", marginBottom: 8, textAlign: "center" }}>
            Sign in to manage your account
          </Text>
          <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 20, marginBottom: 22 }}>
            Sign in or create a free PICKIT account to access your profile, saved wishlist, and order tracking.
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

  const fullName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim() : "";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileCard}>
          {user ? (
            <>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {(fullName || user.email || "P").charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.memberName}>{fullName || "PICKIT Member"}</Text>
              <Text style={styles.memberEmail}>{user.email}</Text>
              {user.phone ? <Text style={[styles.memberEmail, { marginTop: -8 }]}>{user.phone}</Text> : null}
              <TouchableOpacity
                style={styles.signOutBtn}
                onPress={signOut}
                activeOpacity={0.85}
              >
                <Ionicons name="log-out-outline" size={16} color="#111827" />
                <Text style={styles.signOutBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.wordmark}>
                <Text style={styles.wordmarkPick}>PICK</Text>
                <Text style={styles.wordmarkIt}>IT.</Text>
              </Text>
              <Text style={styles.tagline}>
                Sign in or create an account to save your wishlist, sync your cart, and track orders.
              </Text>
              <View style={{ flexDirection: "row", gap: 10, width: "100%", marginBottom: 12 }}>
                <TouchableOpacity
                  style={styles.signInBtn}
                  onPress={() => openAuthModal("login")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.signInBtnText}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.signUpBtn}
                  onPress={() => openAuthModal("signup")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.signUpBtnText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={styles.badgeRow}>
            <View style={styles.trustChip}>
              <Ionicons name="checkmark-circle" size={14} color="#FF6B00" />
              <Text style={styles.trustChipText}>US Storefront</Text>
            </View>
            <View style={styles.trustChip}>
              <Ionicons name="shield-checkmark" size={14} color="#059669" />
              <Text style={styles.trustChipText}>Buyer Protected</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate("Orders")}
            activeOpacity={0.85}
          >
            <Ionicons name="cube-outline" size={20} color="#FF6B00" />
            <Text style={styles.quickActionText}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => setWishlistOpen(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="heart-outline" size={20} color="#FF6B00" />
            <Text style={styles.quickActionText}>Your Wishlist</Text>
            {wishlist.length > 0 && (
              <View style={styles.wishCountBadge}>
                <Text style={styles.wishCountText}>{wishlist.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Care & Guarantees</Text>
          {policies.map((p) => (
            <TouchableOpacity
              key={p.title}
              style={styles.menuRow}
              onPress={() => setPolicyModal({ title: p.title, body: p.body })}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name={p.icon} size={20} color="#FF6B00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{p.title}</Text>
                <Text style={styles.menuSub}>{p.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={19} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footerNote}>PICKIT. Official Mobile App • Powered by Shopify SSL</Text>
      </ScrollView>

      <Modal
        visible={wishlistOpen}
        animationType="slide"
        onRequestClose={() => setWishlistOpen(false)}
      >
        <SafeAreaView style={styles.wishModalContainer} edges={["top", "bottom"]}>
          <View style={styles.wishModalHeader}>
            <TouchableOpacity
              style={styles.wishBackBtn}
              onPress={() => setWishlistOpen(false)}
            >
              <Ionicons name="arrow-back" size={20} color="#111827" />
              <Text style={styles.wishBackText}>Account</Text>
            </TouchableOpacity>
            <Text style={styles.wishModalTitle}>Your Wishlist</Text>
            <View style={{ width: 70 }} />
          </View>

          {wishlist.length === 0 ? (
            <View style={styles.emptyWishBox}>
              <View style={styles.emptyHeartCircle}>
                <Ionicons name="heart-outline" size={34} color="#FF6B00" />
              </View>
              <Text style={styles.emptyWishTitle}>Your wishlist is empty</Text>
              <Text style={styles.emptyWishSub}>
                Tap the heart icon on any product while browsing to save it to your wishlist.
              </Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => {
                  setWishlistOpen(false);
                  navigation.navigate("Home");
                }}
              >
                <Text style={styles.browseBtnText}>Explore Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={wishlist}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={{ paddingTop: 14, paddingBottom: 30 }}
              renderItem={renderWishGridItem}
            />
          )}
        </SafeAreaView>
      </Modal>

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
    marginBottom: 14,
  },
  avatarCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FF6B00",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarInitial: { color: "#FFFFFF", fontSize: 26, fontWeight: "900" },
  memberName: { fontSize: 19, fontWeight: "900", color: "#111827" },
  memberEmail: { fontSize: 13.5, color: "#6B7280", marginTop: 2, marginBottom: 12 },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  signOutBtnText: { fontSize: 13, fontWeight: "800", color: "#111827" },
  signInBtn: {
    flex: 1,
    backgroundColor: "#111827",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  signInBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  signUpBtn: {
    flex: 1,
    backgroundColor: "#FF6B00",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  signUpBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  wordmark: { fontSize: 28, fontWeight: "900", letterSpacing: -0.8, marginBottom: 6 },
  wordmarkPick: { color: "#111827" },
  wordmarkIt: { color: "#FF6B00" },
  tagline: { fontSize: 13, color: "#4B5563", textAlign: "center", lineHeight: 19, marginBottom: 14 },
  badgeRow: { flexDirection: "row", gap: 8 },
  trustChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  trustChipText: { color: "#111827", fontSize: 11.5, fontWeight: "700" },
  quickActionRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  quickActionCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickActionText: { fontSize: 14, fontWeight: "800", color: "#111827" },
  wishCountBadge: { backgroundColor: "#FF6B00", borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  wishCountText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 10 },
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
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: { fontSize: 14.5, fontWeight: "800", color: "#111827" },
  menuSub: { fontSize: 12, color: "#6B7280", marginTop: 1 },
  footerNote: { textAlign: "center", fontSize: 11.5, color: "#9CA3AF", marginTop: 8 },
  wishModalContainer: { flex: 1, backgroundColor: "#F1F5F9" },
  wishModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  wishBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  wishBackText: { fontSize: 12.5, fontWeight: "800", color: "#111827" },
  wishModalTitle: { fontSize: 17, fontWeight: "900", color: "#111827" },
  emptyWishBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 28 },
  emptyHeartCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyWishTitle: { fontSize: 18, fontWeight: "900", color: "#111827", marginBottom: 6 },
  emptyWishSub: { fontSize: 13.5, color: "#6B7280", textAlign: "center", lineHeight: 20, marginBottom: 20 },
  browseBtn: { backgroundColor: "#111827", paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999 },
  browseBtnText: { color: "#FFFFFF", fontSize: 13.5, fontWeight: "800" },
  gridRow: { paddingHorizontal: 12, justifyContent: "space-between", marginBottom: 10 },
  card: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  imageWrap: { width: "100%", height: 155, backgroundColor: "#F8FAFC", position: "relative" },
  productImage: { width: "100%", height: "100%" },
  discountBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "#059669", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5 },
  discountText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  heartBtnSaved: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { padding: 10 },
  assuredRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 3 },
  brandText: { fontSize: 10, fontWeight: "800", color: "#6B7280", textTransform: "uppercase", flex: 1 },
  assuredPill: { flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: "#FFF7ED", paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  assuredText: { fontSize: 9.5, fontWeight: "800", color: "#FF6B00" },
  productName: { fontSize: 13.5, fontWeight: "700", color: "#111827", lineHeight: 18, minHeight: 36 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 6, marginBottom: 8, gap: 6 },
  greenRatingBadge: { backgroundColor: "#15803D", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  greenRatingText: { color: "#FFFFFF", fontSize: 10.5, fontWeight: "800" },
  deliveryTag: { fontSize: 11, color: "#374151", fontWeight: "700" },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 },
  priceText: { fontSize: 15, fontWeight: "900", color: "#111827" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#111827", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8 },
  addBtnSuccess: { backgroundColor: "#059669" },
  addBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(17,24,39,0.55)", justifyContent: "center", padding: 24 },
  modalCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 22 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#111827", marginBottom: 10 },
  modalBody: { fontSize: 14, color: "#4B5563", lineHeight: 21, marginBottom: 18 },
  modalCloseBtn: { backgroundColor: "#FF6B00", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  modalCloseText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
});
