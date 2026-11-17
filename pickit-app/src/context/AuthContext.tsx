import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "https://pickit-storefront.vercel.app";
const USER_KEY = "@pickit_user_session_v1";
const GUEST_DISMISSED_KEY = "@pickit_welcome_seen_v1";

export interface PickitUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  accessToken: string;
}

type AuthMode = "login" | "signup" | "recover";

interface AuthContextType {
  user: PickitUser | null;
  isGuest: boolean;
  ready: boolean;
  openAuthModal: (defaultTab?: AuthMode, onSuccess?: () => void) => void;
  requireAuth: (actionCallback: () => void, defaultTab?: AuthMode) => boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isGuest: true,
  ready: false,
  openAuthModal: () => {},
  requireAuth: () => false,
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PickitUser | null>(null);
  const [welcomeSeen, setWelcomeSeen] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [savedUser, seen] = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(GUEST_DISMISSED_KEY),
        ]);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setWelcomeSeen(true);
        } else if (seen === "1") {
          setWelcomeSeen(true);
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  const continueAsGuest = async () => {
    setWelcomeSeen(true);
    setModalVisible(false);
    setErrorMsg(null);
    setSuccessMsg(null);
    await AsyncStorage.setItem(GUEST_DISMISSED_KEY, "1").catch(() => {});
  };

  const openAuthModal = (defaultTab: AuthMode = "login", onSuccess?: () => void) => {
    setMode(defaultTab);
    setErrorMsg(null);
    setSuccessMsg(null);
    setPendingAction(() => onSuccess || null);
    setModalVisible(true);
  };

  const requireAuth = (actionCallback: () => void, defaultTab: AuthMode = "login"): boolean => {
    if (user) {
      actionCallback();
      return true;
    }
    openAuthModal(defaultTab, actionCallback);
    return false;
  };

  const handleSubmitAuth = async () => {
    if (mode === "login" && loginMethod === "phone" && !phone.trim()) {
      setErrorMsg("Please enter your phone number.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (mode !== "recover" && !password) {
      setErrorMsg("Please enter your password.");
      return;
    }
    if (mode === "signup" && password.length < 5) {
      setErrorMsg("Password must be at least 5 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          action: mode,
          loginMethod,
          email: email.trim(),
          phone: phone.trim(),
          password,
          firstName,
          lastName,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        setErrorMsg(`Server returned HTTP ${res.status}. Please try again in a moment.`);
        setLoading(false);
        return;
      }

      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Unable to complete request. Please check your details.");
        setLoading(false);
        return;
      }

      if (mode === "recover") {
        setSuccessMsg(data.message || "Password reset email sent! Check your inbox.");
        setLoading(false);
        return;
      }

      const nextUser: PickitUser = {
        id: data.customer?.id || "",
        firstName: data.customer?.firstName || firstName.trim(),
        lastName: data.customer?.lastName || lastName.trim(),
        email: data.customer?.email || email.trim(),
        phone: data.customer?.phone || phone.trim(),
        accessToken: data.accessToken,
      };

      setUser(nextUser);
      setWelcomeSeen(true);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      await AsyncStorage.setItem(GUEST_DISMISSED_KEY, "1");

      setModalVisible(false);
      setPassword("");
      const cb = pendingAction;
      setPendingAction(null);
      if (cb) setTimeout(() => cb(), 120);
    } catch (e: any) {
      setErrorMsg(e?.message || "Could not reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const performSignOut = async () => {
    setUser(null);
    setWelcomeSeen(false);
    await AsyncStorage.removeItem(USER_KEY).catch(() => {});
    await AsyncStorage.removeItem(GUEST_DISMISSED_KEY).catch(() => {});
  };

  const signOut = () => {
    Alert.alert(
      "Sign Out of PICKIT?",
      "Are you sure you want to sign out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            performSignOut();
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (!ready) {
    return (
      <View style={styles.splashCenter}>
        <Text style={styles.wordmark}>
          <Text style={styles.wordmarkPick}>PICK</Text>
          <Text style={styles.wordmarkIt}>IT.</Text>
        </Text>
        <ActivityIndicator color="#FF6B00" style={{ marginTop: 14 }} />
      </View>
    );
  }

  if (!user && !welcomeSeen) {
    return (
      <SafeAreaView style={styles.welcomeContainer} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.welcomeScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.welcomeHero}>
            <View style={styles.logoBadge}>
              <Ionicons name="bag-handle" size={28} color="#FF6B00" />
            </View>
            <Text style={styles.wordmarkLarge}>
              <Text style={styles.wordmarkPick}>PICK</Text>
              <Text style={styles.wordmarkIt}>IT.</Text>
            </Text>
            <Text style={styles.welcomeTitle}>Smart Everyday Essentials, Delivered Fast</Text>
            <Text style={styles.welcomeSub}>
              Sign in or create a free PICKIT account to save items to your wishlist, sync your cart, and track US orders in real time.
            </Text>
          </View>

          <View style={styles.welcomeBenefits}>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text style={styles.benefitText}>Free US Tracked Shipping on orders $35+</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text style={styles.benefitText}>30-Day Hassle-Free Buyer Protection</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text style={styles.benefitText}>Instant Order Tracking & Express Checkout</Text>
            </View>
          </View>

          <View style={styles.welcomeActions}>
            <TouchableOpacity
              style={styles.primaryCtaBtn}
              onPress={() => openAuthModal("signup")}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryCtaText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryCtaBtn}
              onPress={() => openAuthModal("login")}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryCtaText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestBtn}
              onPress={continueAsGuest}
              activeOpacity={0.75}
            >
              <Text style={styles.guestBtnText}>Continue as Guest →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <AuthSheetModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          mode={mode}
          setMode={(m) => {
            setMode(m);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          loginMethod={loginMethod}
          setLoginMethod={(lm) => {
            setLoginMethod(lm);
            setErrorMsg(null);
          }}
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          password={password}
          setPassword={setPassword}
          showPass={showPass}
          setShowPass={setShowPass}
          loading={loading}
          errorMsg={errorMsg}
          successMsg={successMsg}
          onSubmit={handleSubmitAuth}
        />
      </SafeAreaView>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest: !user,
        ready,
        openAuthModal,
        requireAuth,
        signOut,
      }}
    >
      {children}
      <AuthSheetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        mode={mode}
        setMode={(m) => {
          setMode(m);
          setErrorMsg(null);
          setSuccessMsg(null);
        }}
        loginMethod={loginMethod}
        setLoginMethod={(lm) => {
          setLoginMethod(lm);
          setErrorMsg(null);
        }}
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        email={email}
        setEmail={setEmail}
        phone={phone}
        setPhone={setPhone}
        password={password}
        setPassword={setPassword}
        showPass={showPass}
        setShowPass={setShowPass}
        loading={loading}
        errorMsg={errorMsg}
        successMsg={successMsg}
        onSubmit={handleSubmitAuth}
        isActionPrompt={!!pendingAction}
      />
    </AuthContext.Provider>
  );
}

function AuthSheetModal(props: {
  visible: boolean;
  onClose: () => void;
  mode: AuthMode;
  setMode: (m: AuthMode) => void;
  loginMethod: "email" | "phone";
  setLoginMethod: (m: "email" | "phone") => void;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPass: boolean;
  setShowPass: (v: boolean) => void;
  loading: boolean;
  errorMsg: string | null;
  successMsg: string | null;
  onSubmit: () => void;
  isActionPrompt?: boolean;
}) {
  return (
    <Modal visible={props.visible} animationType="slide" statusBarTranslucent onRequestClose={props.onClose}>
      <SafeAreaView style={styles.modalSafe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={props.onClose} style={styles.closeIconBtn}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.wordmarkSmall}>
              <Text style={styles.wordmarkPick}>PICK</Text>
              <Text style={styles.wordmarkIt}>IT.</Text>
            </Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            {props.isActionPrompt && props.mode !== "recover" && (
              <View style={styles.actionNotice}>
                <Ionicons name="lock-closed" size={15} color="#FF6B00" />
                <Text style={styles.actionNoticeText}>
                  Sign in or create a free account to save items, add to cart, or checkout.
                </Text>
              </View>
            )}

            <Text style={styles.formHeading}>
              {props.mode === "recover"
                ? "Reset Your Password"
                : props.mode === "login"
                ? "Welcome Back"
                : "Create Your PICKIT Account"}
            </Text>
            <Text style={styles.formSub}>
              {props.mode === "recover"
                ? "Enter the email associated with your PICKIT account and we will send you a password reset link."
                : props.mode === "login"
                ? "Sign in with your email or phone number."
                : "Join PICKIT for fast US checkout, wishlists, and live order tracking."}
            </Text>

            {props.mode !== "recover" && (
              <View style={styles.segmentWrap}>
                <TouchableOpacity
                  style={[styles.segmentBtn, props.mode === "login" && styles.segmentBtnActive]}
                  onPress={() => props.setMode("login")}
                >
                  <Text style={[styles.segmentText, props.mode === "login" && styles.segmentTextActive]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentBtn, props.mode === "signup" && styles.segmentBtnActive]}
                  onPress={() => props.setMode("signup")}
                >
                  <Text style={[styles.segmentText, props.mode === "signup" && styles.segmentTextActive]}>
                    Create Account
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {props.mode === "login" && (
              <View style={styles.methodChipRow}>
                <TouchableOpacity
                  style={[styles.methodChip, props.loginMethod === "email" && styles.methodChipActive]}
                  onPress={() => props.setLoginMethod("email")}
                >
                  <Ionicons
                    name="mail-outline"
                    size={15}
                    color={props.loginMethod === "email" ? "#FF6B00" : "#6B7280"}
                  />
                  <Text
                    style={[
                      styles.methodChipText,
                      props.loginMethod === "email" && styles.methodChipTextActive,
                    ]}
                  >
                    Email Login
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.methodChip, props.loginMethod === "phone" && styles.methodChipActive]}
                  onPress={() => props.setLoginMethod("phone")}
                >
                  <Ionicons
                    name="call-outline"
                    size={15}
                    color={props.loginMethod === "phone" ? "#FF6B00" : "#6B7280"}
                  />
                  <Text
                    style={[
                      styles.methodChipText,
                      props.loginMethod === "phone" && styles.methodChipTextActive,
                    ]}
                  >
                    Phone Number
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {props.errorMsg && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorBannerText}>{props.errorMsg}</Text>
              </View>
            )}

            {props.successMsg && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text style={styles.successBannerText}>{props.successMsg}</Text>
              </View>
            )}

            {props.mode === "signup" && (
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Alex"
                    placeholderTextColor="#9CA3AF"
                    value={props.firstName}
                    onChangeText={props.setFirstName}
                    autoCapitalize="words"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Morgan"
                    placeholderTextColor="#9CA3AF"
                    value={props.lastName}
                    onChangeText={props.setLastName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            {(props.mode === "signup" || (props.mode === "login" && props.loginMethod === "phone")) && (
              <>
                <Text style={styles.inputLabel}>
                  US Phone Number {props.mode === "signup" ? "(Optional)" : ""}
                </Text>
                <View style={styles.phoneInputWrap}>
                  <Text style={styles.countryPrefix}>🇺🇸 +1</Text>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                    placeholder="(555) 123-4567"
                    placeholderTextColor="#9CA3AF"
                    value={props.phone}
                    onChangeText={props.setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            )}

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={props.email}
              onChangeText={props.setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {props.mode !== "recover" && (
              <>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                    placeholder={
                      props.mode === "signup"
                        ? "Create a password (min 5 chars)"
                        : "Enter your password"
                    }
                    placeholderTextColor="#9CA3AF"
                    value={props.password}
                    onChangeText={props.setPassword}
                    secureTextEntry={!props.showPass}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => props.setShowPass(!props.showPass)}
                    style={{ paddingHorizontal: 12 }}
                  >
                    <Ionicons
                      name={props.showPass ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>

                {props.mode === "login" && (
                  <TouchableOpacity
                    onPress={() => props.setMode("recover")}
                    style={styles.forgotBtn}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, props.loading && { opacity: 0.7 }]}
              onPress={props.onSubmit}
              disabled={props.loading}
              activeOpacity={0.85}
            >
              {props.loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {props.mode === "recover"
                    ? "Send Reset Link"
                    : props.mode === "login"
                    ? "Sign In"
                    : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>

            {props.mode === "recover" && (
              <TouchableOpacity
                onPress={() => props.setMode("login")}
                style={{ alignItems: "center", marginTop: 14 }}
              >
                <Text style={{ fontSize: 13.5, fontWeight: "800", color: "#111827" }}>
                  ← Back to Sign In
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.legalNote}>
              Protected by 256-bit SSL encryption • Shopify Customer Accounts
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

export const useAuth = () => useContext(AuthContext);

const styles = StyleSheet.create({
  splashCenter: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" },
  wordmark: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  wordmarkLarge: { fontSize: 38, fontWeight: "900", letterSpacing: -1.2, marginBottom: 10 },
  wordmarkSmall: { fontSize: 22, fontWeight: "900", letterSpacing: -0.6 },
  wordmarkPick: { color: "#111827" },
  wordmarkIt: { color: "#FF6B00" },

  welcomeContainer: { flex: 1, backgroundColor: "#FFFFFF" },
  welcomeScroll: { flexGrow: 1, justifyContent: "space-between", padding: 24 },
  welcomeHero: { alignItems: "center", marginTop: 24 },
  logoBadge: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  welcomeTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 10,
  },
  welcomeSub: { fontSize: 14.5, color: "#4B5563", textAlign: "center", lineHeight: 21 },
  welcomeBenefits: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginVertical: 22,
  },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  benefitText: { fontSize: 13.5, fontWeight: "700", color: "#1F2937", flex: 1 },
  welcomeActions: { gap: 12, marginBottom: 8 },
  primaryCtaBtn: {
    backgroundColor: "#FF6B00",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryCtaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  secondaryCtaBtn: {
    backgroundColor: "#111827",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryCtaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  guestBtn: { height: 44, alignItems: "center", justifyContent: "center" },
  guestBtnText: { color: "#4B5563", fontSize: 14.5, fontWeight: "800" },

  modalSafe: { flex: 1, backgroundColor: "#FFFFFF" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  closeIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  modalScroll: { padding: 22 },
  actionNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  actionNoticeText: { flex: 1, fontSize: 12.5, fontWeight: "700", color: "#9A3412", lineHeight: 18 },
  formHeading: { fontSize: 24, fontWeight: "900", color: "#111827", marginBottom: 6 },
  formSub: { fontSize: 14, color: "#6B7280", lineHeight: 20, marginBottom: 18 },
  segmentWrap: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" },
  segmentBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  segmentText: { fontSize: 13.5, fontWeight: "700", color: "#6B7280" },
  segmentTextActive: { color: "#111827", fontWeight: "900" },
  methodChipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  methodChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  methodChipActive: {
    borderColor: "#FF6B00",
    backgroundColor: "#FFF7ED",
  },
  methodChipText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#6B7280",
  },
  methodChipTextActive: {
    color: "#FF6B00",
    fontWeight: "800",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 11,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorBannerText: { flex: 1, fontSize: 13, fontWeight: "700", color: "#DC2626" },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    padding: 11,
    borderRadius: 10,
    marginBottom: 14,
  },
  successBannerText: { flex: 1, fontSize: 13, fontWeight: "700", color: "#059669" },
  inputLabel: { fontSize: 13, fontWeight: "800", color: "#374151", marginBottom: 6 },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: "#111827",
    marginBottom: 14,
  },
  phoneInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    height: 48,
    paddingLeft: 12,
    marginBottom: 14,
  },
  countryPrefix: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    marginRight: 4,
  },
  passRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    height: 48,
    marginBottom: 8,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    paddingVertical: 4,
    marginBottom: 14,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FF6B00",
  },
  submitBtn: {
    backgroundColor: "#FF6B00",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  submitBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  legalNote: { textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 16 },
});
