import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../context/CartContext";
import { createCheckoutUrl } from "../services/storeApi";

const FREE_SHIPPING_THRESHOLD = 50;

export default function CartScreen() {
  const navigation = useNavigation<any>();
  const { items, subtotal, totalCount, updateQuantity, removeFromCart } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 5.99;
  const orderTotal = subtotal + shippingCost;

  const handleCheckout = async () => {
    const validItems = items
      .filter((i) => i.product.variantId)
      .map((i) => ({ variantId: i.product.variantId as string, quantity: i.quantity }));

    if (validItems.length === 0) {
      Alert.alert("Checkout Notice", "These items cannot be checked out online right now.");
      return;
    }

    try {
      setCheckingOut(true);
      const url = await createCheckoutUrl(validItems);
      await Linking.openURL(url);
    } catch (err: any) {
      Alert.alert(
        "Secure Checkout",
        err?.message || "Unable to open Shopify checkout right now. Please try again."
      );
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Bag ({totalCount})</Text>
        <Text style={styles.headerSecure}>🔒 256-Bit SSL Encrypted</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🛍️</Text>
          <Text style={styles.emptyTitle}>Your PICKIT bag is empty</Text>
          <Text style={styles.emptySub}>
            Explore verified products with fast US shipping and 30-day returns.
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.shipCard}>
            <Text style={styles.shipText}>
              {remaining === 0
                ? "🎉 Congrats! You unlocked FREE US Standard Shipping!"
                : `Add $${remaining.toFixed(2)} more to unlock FREE US Shipping!`}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item) => item.product.id}
            contentContainerStyle={{ padding: 14, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                <Image
                  source={{ uri: item.product.image || "https://via.placeholder.com/200" }}
                  style={styles.itemImg}
                />
                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </Text>
                  <View style={styles.controlsRow}>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Text style={styles.stepText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Text style={styles.stepText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => removeFromCart(item.product.id)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          <View style={styles.footer}>
            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>Subtotal</Text>
              <Text style={styles.sumVal}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>Estimated US Shipping</Text>
              <Text style={[styles.sumVal, shippingCost === 0 && { color: "#059669" }]}>
                {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
              </Text>
            </View>
            <View style={[styles.sumRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Estimated Total (USD)</Text>
              <Text style={styles.totalVal}>${orderTotal.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.checkoutText}>🔒 Proceed to Secure Checkout</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.paymentBadges}>
              Shop Pay  •  Apple Pay  •  Google Pay  •  Visa  •  Mastercard  •  PayPal
            </Text>
          </View>
        </>
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#111827" },
  headerSecure: { fontSize: 11.5, fontWeight: "700", color: "#059669" },
  shipCard: {
    backgroundColor: "#111827",
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
  },
  shipText: { color: "#FFFFFF", fontSize: 12.5, fontWeight: "700", marginBottom: 8 },
  progressTrack: { height: 6, backgroundColor: "#374151", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#FF6B00", borderRadius: 999 },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  itemImg: { width: 78, height: 78, borderRadius: 10, backgroundColor: "#F3F4F6" },
  itemBody: { flex: 1, marginLeft: 12, justifyContent: "space-between" },
  itemTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  itemPrice: { fontSize: 16, fontWeight: "900", color: "#111827", marginVertical: 4 },
  controlsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepper: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 8 },
  stepBtn: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  stepText: { fontSize: 17, fontWeight: "700", color: "#111827" },
  qtyText: { fontSize: 13, fontWeight: "800", paddingHorizontal: 10 },
  removeText: { fontSize: 12, color: "#DC2626", fontWeight: "700" },
  footer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  sumRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  sumLabel: { fontSize: 13.5, color: "#6B7280", fontWeight: "600" },
  sumVal: { fontSize: 13.5, color: "#111827", fontWeight: "700" },
  totalRow: { borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 8, marginTop: 4, marginBottom: 12 },
  totalLabel: { fontSize: 15, fontWeight: "800", color: "#111827" },
  totalVal: { fontSize: 18, fontWeight: "900", color: "#111827" },
  checkoutBtn: {
    backgroundColor: "#FF6B00",
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutText: { color: "#FFFFFF", fontSize: 15.5, fontWeight: "900" },
  paymentBadges: { textAlign: "center", fontSize: 11, color: "#6B7280", marginTop: 10, fontWeight: "600" },
  emptyBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 28 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 19, fontWeight: "900", color: "#111827", marginBottom: 6 },
  emptySub: { fontSize: 13.5, color: "#6B7280", textAlign: "center", lineHeight: 20, marginBottom: 20 },
  shopBtn: { backgroundColor: "#111827", paddingHorizontal: 24, paddingVertical: 13, borderRadius: 12 },
  shopBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
});
