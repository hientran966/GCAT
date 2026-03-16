import { Provider as PaperProvider } from "react-native-paper";
import { Provider } from "react-redux";
import { store } from "./src/stores";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <AppNavigator />
      </PaperProvider>
    </Provider>
  );
}