import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchProductByHandle, Product, ProductVariant } from "../services/storeApi";
import { useCart } from "../context/CartContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const sessionAddedProducts = new Set<string>();

function cleanStandardUsTitle(raw: string): string {
  if (!raw) return "PICKIT Verified Essential";
  let clean = raw
    .replace(/\b(202[0-9]\s*)+/g, "")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (clean.length > 82) {
    const cut = clean.slice(0, 82);
    const lastSpace = cut.lastIndexOf(" ");
    clean = (lastSpace > 48 ? cut.slice(0, lastSpace) : cut).replace(/[,\-\/|]+$/, "").trim();
  }
  return clean;
}

function parseDescriptionDetails(html?: string, plain?: string) {
  const sourceHtml = html || "";
  const listMatches = [...sourceHtml.matchAll(/<li[^>]*>(.*?)<\/li>/gis)].map((m) =>
    m[1].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim()
  ).filter(Boolean);

  const stripped = (sourceHtml || plain || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const lines = stripped
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  const specPairs: { label: string; value: string }[] = [];
  const paragraphs: string[] = [];

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 1 && colonIdx < 36 && line.length < 160) {
      const label = line.slice(0, colonIdx).replace(/^[•\-*\s]+/, "").trim();
      const value = line.slice(colonIdx + 1).trim();
      if (label && value) {
        specPairs.push({ label, value });
        continue;
      }
    }
    paragraphs.push(line);
  }

  const highlights =
    listMatches.length > 0
      ? listMatches.slice(0, 8)
      : specPairs.slice(0, 5).map((s) => `${s.label}: ${s.value}`);

  return {
    highlights,
    specPairs,
    fullBody: paragraphs.join("\n\n") || stripped,
  };
}

