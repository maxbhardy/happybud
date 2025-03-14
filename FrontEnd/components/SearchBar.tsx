import { View, Text, TextInput } from "react-native";
import React from "react";

export default function SearchBar() {
  return (
    <>
      <View className="px-5">
        <View className="flex-row items-center bg-white rounded-full p-4 px-4">
          <TextInput
            className="flex-1 text-gray-800 ml-1"
            placeholder="Recherchez votre plante ici"
          />
          <Text>🔍</Text>
        </View>
      </View>
    </>
  );
}
