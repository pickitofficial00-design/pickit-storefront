import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/navigation";
import { WebView } from "react-native-webview";
import { useCart } from "../context/CartContext";
import { createCheckoutUrl } from "../services/storeApi";

const FREE_SHIPPING_THRESHOLD = 50;

export default function CartScreen() {
  const navigation = useNavigation<any>();
  const { items, subtotal, totalCount, updateQuantity, removeFromCart } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [orderCompleted, setOrderCompleted] = useState(false);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 5.99;
  const orderTotal = subtotal + shippingCost;

  const handleCheckout = async () => {
    const validItems = items
      .filter((i) => i.product.variantId)
      .map((i) => ({variantId: a.product.variantId as string, quantity: i.quantity}));

    if (validItems.length === 0) {
      Alert.alert("Checkout Notice", "These items cannot be checked out online right now.");
      return;
    }

    try {
      setCheckingOut(true);
      setOrderCompleted(false);
      const url = await createCheckoutUrl(validItems);
      setCheckoutUrl(url);
    } catch (err: any) {
      Alert.alert(
        "Secure Checkout",
        err?.message || "Unable to open Shopify checkout right now. Please try again."
      );
    } finally {
      setCheckingOut(false);
    }
  };

  const handleCloseCheckout = () => {
    if (orderCompleted) {
      items.forEach((item) => removeFromCart(item.product.id));
      setOrderCompleted(false);
    }
    setCheckoutUrl(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Bag ({totalCount})</Text>
        <Text style={styles.headerSecure}>üîí 256-Bit SSL Encrypted</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>üõç</Text>
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
                ? "üéâ Congrats! You unlocked FREE US Standard Shipping!"
                : `Add $${remaining.toFixed(2)} more to unlock FREE US Shipping!`}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress%%` }]} />
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
                        <Text style={styles.stepText}>‚àí</Text>
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
              <Text style={[styles.sumVal, shippingCost === 0 && { color#¢"3Sìccí"’◊”‡¢∑6ÜóñÊt6˜7B””“Ú$e$TR"¢G≤G∑6ÜóñÊt6˜7BÁFÙfóÜVBÉ"ó÷–¢¬ıFWáC‡¢¬ıfñWs‡¢≈fñWr7Gñ∆S◊µ∑7Gñ∆W2Á7V’&˜r¬7Gñ∆W2ÁF˜F≈&˜u◊”‡¢≈FWáB7Gñ∆S◊∑7Gñ∆W2ÁF˜Fƒ∆&V«”‰W7Fñ÷FVBF˜F¬ÖU4Bì¬ıFWáC‡¢≈FWáB7Gñ∆S◊∑7Gñ∆W2ÁF˜F≈f«”‚G∂˜&FW%F˜F¬ÁFÙfóÜVBÉ"ó”¬ıFWáC‡¢¬ıfñWs‡†¢≈F˜V6Ü&∆T˜6óGê¢7Gñ∆S◊∑7Gñ∆W2Ê6ÜV6∂˜WD'FÁ–¢ˆÂ&W73◊∂ÜÊF∆T6ÜV6∂˜WG–¢Fó6&∆VC◊∂6ÜV6∂ñÊt˜WG–¢‡¢∂6ÜV6∂ñÊt˜WBÚÄ¢ƒ7FófóGîñÊFñ6F˜"6ˆ∆˜#“"4dddddb"Û‡¢í¢Ä¢≈FWáB7Gñ∆S◊∑7Gñ∆W2Ê6ÜV6∂˜WEFWáG”Ô	˘I"&ˆ6VVBFÚ6V7W&R6ÜV6∂˜WC¬ıFWáC‡¢ó–¢¬ıF˜V6Ü&∆T˜6óGì‡†¢≈FWáB7Gñ∆S◊∑7Gñ∆W2Áñ÷VÁD&FvW7”‡¢6Ü˜í(
"∆Rí(
"vˆˆv∆Rí(
"fó6(
"÷7FW&6&B(
"ï¿¢¬ıFWáC‡¢¬ıfñWs‡¢¬Û‡¢ó–†¢ƒ÷ˆF¿¢fó6ñ&∆S◊≤6ÜV6∂˜WEW&«–¢Êñ÷FñˆÂGóS“'6∆ñFR ¢ˆÂ&WVW7D6∆˜6S◊∂ÜÊF∆T6∆˜6T6ÜV6∂˜WG–¢‡¢≈6fT&VfñWr7Gñ∆S◊∑7Gñ∆W2Ê÷ˆFƒ6ˆÁFñÊW'“VFvW3◊µ≤'F˜"¬&&˜GFˆ“%◊”‡¢≈fñWr7Gñ∆S◊∑7Gñ∆W2Ê÷ˆFƒÜVFW'”‡¢≈F˜V6Ü&∆T˜6óGíˆÂ&W73◊∂ÜÊF∆T6∆˜6T6ÜV6∂˜WG“7Gñ∆S◊∑7Gñ∆W2Ê6∆˜6T'FÁ”‡¢≈FWáB7Gñ∆S◊∑7Gñ∆W2Ê6∆˜6T'FÂFWáG”‡¢∂˜&FW$6ˆ◊∆WFVBÚ,©¬FˆÊR"¢,©¬6∆˜6R'–¢¬ıFWáC‡¢¬ıF˜V6Ü&∆T˜6óGì‡¢≈FWáB7Gñ∆S◊∑7Gñ∆W2Ê÷ˆF≈FóF∆W”Âî4¥ïB6V7W&R6ÜV6∂˜WC¬ıFWáC‡¢≈FWáB7Gñ∆S◊∑7Gñ∆W2Ê÷ˆF≈76«”Ô	˘I"54√¬ıFWáC‡¢¬ıfñWs‡†¢∂6ÜV6∂˜WEW&¬bbÄ¢≈vV%fñWp¢6˜W&6S◊∑≤W&ì¢6ÜV6∂˜WEW&¬◊–¢7F'Dñ‰∆ˆFñÊu7FFP¢¶f67&óDVÊ&∆V@¢Fˆ’7F˜&vTVÊ&∆V@¢6Ü&VD6ˆˆ∂ñW4VÊ&∆V@¢FÜó&E'Gî6ˆˆ∂ñW4VÊ&∆V@¢&VÊFW$∆ˆFñÊs◊≤Çí”‚Ä¢≈fñWr7Gñ∆S◊∑7Gñ∆W2ÁvV'fñWt∆ˆFW'”‡¢ƒ7FófóGîñÊFñ6F˜"6ó¶S“&∆&vR"6ˆ∆˜#“"4dcd#"Û‡¢≈FWáB7Gñ∆S◊∑7Gñ∆W2Ê∆ˆFW%FWáG”‰∆ˆFñÊr6V7W&R6ÜV6∂˜WB‚‚„¬ıFWáC‡¢¬ıfñWs‡¢ó–¢ˆÂ6Ü˜V∆E7F'D∆ˆEvóFÖ&WVW7C◊≤á&WVW7Bí”‚∞¢6ˆÁ7B≤W&¬““&WVW7C∞¢ñbÄ¢W&¬Á7F'G5vóFÇÇ&áGG¢ÚÚ"íb`¢W&¬Á7F'G5vóFÇÇ&áGG3¢ÚÚ"íb`¢W&¬Á7F'G5vóFÇÇ&&˜WC¢"ê¢í∞¢∆ñÊ∂ñÊrÊ˜VÂU$¬áW&¬íÊ6F6ÇÇÇí”‚∑“ì∞¢&WGW&‚f«6S∞¢–¢&WGW&‚G'VS∞¢◊–¢ˆ‰ÊfñvFñˆÂ7FFT6ÜÊvS◊≤ÜÊe7FFRí”‚∞¢ñbÄ¢Êe7FFRÁW&¬ÊñÊ6«VFW2Ç"˜FÜÊµ˜ñ˜R"í«¿¢Êe7FFRÁW&¬ÊñÊ6«VFW2Ç"ˆ˜&FW'2Ú"ê¢í∞¢6WD˜&FW$6ˆ◊∆WFVBáG'VRì∞¢–¢◊–¢Û‡¢ó–¢¬ı6fT&VfñWs‡¢¬Ù÷ˆF√‡¢¬ı6fT&VfñWs‡¢ì∞ß–†¶6ˆÁ7B7Gñ∆W2“7Gñ∆U6ÜVWBÊ7&VFRá∞¢6ˆÁFñÊW#¢≤f∆WÉ¢¬&6∂w&˜VÊD6ˆ∆˜#¢"4cÑdd2"“¿¢ÜVFW#¢∞¢&6∂w&˜VÊD6ˆ∆˜#¢"4dddddb"¿¢FFñÊtÜ˜&ó¶ˆÁF√¢b¿¢FFñÊufW'Fñ6√¢B¿¢&˜&FW$&˜GFˆ’vñGFÉ¢¿¢&˜&FW$&˜GFˆ‘6ˆ∆˜#¢"4STStT""¿¢f∆WÑFó&V7Fñˆ„¢'&˜r"¿¢ßW7Fñgî6ˆÁFVÁC¢'76R÷&WGvVV‚"¿¢∆ñv‰óFV◊3¢&6VÁFW""¿¢“¿¢ÜVFW%FóF∆S¢≤fˆÁE6ó¶S¢#¬fˆÁEvVñváC¢#ì"¬6ˆ∆˜#¢"3É#r"“¿¢ÜVFW%6V7W&S¢≤fˆÁE6ó¶S¢„R¬fˆÁEvVñváC¢#s"¬6ˆ∆˜#¢"3Sìccí"“¿¢6Üó6&C¢∞¢&6∂w&˜VÊD6ˆ∆˜#¢"3É#r"¿¢÷&vñ‰Ü˜&ó¶ˆÁF√¢B¿¢÷&vñÂF˜¢"¿¢&˜&FW%&FóW3¢"¿¢FFñÊs¢"¿¢“¿¢6ÜóFWáC¢≤6ˆ∆˜#¢"4dddddb"¬fˆÁE6ó¶S¢"„R¬fˆÁEvVñváC¢#s"¬÷&vñ‰&˜GFˆ”¢Ç“¿¢&ˆw&W75G&6≥¢≤ÜVñváC¢b¬&6∂w&˜VÊD6ˆ∆˜#¢"33sCS"¬&˜&FW%&FóW3¢ììí¬˜fW&f∆˜s¢&ÜñFFV‚"“¿¢&ˆw&W74fñ∆√¢≤ÜVñváC¢#R"¬&6∂w&˜VÊD6ˆ∆˜#¢"4dcd#"¬&˜&FW%&FóW3¢ììí“¿¢óFV‘6&C¢∞¢f∆WÑFó&V7Fñˆ„¢'&˜r"¿¢&6∂w&˜VÊD6ˆ∆˜#¢"4dddddb"¿¢&˜&FW%&FóW3¢B¿¢FFñÊs¢"¿¢÷&vñ‰&˜GFˆ”¢¿¢&˜&FW%vñGFÉ¢¿¢&˜&FW$6ˆ∆˜#¢"4STStT""¿¢“¿¢óFV‘ñ÷s¢≤vñGFÉ¢sÇ¬ÜVñváC¢sÇ¬&˜&FW%&FóW3¢¬&6∂w&˜VÊD6ˆ∆˜#¢"4c4cDcb"“¿¢óFV‘&ˆGì¢≤f∆WÉ¢¬÷&vñ‰∆VgC¢"¬ßW7Fñgî6ˆÁFVÁC¢'76R÷&WGvVV‚"“¿¢óFV’FóF∆S¢≤fˆÁE6ó¶S¢B¬fˆÁEvVñváC¢#s"¬6ˆ∆˜#¢"3É#r"“¿¢óFV’&ñ6S¢≤fˆÁE6ó¶S¢b¬fˆÁEvVñváC¢#ì"¬6ˆ∆˜#¢"3É#r"¬÷&vñÂfW'Fñ6√¢B“¿¢6ˆÁG&ˆ«5&˜s¢≤f∆WÑFó&V7Fñˆ„¢'&˜r"¬∆ñv‰óFV◊3¢&6VÁFW""¬ßW7Fñgî6ˆÁFVÁC¢'76R÷&WGvVV‚"“¿¢7FWW#¢≤f∆WÑFó&V7Fñˆ„¢'&˜r"¬∆ñv‰óFV◊3¢&6VÁFW""¬&6∂w&˜VÊD6ˆ∆˜#¢"4c4cDcb"¬&˜&FW%&FóW3¢Ç“¿¢7FW'F„¢≤vñGFÉ¢3¬ÜVñváC¢3¬∆ñv‰óFV◊3¢&6VÁFW""¬ßW7Fñgî6ˆÁFVÁC¢&6VÁFW""“¿¢7FWFWáC¢≤fˆÁE6ó¶S¢r¬fˆÁEvVñváC¢#s"¬6ˆ∆˜#¢"3É#r"“¿¢GïFWáC¢≤fˆÁE6ó¶S¢2¬fˆÁEvVñváC¢#É"¬FFñÊtÜ˜&ó¶ˆÁF√¢“¿¢&V÷˜fUFWáC¢≤fˆÁE6ó¶S¢"¬6ˆ∆˜#¢"4D3#c#b"¬fˆÁEvVñváC¢#s"“¿¢fˆ˜FW#¢∞¢&6∂w&˜VÊD6ˆ∆˜#¢"4dddddb"¿¢FFñÊs¢b¿¢&˜&FW%F˜vñGFÉ¢¿¢&˜&FW%F˜6ˆ∆˜#¢"4STStT""¿¢“¿¢7V’&˜s¢≤f∆WÑFó&V7Fñˆ„¢'&˜r"¬ßW7Fñgî6ˆÁFVÁC¢'76R÷&WGvVV‚"¬÷&vñ‰&˜GFˆ”¢b“¿¢7V‘∆&V√¢≤fˆÁE6ó¶S¢2„R¬6ˆ∆˜#¢"3d#s#É"¬fˆÁEvVñváC¢#c"“¿¢7V’f√¢≤fˆÁE6ó¶S¢2„R¬6ˆ∆˜#¢"3É#r"¬fˆÁEvVñváC¢#s"“¿¢F˜F≈&˜s¢≤&˜&FW%F˜vñGFÉ¢¬&˜&FW%F˜6ˆ∆˜#¢"4c4cDcb"¬FFñÊuF˜¢Ç¬÷&vñÂF˜¢B¬÷&vñ‰&˜GFˆ”¢"“¿¢F˜Fƒ∆&V√¢≤fˆÁE6ó¶S¢R¬fˆÁEvVñváC¢#É"¬6ˆ∆˜#¢"3É#r"“¿¢F˜F≈f√¢≤fˆÁE6ó¶S¢Ç¬fˆÁEvVñváC¢#ì"¬6ˆ∆˜#¢"3É#r"“¿¢6ÜV6∂˜WD'F„¢∞¢&6∂w&˜VÊD6ˆ∆˜#¢"4dcd#"¿¢ÜVñváC¢S¿¢&˜&FW%&FóW3¢B¿¢∆ñv‰óFV◊3¢&6VÁFW""¿¢ßW7Fñgî6ˆÁFVÁC¢&6VÁFW""¿¢“¿¢6ÜV6∂˜WEFWáC¢≤6ˆ∆˜#¢"4dddddb"¬fˆÁE6ó¶S¢R„R¬fˆÁEvVñváC¢#ì"“¿¢ñ÷VÁD&FvW3¢≤FWáD∆ñv„¢&6VÁFW""¬fˆÁE6ó¶S¢¬6ˆ∆˜#¢"3d#s#É"¬÷&vñÂF˜¢¬fˆÁEvVñváC¢#c"“¿¢V◊Gî&˜É¢≤f∆WÉ¢¬ßW7Fñgî6ˆÁFVÁC¢&6VÁFW""¬∆ñv‰óFV◊3¢&6VÁFW""¬FFñÊs¢#Ç“¿¢V◊Gîñ6ˆ„¢≤fˆÁE6ó¶S¢CÇ¬÷&vñ‰&˜GFˆ”¢"“¿¢V◊GïFóF∆S¢≤fˆÁE6ó¶S¢í¬fˆÁEvVñváC¢#ì"¬6ˆ∆˜#¢"3É#r"¬÷&vñ‰&˜GFˆ”¢b“¿¢V◊Gï7V#¢≤fˆÁE6ó¶S¢2„R¬6ˆ∆˜#¢"3d#s#É"¬FWáD∆ñv„¢&6VÁFW""¬∆ñÊTÜVñváC¢#¬÷&vñ‰&˜GFˆ”¢#“¿¢6Ü˜'F„¢≤&6∂w&˜VÊD6ˆ∆˜#¢"3É#r"¬FFñÊtÜ˜&ó¶ˆÁF√¢#B¬FFñÊufW'Fñ6√¢2¬&˜&FW%&FóW3¢"“¿¢6Ü˜'FÂFWáC¢≤6ˆ∆˜#¢"4dddddb"¬fˆÁEvVñváC¢#É"¬fˆÁE6ó¶S¢B“¿¢÷ˆFƒ6ˆÁFñÊW#¢≤f∆WÉ¢¬&6∂w&˜VÊD6ˆ∆˜#¢"3"“¿¢÷ˆFƒÜVFW#¢∞¢f∆WÑFó&V7Fñˆ„¢'&˜r"¿¢∆ñv‰óFV◊3¢&6VÁFW""¿¢ßW7Fñgî6ˆÁFVÁC¢'76R÷&WGvVV‚"¿¢FFñÊtÜ˜&ó¶ˆÁF√¢b¿¢FFñÊufW'Fñ6√¢"¿¢&6∂w&˜VÊD6ˆ∆˜#¢"3"¿¢&˜&FW$&˜GFˆ’vñGFÉ¢¿¢&˜&FW$&˜GFˆ‘6ˆ∆˜#¢"3#c#c#b"¿¢“¿¢6∆˜6T'F„¢≤FFñÊufW'Fñ6√¢B¬FFñÊu&ñváC¢“¿¢6∆˜6T'FÂFWáC¢≤6ˆ∆˜#¢"4dcd#"¬fˆÁE6ó¶S¢R¬fˆÁEvVñváC¢#É"“¿¢÷ˆF≈FóF∆S¢≤6ˆ∆˜#¢"4dddddb"¬fˆÁE6ó¶S¢R¬fˆÁEvVñváC¢#É"“¿¢÷ˆF≈76√¢≤6ˆ∆˜#¢"3#ìÉ"¬fˆÁE6ó¶S¢"¬fˆÁEvVñváC¢#s"“¿¢vV'fñWt∆ˆFW#¢∞¢˜6óFñˆ„¢&'6ˆ«WFR"¿¢F˜¢¿¢∆VgC¢¿¢&ñváC¢¿¢&˜GFˆ”¢¿¢&6∂w&˜VÊD6ˆ∆˜#¢"4dddddb"¿¢∆ñv‰óFV◊3¢&6VÁFW""¿¢ßW7Fñgî6ˆÁFVÁC¢&6VÁFW""¿¢“¿¢∆ˆFW%FWáC¢≤÷&vñÂF˜¢"¬fˆÁE6ó¶S¢B¬fˆÁEvVñváC¢#c"¬6ˆ∆˜#¢"3É#r"“¿ß“ì∞