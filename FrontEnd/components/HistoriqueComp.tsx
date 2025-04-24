import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

const favicon = require("../assets/images/favicon.png");
export default function HistoriqueComp({
  title,
  date,
  description,
  image,
  onPress,
  onDelete,
}: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white p-4 mx-2 my-4 rounded-lg shadow-md mb-4 flex-row items-center justify-between"
    >
      {/* Bloc de texte */}
      <View className="flex-1 flex-row items-center pr-3">
        <View>
          {image ? (
            <Image
              source={{ uri: image }}
              className="w-12 h-12 rounded-md mr-3"
              resizeMode="contain"
            />
          ) : (
            <Image
              source={favicon}
              className="w-12 h-12 rounded-md mr-3"
              resizeMode="contain"
            />
          )}
        </View>
        <View className="pr-6">
          <Text className="text-[#4A7C59] font-bold text-base">{title}</Text>
          <Text className="text-gray-400 text-sm">{date}</Text>
          <Text
            className="text-gray-600 text-sm mt-1"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {description}
          </Text>
        </View>
      </View>

      {/* Flèche à droite */}
      <View className="flex-row items-center">
        <Ionicons name="arrow-forward" size={24} color="#4A7C59" />
        <TouchableOpacity
          onPress={() => {
            onDelete && onDelete();
          }}
          className="ml-4"
        >
          <Ionicons name="trash" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
