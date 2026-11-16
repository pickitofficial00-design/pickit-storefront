import React from "react";
import { Text, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CartProvider, useCart } from "./src/context/CartContext";
import HomeScreen from "./src/screens/HomeScreen";
import CategoriesScreen from "./src/screens/CategoriesScreen";
import ProductScreen from "./src/screens/ProductScreen";
import CartScreen from "./src/screens/CartScreen";
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

function MainTabs() {
  const { totalCount, wishlist } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF6B00",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarStyle: {
          height: Platform.OS === "ios" ? 84 : 64,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 6,
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          borderTopWidth: 1,
          elevation: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Shop",
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.65 }}>🛍️</Text>,
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarLabel: "Browse",
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.65 }}>🧭</Text>,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: "Bag",
          tabBarBadge: totalCount > 0 ? totalCount : undefined,
          tabBarBadgeStyle: { backgroundColor: "#FF6B00", color: "#FFFFFF", fontWeight: "800", fontSize: 11 },
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.65 }}>🛒</Text>,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: "Account",
          tabBarBadge: wishlist.length > 0 ? wishlist.length : undefined,
          tabBarBadgeStyle: { backgroundColor: "#111827", color: "#FFFFFF", fontSize: 10 },
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.65 }}>👤</Text>,
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
