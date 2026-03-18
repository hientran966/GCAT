import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { Avatar, Card, Text, Appbar } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { useRoute, useNavigation } from "@react-navigation/native";

import { fetchAccountDetail } from "../stores/accountSlice";
import { selectAccountDetail } from "../stores/accountSelectors";

export default function WorkerDetailScreen() {
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const worker = useSelector(selectAccountDetail);

  useEffect(() => {
    dispatch(fetchAccountDetail(1));
  }, []);

  if (!worker) return null;

  return (
    <View style={{ flex: 1 }}>

      {/* APPBAR */}
      <Appbar.Header>
        <Appbar.Content title="Chi tiết công nhân" />
        <Appbar.Action icon="refresh" onPress={() => dispatch(fetchAccountDetail(id))} />
      </Appbar.Header>

      {/* CONTENT */}
      <ScrollView style={{ flex: 1, padding: 12 }}>
        
        {/* INFO CARD */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content style={{ flexDirection: "row", alignItems: "center" }}>
            
            <Avatar.Image
              size={80}
              source={{
                uri: worker.avatar || "https://i.pravatar.cc/150?img=3",
              }}
            />

            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text variant="titleMedium">{worker.name}</Text>
              <Text>SĐT: {worker.phone}</Text>
              <Text>Địa chỉ: {worker.address || "—"}</Text>
              <Text>Vai trò: {worker.role}</Text>
            </View>

          </Card.Content>
        </Card>

      </ScrollView>
    </View>
  );
}