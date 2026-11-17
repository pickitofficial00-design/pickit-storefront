import React from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
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

function RetailTabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={styles.tabItemBox}>
      <View style={[styles.topActiveLine, focused && styles.topActiveLineVisible]} />
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

function MainTabs() {
  const { orders } = useCart();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 6);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF6B00",
        tabBarInactiveTintColor: "#1F2937",
        tabBarIconStyle: {
          width: 56,
          height: 28,
          marginTop: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.1,
          marginBottom: 2,
        },
        tabBarStyle: {
          height: 56 + bottomPad,
          paddingBottom: bottomPad,
          paddingTop: 0,
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, focused }) => (
            <RetailTabIcon
              name={focused ? "home" : "home-outline"}
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
          tabBarLabel: "Categories",
          tabBarIcon: ({ color, focused }) => (
            <RetailTabIcon
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
            backgroundColor: "#FF6B00",
            color: "#FFFFFF",
            fontWeight: "800",
            fontSize: 10,
            top: 2,
          },
          tabBarIcon: ({ color, focused }) => (
            <RetailTabIcon
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
          tabBarIcon: ({ color, focused }) => (
            <RetailTabIcon
              name={focused ? "person" : "person-outline"}
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
      <AuthProvider>
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
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabItemBox: {
    width: 56,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  topActiveLine: {
    position: "absolute",
    top: 0,
    width: 34,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: "transparent",
  },
  topActiveLineVisible: {
    backgroundColor: "#FF6B00",
  },
});
