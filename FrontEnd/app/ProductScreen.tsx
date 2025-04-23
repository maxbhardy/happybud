import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Solutions from "@/components/Solutions";
const ProductScreen = () => {
  const { id, name, desc } = useLocalSearchParams();
  return (
    <SafeAreaView className="flex-1 bg-[#DFD8D1]">
      <View className="px-5 pt-5 my-8">
        <Text className="text-2xl font-bold text-center text-[#1A3244]">
          Les produits
        </Text>
      </View>
      <View className="px-5">
        <Text className="text-3xl font-bold text-gray-900 mb-4">{name}</Text>

        {/* Description */}
        <Text className="text-base text-gray-700 leading-relaxed">{desc}</Text>
      </View>
      <Solutions/>
    </SafeAreaView>
  );
};

export default ProductScreen;
