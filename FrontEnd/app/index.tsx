import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import BottomNav from "@/components/BottomNav";
import SearchBar from "@/components/SearchBar";

export default function HomeScreen() {
  // Define vegetable items
  const vegetables = [
    { id: 1, name: "Carrot" },
    { id: 2, name: "Cabbage" },
    { id: 3, name: "Tomato" },
    { id: 4, name: "Radish" },
    { id: 5, name: "Broccoli" },
    { id: 6, name: "Cucumber" },
    { id: 7, name: "Pumpkin" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#DFD8D1]">
      <StatusBar style="auto" />

      {/* Header */}
      <View className="px-5 pt-5 my-8">
        <Text className="text-2xl font-bold text-center text-[#1A3244]">
          Accueil
        </Text>
      </View>

      {/* Info text */}
      <View className="px-5 py-3 mb-6">
        <Text className="text-gray-600 text-center">
          Les plants en gris nécessitent une connection internet pour leur
          première utilisation.
        </Text>
      </View>

      {/* Search bar */}
      <SearchBar />

      {/* Plant graphic and vegetable icons */}
      <View className="flex my-10 px-5 items-center justify-center">
        {/* Vegetable icons grid */}
        <View className="flex-row flex-wrap justify-center">
          {vegetables.map((veg) => (
            <TouchableOpacity
              key={veg.id}
              className="m-2 items-center justify-center bg-[#F8C6A4] rounded-full w-16 h-16"
            >
              <Text className="text-[#4A7C59] font-bold">
                {veg.name.charAt(0)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Navigation */}
      <BottomNav />
    </SafeAreaView>
  );
}
