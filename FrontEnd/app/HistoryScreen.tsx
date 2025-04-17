import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import React from "react";
import BottomNav from "@/components/BottomNav";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

export default function HistoryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#DFD8D1]">
      <StatusBar style="auto" />
      <View className="px-5 pt-5 my-8">
        <Text className="text-2xl font-bold text-center text-[#1A3244]">
          Historique
        </Text>
      </View>
      <View className="flex-1 items-center justify-center mb-20 mt-4">
        <TouchableOpacity
          className="flex-row items-center justify-between bg-[#B67342] rounded-full px-6 py-3 w-60"
          onPress={() => router.push("/OnnxTest")}
        >
          <Text className="text-white font-bold text-base">
            Test Modèle ONNX
          </Text>
        </TouchableOpacity>
      </View>

      <BottomNav />
    </SafeAreaView>
  );
}
