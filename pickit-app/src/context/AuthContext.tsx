import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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

export interface CountryOption {
  code: string;
  name: string;
  dial: string;
  flag: string;
  placeholder: string;
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸", placeholder: "(555) 123-4567" },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳", placeholder: "98765 43210" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦", placeholder: "(416) 555-0199" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧", placeholder: "7700 900077" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺", placeholder: "412 345 678" },
  { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪", placeholder: "50 123 4567" },
  { code: "SA", name: "Saudi Arabia", dial: "+966", flag: "🇸🇦", placeholder: "50 123 4567" },
  { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬", placeholder: "8123 4567" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪", placeholder: "1512 3456789" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷", placeholder: "6 12 34 56 78" },
  { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵", placeholder: "90 1234 5678" },
  { code: "MX", name: "Mexico", dial: "+52", flag: "🇲🇽", placeholder: "55 1234 5678" },
  { code: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷", placeholder: "11 91234 5678" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦", placeholder: "71 123 4567" },
  { code: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿", placeholder: "21 123 4567" },
];

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
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRY_OPTIONS[0]);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpChallengeToken, setOtpChallengeToken] = useState<string | null>(null);
  const [previewOtpBanner, setPreviewOtpBanner] = useState<string | null>(null);

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

  const resetFormAlerts = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setOtpSent(false);
    setOtpCode("");
    setOtpChallengeToken(null);
    setPreviewOtpBanner(null);
  };

  const continueAsGuest = async () => {
    setWelcomeSeen(true);
    setModalVisible(false);
    resetFormAlerts();
    await AsyncStorage.setItem(GUEST_DISMISSED_KEY, "1").catch(() => {});
  };

