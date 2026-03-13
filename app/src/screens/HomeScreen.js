import { useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from "react-native";

import { useDispatch, useSelector } from "react-redux";

import { fetchAccountDetail } from "../stores/accountSlice";
import { selectAccountDetail } from "../stores/accountSelectors";

export default function HomeScreen() {

  const dispatch = useDispatch();

  const accountDetail = useSelector(selectAccountDetail);
  const loading = useSelector(state => state.account.loading);

  /* =====================
        LOAD DATA
  ===================== */

  useEffect(() => {
    const accountId = 1; // TODO: lấy từ login
    dispatch(fetchAccountDetail(accountId));
  }, []);

  const assignments = accountDetail?.assignments || [];

  /* =====================
        RENDER CARD
  ===================== */

  const renderItem = ({ item }) => (
    <View style={styles.card}>

      <Image
        source={{ uri: item.image_url }}
        style={styles.image}
      />

      <View style={styles.info}>

        <Text style={styles.stageName}>
          {item.product_code} -{item.stage_name}
        </Text>

        <Text>
          Đã xong: {item.done_quantity} / {item.assigned_quantity}
        </Text>

        <Text>
          Giá: {item.price}đ
        </Text>

      </View>

    </View>
  );

  /* =====================
        LOADING
  ===================== */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* =====================
        VIEW
  ===================== */

  return (
    <FlatList
      data={assignments}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({

  container: {
    padding: 12
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12
  },

  info: {
    flex: 1,
    justifyContent: "center"
  },

  stageName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }

});