export default function ProductScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const initialProduct: Product = route.params?.product;
  const [product, setProduct] = useState<Product>(initialProduct);

  const { items, addToCart, removeFromCart, toggleWishlist, isWishlisted } = useCart();

  const variants: ProductVariant[] = useMemo(() => {
    if (product?.variants && product.variants.length > 0) return product.variants;
    return product
      ? [
          {
            id: product.variantId || product.id,
            title: "Default Title",
            price: product.price,
            availableForSale: product.inStock,
            image: product.image,
            selectedOptions: [],
          },
        ]
      : [];
  }, [product]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    () => variants[0] || null
  );

  useEffect(() => {
    if (!initialProduct?.handle) return;
    fetchProductByHandle(initialProduct.handle).then((fresh) => {
      if (fresh && fresh.id) {
        setProduct((prev) => ({ ...prev, ...fresh }));
        if (fresh.variants && fresh.variants.length > 0) {
          setSelectedVariant(fresh.variants[0]);
        }
      }
    });
  }, [initialProduct?.handle]);

  const galleryImages: string[] = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if (product.images && product.images.length > 0) {
      for (const u of product.images) {
        if (u && !list.includes(u)) list.push(u);
      }
    }
    if (product.image && !list.includes(product.image)) {
      list.unshift(product.image);
    }
    for (const v of variants) {
      if (v.image && !list.includes(v.image)) {
        list.push(v.image);
      }
    }
    return list.length > 0 ? list : ["https://via.placeholder.com/600x600.png?text=PICKIT"];
  }, [product, variants]);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const galleryRef = useRef<FlatList<string>>(null);
  const [qty, setQty] = useState(1);

  const activeVariantId = selectedVariant?.id || product?.variantId || product?.id || "";
  const activeKey = `${product?.id}_${activeVariantId}`;

  const [isAddedSession, setIsAddedSession] = useState<boolean>(
    () =>
      !!product &&
      (sessionAddedProducts.has(activeKey) ||
        items.some((i) => i.product.id === product.id && i.product.variantId === activeVariantId))
  );

  const parsedDetails = useMemo(
    () => parseDescriptionDetails(product?.descriptionHtml, product?.description),
    [product?.descriptionHtml, product?.description]
  );

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  const displayTitle = cleanStandardUsTitle(product.name);
  const saved = isWishlisted(product.id);
  const rating = product.rating && product.rating > 0 ? product.rating.toFixed(1) : "4.8";
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const originalPrice =
    selectedVariant?.compareAtPrice && selectedVariant.compareAtPrice > displayPrice
      ? selectedVariant.compareAtPrice
      : product.discount > 0
      ? displayPrice / (1 - product.discount / 100)
      : null;

  const hasRealVariants =
    variants.length > 1 ||
    (variants.length === 1 && variants[0].title !== "Default Title");

  const selectPhotoIndex = (idx: number) => {
    setActivePhotoIndex(idx);
    galleryRef.current?.scrollToIndex({ index: idx, animated: true });
  };

  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    const nextKey = `${product.id}_${variant.id}`;
    setIsAddedSession(
      sessionAddedProducts.has(nextKey) ||
        items.some((i) => i.product.id === product.id && i.product.variantId === variant.id)
    );
    if (variant.image) {
      const imgIdx = galleryImages.findIndex((u) => u === variant.image);
      if (imgIdx >= 0) {
        selectPhotoIndex(imgIdx);
      }
    }
  };

  const buildVariantProduct = (): Product => ({
    ...product,
    price: displayPrice,
    variantId: selectedVariant?.id || product.variantId,
    image: selectedVariant?.image || galleryImages[activePhotoIndex] || product.image,
    name:
      selectedVariant && selectedVariant.title !== "Default Title"
        ? `${displayTitle} (${selectedVariant.title})`
        : displayTitle,
  });

  const handleToggleCart = () => {
    const key = `${product.id}_${activeVariantId}`;
    if (isAddedSession) {
      sessionAddedProducts.delete(key);
      removeFromCart(product.id);
      setIsAddedSession(false);
    } else {
      sessionAddedProducts.add(key);
      addToCart(buildVariantProduct(), qty);
      setIsAddedSession(true);
    }
  };

  const handleBuyNow = () => {
    const key = `${product.id}_${activeVariantId}`;
    if (!isAddedSession) {
      sessionAddedProducts.add(key);
      addToCart(buildVariantProduct(), qty);
      setIsAddedSession(true);
    }
    navigation.navigate("Cart");
  };

  const baseSpecs: { label: string; value: string }[] = [
    { label: "Brand", value: product.brand && product.brand !== "Unbranded" ? product.brand : "PICKIT" },
    { label: "Department", value: product.category || "Electronics & Essentials" },
    ...(hasRealVariants && selectedVariant
      ? [{ label: "Selected Option", value: selectedVariant.title }]
      : []),
    ...(selectedVariant?.sku ? [{ label: "Model / SKU", value: selectedVariant.sku }] : []),
    {
      label: "Availability",
      value: selectedVariant?.availableForSale === false ? "Out of Stock" : "In Stock — Ships from US",
    },
    { label: "Warranty & Returns", value: "30-Day PICKIT Buyer Protection" },
  ];

  const allSpecRows = [...baseSpecs, ...parsedDetails.specPairs];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={true}>
        {/* Multi-Photo Swipeable Image Gallery */}
        <View style={styles.imageContainer}>
          <FlatList
            ref={galleryRef}
            data={galleryImages}
            keyExtractor={(uri, idx) => `${uri}_${idx}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              if (idx >= 0 && idx < galleryImages.length) {
                setActivePhotoIndex(idx);
              }
            }}
            renderItem={({ item: uri }) => (
              <Image source={{ uri }} style={styles.image} resizeMode="contain" />
            )}
          />

          {galleryImages.length > 1 && (
            <View style={styles.photoCounterPill}>
              <Text style={styles.photoCounterText}>
                {activePhotoIndex + 1} / {galleryImages.length}
              </Text>
            </View>
          )}

          {product.discount > 0 && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleBadgeText}>SAVE {product.discount}%</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.wishlistBtn, saved && styles.wishlistBtnSaved]}
            onPress={() => toggleWishlist(product)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={saved ? "heart" : "heart-outline"}
              size={22}
              color={saved ? "#EF4444" : "#111827"}
            />
          </TouchableOpacity>
        </View>

        {/* Thumbnail Strip */}
        {galleryImages.length > 1 && (
          <View style={styles.thumbStripWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbStrip}
            >
              {galleryImages.map((uri, idx) => {
                const active = idx === activePhotoIndex;
                return (
                  <TouchableOpacity
                    key={`${uri}_thumb_${idx}`}
                    onPress={() => selectPhotoIndex(idx)}
                    style={[styles.thumbBox, active && styles.thumbBoxActive]}
                  >
                    <Image source={{ uri }} style={styles.thumbImg} resizeMode="cover" />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Primary Buy Box Card */}
        <View style={styles.infoCard}>
          <View style={styles.topMetaRow}>
            <View style={styles.brandRow}>
              <Ionicons name="checkmark-circle" size={14} color="#FF6B00" />
              <Text style={styles.brandBadge}>
                {product.brand && product.brand !== "Unbranded" ? product.brand : "PICKIT ASSURED"}
              </Text>
            </View>
            <Text style={styles.stockBadge}>
              {selectedVariant?.availableForSale === false
                ? "● Out of Stock"
                : "● In Stock • Ships Fast"}
            </Text>
          </View>

          <Text style={styles.title}>{displayTitle}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.greenRatingPill}>
              <Text style={styles.greenRatingText}>{rating} ★</Text>
            </View>
            <Text style={styles.reviewCount}>Verified US Customer Rating</Text>
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.price}>${displayPrice.toFixed(2)}</Text>
            {originalPrice && (
              <Text style={styles.strikePrice}>${originalPrice.toFixed(2)}</Text>
            )}
            <View style={styles.freeShipTag}>
              <Text style={styles.freeShipText}>
                {displayPrice >= 35 ? "FREE US SHIPPING" : "FREE SHIPPING $35+"}
              </Text>
            </View>
          </View>

          {/* Interactive Variant Selector */}
          {hasRealVariants && (
            <View style={styles.variantSection}>
              <Text style={styles.variantHeading}>
                Select Option:{" "}
                <Text style={styles.variantSelectedLabel}>
                  {selectedVariant?.title}
                </Text>
              </Text>
              <View style={styles.variantGrid}>
                {variants.map((v) => {
                  const selected = selectedVariant?.id === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      onPress={() => handleSelectVariant(v)}
                      activeOpacity={0.85}
                      style={[
                        styles.variantPill,
                        selected && styles.variantPillActive,
                        !v.availableForSale && styles.variantPillDisabled,
                      ]}
                    >
                      {v.image && (
                        <Image
                          source={{ uri: v.image }}
                          style={styles.variantPillThumb}
                        />
                      )}
                      <View>
                        <Text
                          style={[
                            styles.variantPillText,
                            selected && styles.variantPillTextActive,
                          ]}
                        >
                          {v.title}
                        </Text>
                        <Text
                          style={[
                            styles.variantPillPrice,
                            selected && styles.variantPillPriceActive,
                          ]}
                        >
                          ${v.price.toFixed(2)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Quantity Stepper */}
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

          {/* US Trust & Guarantee Strip */}
          <View style={styles.trustGrid}>
            <View style={styles.trustItem}>
              <View style={styles.trustIconBox}>
                <Ionicons name="cube-outline" size={20} color="#FF6B00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.trustTitle}>Fast US Tracked Delivery</Text>
                <Text style={styles.trustSub}>Dispatched within 24–48 hrs with live USPS/UPS tracking</Text>
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
        </View>

        {/* SCROLL DOWN SECTION 1: Key Highlights */}
        {parsedDetails.highlights.length > 0 && (
          <View style={styles.detailSectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="sparkles-outline" size={18} color="#FF6B00" />
              <Text style={styles.sectionHeading}>Key Highlights</Text>
            </View>
            <View style={styles.bulletList}>
              {parsedDetails.highlights.map((bullet, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SCROLL DOWN SECTION 2: Product Specifications Table */}
        <View style={styles.detailSectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="list-outline" size={19} color="#FF6B00" />
            <Text style={styles.sectionHeading}>Product Specifications</Text>
          </View>
          <View style={styles.specTable}>
            {allSpecRows.map((row, idx) => (
              <View
                key={`${row.label}_${idx}`}
                style={[
                  styles.specRow,
                  idx % 2 === 0 ? styles.specRowEven : styles.specRowOdd,
                  idx === allSpecRows.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Text style={styles.specLabel}>{row.label}</Text>
                <Text style={styles.specValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* SCROLL DOWN SECTION 3: Full Product Description & Details */}
        <View style={styles.detailSectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="document-text-outline" size={18} color="#FF6B00" />
            <Text style={styles.sectionHeading}>Full Product Details</Text>
          </View>
          <Text style={styles.descText}>
            {parsedDetails.fullBody ||
              product.description ||
              "Engineered for everyday reliability and inspected for quality prior to US dispatch. Includes PICKIT's 30-day satisfaction and return guarantee."}
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
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
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { paddingBottom: 32 },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 330,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  image: { width: SCREEN_WIDTH, height: 330 },
  photoCounterPill: {
    position: "absolute",
    bottom: 14,
    right: 14,
    backgroundColor: "rgba(17, 24, 39, 0.78)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  photoCounterText: { color: "#FFFFFF", fontSize: 11.5, fontWeight: "800" },
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
  thumbStripWrap: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  thumbStrip: { paddingHorizontal: 16, gap: 8 },
  thumbBox: {
    width: 54,
    height: 54,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
  },
  thumbBoxActive: { borderColor: "#FF6B00", borderWidth: 2 },
  thumbImg: { width: "100%", height: "100%" },

  infoCard: {
    backgroundColor: "#FFFFFF",
    marginTop: 8,
    padding: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  topMetaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  brandBadge: { fontSize: 11, fontWeight: "800", color: "#FF6B00", textTransform: "uppercase" },
  stockBadge: { fontSize: 12, fontWeight: "700", color: "#059669" },
  title: { fontSize: 19.5, fontWeight: "800", color: "#111827", lineHeight: 26, marginBottom: 8 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 },
  greenRatingPill: { backgroundColor: "#15803D", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  greenRatingText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  reviewCount: { fontSize: 12.5, color: "#6B7280", fontWeight: "600" },
  priceBox: { flexDirection: "row", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 },
  price: { fontSize: 27, fontWeight: "900", color: "#111827" },
  strikePrice: { fontSize: 17, color: "#9CA3AF", textDecorationLine: "line-through", fontWeight: "600" },
  freeShipTag: { backgroundColor: "#ECFDF5", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 },
  freeShipText: { color: "#059669", fontSize: 11, fontWeight: "800" },

  variantSection: { paddingVertical: 14, borderTopWidth: 1, borderColor: "#F3F4F6" },
  variantHeading: { fontSize: 13.5, fontWeight: "700", color: "#4B5563", marginBottom: 10 },
  variantSelectedLabel: { color: "#111827", fontWeight: "900" },
  variantGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  variantPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  variantPillActive: { borderColor: "#FF6B00", backgroundColor: "#FFF7ED" },
  variantPillDisabled: { opacity: 0.45 },
  variantPillThumb: { width: 28, height: 28, borderRadius: 6, backgroundColor: "#FFFFFF" },
  variantPillText: { fontSize: 12.5, fontWeight: "800", color: "#111827" },
  variantPillTextActive: { color: "#FF6B00" },
  variantPillPrice: { fontSize: 11, fontWeight: "600", color: "#6B7280" },
  variantPillPriceActive: { color: "#111827", fontWeight: "700" },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 16,
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

  /* Scroll-Down Specification & Detail Cards */
  detailSectionCard: {
    backgroundColor: "#FFFFFF",
    marginTop: 10,
    padding: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16.5,
    fontWeight: "900",
    color: "#111827",
  },
  bulletList: { gap: 9 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF6B00",
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 13.5,
    color: "#374151",
    lineHeight: 20,
    fontWeight: "500",
  },
  specTable: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
  },
  specRow: {
    flexDirection: "row",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  specRowEven: { backgroundColor: "#F8FAFC" },
  specRowOdd: { backgroundColor: "#FFFFFF" },
  specLabel: {
    width: "38%",
    fontSize: 12.5,
    fontWeight: "700",
    color: "#4B5563",
    paddingRight: 8,
  },
  specValue: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 18,
  },
  descText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
  },

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
  addedToggleBtn: { backgroundColor: "#059669" },
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
