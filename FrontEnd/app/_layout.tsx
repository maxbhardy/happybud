import { StackRouter } from "@react-navigation/native";
import { Stack, Tabs } from "expo-router";
import "../global.css";
export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    ></Stack>
  );
}
