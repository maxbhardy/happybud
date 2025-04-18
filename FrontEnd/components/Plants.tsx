import { View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter, usePathname } from "expo-router";
export default function Plants() {
  const router = useRouter();
  const vegetables = [
    {
      id: 1,
      name: "Maïs",
      image: require("../assets/images/plants/carrot.png"),
    }, // 🥕 Carrot
    {
      id: 2,
      name: "Tomate",
      image: require("../assets/images/plants/tomato.png"),
    }, // 🍅 Tomato
    {
      id: 3,
      name: "Patate",
      image: require("../assets/images/plants/radish.png"),
    }, // 🌱 Radish=
  ];

  return (
    <View className="flex my-10 px-5 items-center justify-center">
      {/* Vegetable Image Grid */}
      <View className="flex-row flex-wrap justify-between w-full max-w-[300px]">
        {vegetables.map((veg, index) => (
          <TouchableOpacity
            key={veg.id}
            className="m-2 items-center justify-center bg-[#F8C6A4] rounded-full w-20 h-20"
            onPress={() => router.push(`/CameraScreen?plant=${veg.id}`)}
          >
            <Image
              source={veg.image}
              className="w-16 h-16"
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
