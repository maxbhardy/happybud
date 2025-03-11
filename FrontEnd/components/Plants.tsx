import { View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter, usePathname } from "expo-router";
export default function Plants() {
  const router = useRouter();
  const vegetables = [
    {
      id: 1,
      name: "Carrot",
      image: require("../assets/images/plants/carrot.png"),
    }, // 🥕 Carrot
    {
      id: 2,
      name: "Cabbage",
      image: require("../assets/images/plants/cabbage.png"),
    }, // 🥬 Cabbage
    {
      id: 3,
      name: "Tomato",
      image: require("../assets/images/plants/tomato.png"),
    }, // 🍅 Tomato
    {
      id: 4,
      name: "Radish",
      image: require("../assets/images/plants/radish.png"),
    }, // 🌱 Radish
    {
      id: 5,
      name: "Broccoli",
      image: require("../assets/images/plants/broccoli.png"),
    }, // 🥦 Broccoli
    {
      id: 6,
      name: "Cucumber",
      image: require("../assets/images/plants/cucumber.png"),
    }, // 🥒 Cucumber
    {
      id: 7,
      name: "Pumpkin",
      image: require("../assets/images/plants/pumpkin.png"),
    }, // 🎃 Pumpkin
  ];

  return (
    <View className="flex my-10 px-5 items-center justify-center">
      {/* Vegetable Image Grid */}
      <View className="flex-row flex-wrap justify-between w-full max-w-[300px]">
        {vegetables.map((veg, index) => (
          <TouchableOpacity
            key={veg.id}
            className="m-2 items-center justify-center bg-[#F8C6A4] rounded-full w-20 h-20"
            onPress={() => router.push(`/CameraScreen?plant=${veg.name}`)}
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
