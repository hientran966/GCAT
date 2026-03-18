import React from "react";
import { View } from "react-native";
import { Appbar } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function MainLayout({ children }) {
  const navigation = useNavigation();
  const route = useRoute();

  const getTitle = () => {
    switch (route.name) {
      case "Home":
        return "Trang chủ";
      case "User":
        return "Người dùng";
      default:
        return "App";
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        {navigation.canGoBack() && (
          <Appbar.BackAction onPress={() => navigation.goBack()} />
        )}

        <Appbar.Content title={getTitle()} />

        <Appbar.Action icon="dots-vertical" onPress={() => {}} />
      </Appbar.Header>

      <View style={{ flex: 1 }}>
        {children}
      </View>
    </View>
  );
}