  const openAuthModal = (defaultTab: AuthMode = "login", onSuccess?: () => void) => {
    setMode(defaultTab);
    resetFormAlerts();
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

  const completeLoginSession = async (data: any, fallbackEmail: string, fallbackPhone: string) => {
    const nextUser: PickitUser = {
      id: data.customer?.id || "",
      firstName: data.customer?.firstName || firstName.trim(),
      lastName: data.customer?.lastName || lastName.trim(),
      email: data.customer?.email || fallbackEmail,
      phone: data.customer?.phone || fallbackPhone,
      accessToken: data.accessToken,
    };

    setUser(nextUser);
    setWelcomeSeen(true);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    await AsyncStorage.setItem(GUEST_DISMISSED_KEY, "1");

    setModalVisible(false);
    setPassword("");
    resetFormAlerts();
    const cb = pendingAction;
    setPendingAction(null);
    if (cb) setTimeout(() => cb(), 120);
  };

  const handleSendOtp = async () => {
    if (!phone.trim() || phone.replace(/\D/g, "").length < 6) {
      setErrorMsg(`Please enter a valid ${selectedCountry.name} phone number.`);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          action: "send_otp",
          dialCode: selectedCountry.dial,
          phone: phone.trim(),
        }),
      });
      const rawText = await res.text();
      const data = JSON.parse(rawText);

      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Could not send OTP code.");
        setLoading(false);
        return;
      }

      setOtpSent(true);
      setOtpChallengeToken(data.challengeToken || null);
      setSuccessMsg(data.message || `6-digit OTP sent to ${selectedCountry.dial} ${phone.trim()}`);
      if (data.previewCode) {
        setPreviewOtpBanner(`Instant Verification Code: ${data.previewCode}`);
        setOtpCode(data.previewCode);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "Unable to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAuth = async () => {
    // Phone OTP verification path
    if (loginMethod === "phone" && mode !== "recover") {
      if (!otpSent) {
        await handleSendOtp();
        return;
      }
      if (!otpCode.trim() || otpCode.trim().length < 4) {
        setErrorMsg("Please enter the 6-digit OTP code.");
        return;
      }
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`${API_BASE}/api/auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            action: "verify_otp",
            dialCode: selectedCountry.dial,
            phone: phone.trim(),
            otpCode: otpCode.trim(),
            otpChallengeToken,
            firstName,
            lastName,
            email: email.trim(),
          }),
        });
        const rawText = await res.text();
        const data = JSON.parse(rawText);
        if (!res.ok || data.error) {
          setErrorMsg(data.error || "Invalid OTP code. Please try again.");
          setLoading(false);
          return;
        }
        await completeLoginSession(
          data,
          email.trim() || `${selectedCountry.dial}${phone.replace(/\D/g, "")}`,
          `${selectedCountry.dial}${phone.replace(/\D/g, "")}`
        );
      } catch (e: any) {
        setErrorMsg(e?.message || "Verification failed. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Email + Password / Forgot Password path
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
          email: email.trim(),
          dialCode: selectedCountry.dial,
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

      await completeLoginSession(
        data,
        email.trim(),
        phone.trim() ? `${selectedCountry.dial}${phone.replace(/\D/g, "")}` : ""
      );
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
              Sign in with Phone OTP or Email to save items to your wishlist, sync your cart, and track orders in real time.
            </Text>
          </View>

          <View style={styles.welcomeBenefits}>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text style={styles.benefitText}>Instant 6-Digit Phone OTP & Email Sign-In</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text style={styles.benefitText}>Free US Tracked Shipping on orders $35+</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text style={styles.benefitText}>30-Day Hassle-Free Buyer Protection</Text>
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
            resetFormAlerts();
          }}
          loginMethod={loginMethod}
          setLoginMethod={(lm) => {
            setLoginMethod(lm);
            resetFormAlerts();
          }}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
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
          otpSent={otpSent}
          otpCode={otpCode}
          setOtpCode={setOtpCode}
          previewOtpBanner={previewOtpBanner}
          onResendOtp={handleSendOtp}
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
          resetFormAlerts();
        }}
        loginMethod={loginMethod}
        setLoginMethod={(lm) => {
          setLoginMethod(lm);
          resetFormAlerts();
        }}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
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
        otpSent={otpSent}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        previewOtpBanner={previewOtpBanner}
        onResendOtp={handleSendOtp}
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
  loginMethod: "phone" | "email";
  setLoginMethod: (m: "phone" | "email") => void;
  selectedCountry: CountryOption;
  setSelectedCountry: (c: CountryOption) => void;
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
  otpSent: boolean;
  otpCode: string;
  setOtpCode: (v: string) => void;
  previewOtpBanner: string | null;
  onResendOtp: () => void;
  loading: boolean;
  errorMsg: string | null;
  successMsg: string | null;
  onSubmit: () => void;
  isActionPrompt?: boolean;
}) {
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);

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
                : props.loginMethod === "phone"
                ? "Select your country code and verify instantly with a 6-digit OTP."
                : "Continue with your email and password."}
            </Text>

            {props.mode !== "recover" && (
              <>
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

                <View style={styles.methodChipRow}>
                  <TouchableOpacity
                    style={[styles.methodChip, props.loginMethod === "phone" && styles.methodChipActive]}
                    onPress={() => props.setLoginMethod("phone")}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={15}
                      color={props.loginMethod === "phone" ? "#FF6B00" : "#6B7280"}
                    />
                    <Text
                      style={[
                        styles.methodChipText,
                        props.loginMethod === "phone" && styles.methodChipTextActive,
                      ]}
                    >
                      Phone + OTP
                    </Text>
                  </TouchableOpacity>
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
                      Email + Password
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
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

            {props.previewOtpBanner && (
              <View style={styles.otpPreviewBox}>
                <Ionicons name="key-outline" size={16} color="#FF6B00" />
                <Text style={styles.otpPreviewText}>{props.previewOtpBanner}</Text>
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

            {/* Phone + Selectable Country Code + 6-Digit OTP Flow */}
            {props.mode !== "recover" && props.loginMethod === "phone" && (
              <>
                <Text style={styles.inputLabel}>Mobile Number ({props.selectedCountry.name})</Text>
                <View style={styles.phoneInputWrap}>
                  <TouchableOpacity
                    style={styles.countryPickerBtn}
                    onPress={() => setCountryPickerOpen(true)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.countryPrefix}>
                      {props.selectedCountry.flag} {props.selectedCountry.dial}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color="#4B5563" />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                    placeholder={props.selectedCountry.placeholder}
                    placeholderTextColor="#9CA3AF"
                    value={props.phone}
                    onChangeText={props.setPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                {props.otpSent && (
                  <>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={styles.inputLabel}>Enter 6-Digit OTP Code</Text>
                      <TouchableOpacity onPress={props.onResendOtp}>
                        <Text style={styles.forgotText}>Resend Code</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={[styles.input, { letterSpacing: 6, fontSize: 18, fontWeight: "800", textAlign: "center" }]}
                      placeholder="••••••"
                      placeholderTextColor="#9CA3AF"
                      value={props.otpCode}
                      onChangeText={props.setOtpCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </>
                )}
              </>
            )}

            {/* Email + Password Flow (or Forgot Password) */}
            {(props.mode === "recover" || props.loginMethod === "email") && (
              <>
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

                {props.mode === "signup" && (
                  <>
                    <Text style={styles.inputLabel}>Mobile Number (Optional)</Text>
                    <View style={styles.phoneInputWrap}>
                      <TouchableOpacity
                        style={styles.countryPickerBtn}
                        onPress={() => setCountryPickerOpen(true)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.countryPrefix}>
                          {props.selectedCountry.flag} {props.selectedCountry.dial}
                        </Text>
                        <Ionicons name="chevron-down" size={14} color="#4B5563" />
                      </TouchableOpacity>
                      <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                        placeholder={props.selectedCountry.placeholder}
                        placeholderTextColor="#9CA3AF"
                        value={props.phone}
                        onChangeText={props.setPhone}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </>
                )}

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
                    : props.loginMethod === "phone"
                    ? props.otpSent
                      ? "Verify OTP & Continue"
                      : "Send 6-Digit OTP"
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

        {/* Country Calling Code Selector Modal */}
        <Modal
          visible={countryPickerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCountryPickerOpen(false)}
        >
          <View style={styles.countryBackdrop}>
            <View style={styles.countryCard}>
              <View style={styles.countryHeader}>
                <Text style={styles.countryHeaderTitle}>Select Country Code</Text>
                <TouchableOpacity onPress={() => setCountryPickerOpen(false)}>
                  <Ionicons name="close" size={22} color="#111827" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={COUNTRY_OPTIONS}
                keyExtractor={(item) => `${item.code}_${item.dial}`}
                renderItem={({ item }) => {
                  const active =
                    item.code === props.selectedCountry.code && item.dial === props.selectedCountry.dial;
                  return (
                    <TouchableOpacity
                      style={[styles.countryRow, active && styles.countryRowActive]}
                      onPress={() => {
                        props.setSelectedCountry(item);
                        setCountryPickerOpen(false);
                      }}
                    >
                      <Text style={styles.countryFlag}>{item.flag}</Text>
                      <Text style={styles.countryName}>{item.name}</Text>
                      <Text style={styles.countryDial}>{item.dial}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </Modal>
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
  methodChipRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
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
  methodChipActive: { borderColor: "#FF6B00", backgroundColor: "#FFF7ED" },
  methodChipText: { fontSize: 12.5, fontWeight: "700", color: "#6B7280" },
  methodChipTextActive: { color: "#FF6B00", fontWeight: "800" },
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
  otpPreviewBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FDBA74",
    padding: 11,
    borderRadius: 10,
    marginBottom: 14,
  },
  otpPreviewText: { flex: 1, fontSize: 13.5, fontWeight: "900", color: "#C2410C" },
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
    paddingLeft: 10,
    marginBottom: 14,
  },
  countryPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 8,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    marginRight: 4,
  },
  countryPrefix: { fontSize: 14, fontWeight: "800", color: "#111827" },
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
  forgotBtn: { alignSelf: "flex-end", paddingVertical: 4, marginBottom: 14 },
  forgotText: { fontSize: 13, fontWeight: "800", color: "#FF6B00" },
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

  countryBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.55)",
    justifyContent: "center",
    padding: 20,
  },
  countryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    maxHeight: "72%",
    paddingVertical: 14,
    overflow: "hidden",
  },
  countryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  countryHeaderTitle: { fontSize: 16.5, fontWeight: "900", color: "#111827" },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
    gap: 10,
  },
  countryRowActive: { backgroundColor: "#FFF7ED" },
  countryFlag: { fontSize: 20 },
  countryName: { flex: 1, fontSize: 14.5, fontWeight: "700", color: "#111827" },
  countryDial: { fontSize: 14, fontWeight: "800", color: "#FF6B00" },
});
