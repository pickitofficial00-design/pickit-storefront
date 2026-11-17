import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Product } from "../services/storeApi";
import { useCart } from "../context/CartContext";

// Session-level memory: stays "Added to Cart" until the app closes or user taps again to remove
const sessionAddedProducts = new Set<string>();

export default function ProductScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const product: Product = route.params?.product;

  const { items, addToCart, removeFromCart, toggleWishlist, isWishlisted } = useCart();
  const [qty, setQty] = useState(1);
  const [isAddedSession, setIsAddedSession] = useState<boolean>(
    () => !!product && (sessionAddedProducts.has(product.id) || items.some((i) => i.product.id === product.id))
  );

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  const saved = isWishlisted(product.id);
  const rating = product.rating && product.rating > 0 ? product.rating.toFixed(1) : "4.8";
  const originalPrice =
    product.discount > 0 ? product.price / (1 - product.discount / 100) : null;

  const handleToggleCart = () => {
    if (isAddedSession) {
      sessionAddedProducts.delete(product.id);
      removeFromCart(product.id);
      setIsAddedSession(false);
    } else {
      sessionAddedProducts.add(product.id);
      addToCart(product, qty);
      setIsAddedSession(true);
    }
  };

  const handleBuyNow = () => {
    if (!isAddedSession) {
      sessionAddedProducts.add(product.id);
      addToCart(product, qty);
      setIsAddedSession(true);
    }
    navigation.navigate("Cart");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image || "https://via.placeholder.com/600x600.png?text=PICKIT" }}
            style={styles.image}
            resizeMode="cover"
          />
          {product.discount > 0 && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleBadgeText}>SAVE {product.discount}% TODAY</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.wishlistBtn, saved && styles.wishlistBtnSaved]}
            onPress={() => toggleWishlist(product)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={saved ? "heart" : "heart-outline"}
              size={23}
              color={saved ? "#EF4444" : "#111827"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.topMetaRow}>
            <View style={styles.brandRow}>
              <Ionicons name="checkmark-circle" size={14} color="#FF6B00" />
              <Text style={styles.brandBadge}>{product.brand || "PICKIT ASSURED"}</Text>
            </View>
            <Text style={styles.stockBadge}>● In Stock • Ready to Ship</Text>
          </View>

          <Text style={styles.title}>{product.name}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.greenRatingPill}>
              <Text style={styles.greenRatingText}>{rating} ★</Text>
            </View>
            <Text style={styles.reviewCount}>Verified US Buyer Rating</Text>
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {originalPrice && (
              <Text style={styles.strikePrice}>${originalPrice.toFixed(2)}</Text>
            )}
            <View style={styles.freeShipTag}>
              <Text style={styles.freeShipText}>
                {product.price >= 35 ? "FREE US SHIPPING" : "FREE SHIPPING $35+"}
              </Text>
            </View>
          </View>

          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Ionicons name="remove" size={18} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.qtyVal}>{qty}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQty((q) => q + 1)}
              >
                <Ionicons name="add" size={18} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.trustGrid}>
            <View style={styles.trustItem}>
              <View style={styles.trustIconBox}>
                <Ionicons name="cube-outline" size={20} color="#FF6B00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.trustTitle}>Fast US Tracked Delivery</Text>
                <Text style={styles.trustSub}>Dispatched within 24–48 hrs with live tracking</Text>
              </View>
            </View>
            <View style={styles.trustItem}>
              <View style={styles.trustIconBox}>
                <Ionicons name="refresh-circle-outline" size={21} color="#FF6B00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.trustTitle}>30-Day Hassle-Free Returns</Text>
                <Text style={styles.trustSub}>Full refund guarantee if you are not 100% satisfied</Text>
              </View>
            </View>
            <View style={styles.trustItem}>
              <View style={styles.trustIconBox}>
                <Ionicons name="lock-closed-outline" size={20} color="#FF6B00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.trustTitle}>256-Bit SSL Encrypted Checkout</Text>
                <Text style={styles.trustSub}>Protected by Shopify Payments, Apple Pay & PayPal</Text>
              </View>
            </View>
          </View>

          <Text style={styles.descHeading}>Product Overview</Text>
          <Text style={styles.descText}>
            {product.description ||
              "Crafted for everyday reliability and inspected for quality before shipping. Backed by PICKIT's 30-day satisfaction guarantee."}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.cartToggleBtn, isAddedSession && styles.addedToggleBtn]}
          onPress={handleToggleCart}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isAddedSession ? "checkmark-circle" : "cart-outline"}
            size={19}
            color="#FFFFFF"
          />
          <Text style={styles.cartToggleText}>
            {isAddedSession ? "Added to Cart" : "Add to Cart"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyNowBtn}
          onPress={handleBuyNow}
          activeOpacity={0.85}
        >
          <Ionicons name="flash" size={18} color="#FFFFFF" />
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { paddingBottom: 24 },
  imageContainer: { width: "100%", height: 340, backgroundColor: "#FFFFFF", position: "relative" },
  image: { width: "100%", height: "100%" },
  saleBadge: {
    position: "absolute",
    bottom: 14,
    left: 14,
    backgroundColor: "#059669",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  saleBadgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  wishlistBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  wishlistBtnSaved: {
    backgroundColor: "#FFF1F2",
    borderColor: "#FECDD3",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    padding: 20,
  },
  topMetaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  brandBadge: { fontSize: 11, fontWeight: "800", color: "#FF6B00", textTransform: "uppercase" },
  stockBadge: { fontSize: 12, fontWeight: "700", color: "#059669" },
  title: { fontSize: 21, fontWeight: "900", color: "#111827", lineHeight: 27, marginBottom: 8 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 },
  greenRatingPill: { backgroundColor: "#15803D", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  greenRatingText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  reviewCount: { fontSize: 12.5, color: "#6B7280", fontWeight: "600" },
  priceBox: { flexDirection: "row", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 },
  price: { fontSize: 28, fontWeight: "900", color: "#111827" },
  strikePrice: { fontSize: 17, color: "#9CA3AF", textDecorationLine: "line-through", fontWeight: "600" },
  freeShipTag: { backgroundColor: "#ECFDF5", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 },
  freeShipText: { color: "#059669", fontSize: 11, fontWeight: "800" },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 18,
  },
  qtyLabel: { fontSize: 15, fontWeight: "700", color: "#111827" },
  stepper: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 10 },
  stepBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  qtyVal: { fontSize: 16, fontWeight: "800", color: "#111827", paddingHorizontal: 14 },
  trustGrid: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  trustIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },
  trustTitle: { fontSize: 13, fontWeight: "800", color: "#111827" },
  trustSub: { fontSize: 12, color: "#6B7280", marginTop: 1 },
  descHeading: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 8 },
  descText: { fontSize: 14, color: "#4B5563", lineHeight: 22 },
  bottomBar: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 10,
  },
  cartToggleBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#111827",
    borderRadius: 14,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  addedToggleBtn: {
    backgroundColor: "#059669",
  },
  cartToggleText: { color: "#FFFFFF", fontSize: 14.5, fontWeight: "900" },
  buyNowBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#FF6B00",
    borderRadius: 14,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  buyNowText: { color: "#FFFFFF", fontSize: 14.5, fontWeight: "900" },
});
