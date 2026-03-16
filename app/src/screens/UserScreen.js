import { useEffect } from "react";
import { View, StyleSheet, FlatList } from "react-native";

import { ActivityIndicator } from "react-native-paper";

import { useDispatch, useSelector } from "react-redux";

import { fetchAccountDetail } from "../stores/accountSlice";
import { selectAccountDetail } from "../stores/accountSelectors";

import AssignmentCard from "../components/AssignmentCard";

export default function HomeScreen() {

  const dispatch = useDispatch();

  const accountDetail = useSelector(selectAccountDetail);
  const loading = useSelector(state => state.account.loading);

  useEffect(() => {
    dispatch(fetchAccountDetail(1));
  }, []);

  const assignments = accountDetail?.assignments || [];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={assignments}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <AssignmentCard item={item} />}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});