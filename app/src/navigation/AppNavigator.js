import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import HomeScreen from "../screens/HomeScreen";
import UserScreen from "../screens/UserScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* -------- TAB -------- */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "gray",

        tabBarStyle: {
          backgroundColor: "#fff",
          height: 60,
          paddingBottom: 6,
        },

        tabBarLabelStyle: {
          fontSize: 12,
        },

        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home";
          if (route.name === "User") iconName = "account";

          return (
            <MaterialCommunityIcons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Trang chủ" }}
      />

      <Tab.Screen
        name="User"
        component={UserScreen}
        options={{ title: "Người dùng" }}
      />
    </Tab.Navigator>
  );
}

/* -------- STACK -------- */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}