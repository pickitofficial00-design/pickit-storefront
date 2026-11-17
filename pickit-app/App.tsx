import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { CartProvider, useCart } from "./src/context/CartContext";
import HomeScreen from "./src/screens/HomeScreen";
import CategoriesScreen from "./src/screens/CategoriesScreen";
import ProductScreen from "./src/screens/ProductScreen";
import CartScreen from "./src/screens/CartScreen";
import OrdersScreen from "./src/screens/OrdersScreen";
import AccountScreen from "./src/screens/AccountScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const PickitTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#F8FAFC",
    card: "#FFFFFF",
    text: "#111827",
    border: "#E5E7EB",
    primary: "#FF6B00",
  },
};

function TabIconPill({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

function MainTabs() {
  const { orders, wishlist } = useCart();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF6B00",
        tabBarInactiveTintColor: "#64748B",
        tabBarIconStyle: {
          width: 48,
          height: 32,
          marginTop: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800",
          marginTop: 2,
        },
        tabBarStyle: {
          height: 62 + bottomPad,
          paddingBottom: bottomPad,
          paddingTop: 6,
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E2E8F0",
          borderTopWidth: 1,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 14,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Shop",
          tabBarIcon: ({ color, focused }) => (
            <TabIconPill
              name={focused ? "storefront" : "storefront-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarLabel: "Browse",
          tabBarIcon: ({ color, focused }) => (
            <TabIconPill
              name={focused ? "grid" : "grid-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: "Orders",
          tabBarBadge: orders.length > 0 ? orders.length : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#059669",
            color: "#FFFFFF",
            fontWeight: "800",
            fontSize: 10,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabIconPill
              name={focused ? "cube" : "cube-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: "Account",
          tabBarBadge: wishlist.length > 0 ? wishlist.length : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#111827",
            color: "#FFFFFF",
            fontSize: 10,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabIconPill
              name={focused ? "person-circle" : "person-circle-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <CartProvider>
        <NavigationContainer theme={PickitTheme}>
          <Stack.Navigator>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductScreen}
              options={{
                title: "Product Details",
                headerTintColor: "#111827",
                headerStyle: { backgroundColor: "#FFFFFF" },
                headerTitleStyle: { fontWeight: "800", fontSize: 16 },
                headerShadowVisible: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  iconPill: {
    width: 46,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPillActive: {
    backgroundColor: "#FFF7ED",
  },
});
