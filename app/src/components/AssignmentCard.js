import { StyleSheet, Image } from "react-native";
import { Card, Text, Button } from "react-native-paper";

export default function AssignmentCard({ item }) {

  const imageSource = item.image_url
    ? { uri: item.image_url }
    : require("../assets/no_image.jpg");

  return (
    <Card style={styles.card}>

      <Card.Content style={styles.row}>

        <Image
          source={imageSource}
          style={styles.image}
        />

        <Card.Content style={styles.info}>

          <Text variant="titleMedium" style={styles.title}>
            {item.product_code} - {item.stage_name}
          </Text>

          <Text variant="bodyMedium" style={styles.text}>
            Đã xong: {item.done_quantity} / {item.assigned_quantity}
          </Text>

          <Text variant="bodyMedium" style={styles.text}>
            Giá: {item.price}đ
          </Text>

        </Card.Content>

      </Card.Content>

      <Card.Actions>
        <Button>Ghi Sổ</Button>
      </Card.Actions>

    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center"
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12
  },

  info: {
    flex: 1
  },

  title: {
    fontWeight: "bold"
  },
});