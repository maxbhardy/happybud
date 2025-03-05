import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, usePathname } from "expo-router";

export default function FooterNav() {
  const router = useRouter();
  const pathname = usePathname(); // Get the current route

  return (
    <View className="absolute bottom-0 left-0 right-0 flex-row bg-[#4A7C59] p-4 justify-around">
      {/* Home Button */}
      <TouchableOpacity
        className={`items-center ${
          pathname === "/" ? "bg-[#F8C6A4] rounded-md p-3" : "p-3"
        }`}
        onPress={() => router.push("/")}
      >
        <Text>🏠</Text>
        <Text
          className={
            pathname === "/"
              ? "text-[#4A7C59] text-xs font-bold"
              : "text-[#F8C6A4] text-xs font-bold"
          }
        >
          Accueil
        </Text>
      </TouchableOpacity>

      {/* Plus Button */}
      <TouchableOpacity className="items-center justify-center bg-[#F8C6A4] rounded-full p-4 -mt-8">
        <Text className="text-[#4A7C59] text-2xl font-bold">+</Text>
      </TouchableOpacity>

      {/* History Button */}
      <TouchableOpacity
        className={`items-center ${
          pathname === "/HistoryScreen" ? "bg-[#F8C6A4] p-3 rounded-md" : "p-3"
        }`}
        onPress={() => router.push("/HistoryScreen")}
      >
        <Text
          className={
            pathname === "/HistoryScreen"
              ? "text-[#4A7C59] text-xl"
              : "text-[#F8C6A4] text-xl"
          }
        >
          🕒
        </Text>
        <Text
          className={
            pathname === "/HistoryScreen"
              ? "text-[#4A7C59] text-xs font-bold"
              : "text-[#F8C6A4] text-xs font-bold"
          }
        >
          Historique
        </Text>
      </TouchableOpacity>
    </View>
  );
}
