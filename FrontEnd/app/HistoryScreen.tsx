import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import BottomNav from "@/components/BottomNav";
import { StatusBar } from "expo-status-bar";
export default function HistoryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#DFD8D1]">
      <StatusBar style="auto" />
      <View className="px-5 pt-5 my-8">
        <Text className="text-2xl font-bold text-center text-[#1A3244]">
          Historique
        </Text>
      </View>

      <BottomNav />
    </SafeAreaView>
  );
}
