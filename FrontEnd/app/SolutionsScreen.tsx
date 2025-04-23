import React from "react";
import { Text, View, SafeAreaView } from "react-native";
import BottomNav from "@/components/BottomNav";

import SolutionsComp from "@/components/SolutionsComp";
import { router, useRouter } from "expo-router";
const SolutionsScreen = () => {
  const data = [
    {
      id: 1,
      SolutionName: "Tomate - Ravageur",
      date: "Aujourd'hui",
      description:
        "Petite description mais celui-ci est grand pour montrer l'utilité de la ...",
    },
    {
      id: 2,
      SolutionName: "Tomate - Plant saint",
      date: "Il y a 3 jours",
      description:
        "Description plus courte, tout va bien, aucune anomalie détectée.",
    },
  ];
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-[#DFD8D1]">
      <View className="px-5 pt-5 my-8">
        <Text className="text-2xl font-bold text-center text-[#1A3244]">
          Les solutions
        </Text>
      </View>

      <View className="my-10">
      {data.map(item => (
        <SolutionsComp
          key={item.id}
          title={item.SolutionName}
          description={item.description}
          onPress={() => {
            router.push({
              pathname: '/ProductScreen',
              params: {
                id: String(item.id),
                name: item.SolutionName,
                desc: item.description
              }
            })
          }}
        />
      ))}
    </View>
      <BottomNav />
    </SafeAreaView>
  );
};

export default SolutionsScreen;
