import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import React from "react";
import BottomNav from "@/components/BottomNav";
import { StatusBar } from "expo-status-bar";
import HistoriqueComp from "@/components/HistoriqueComp";
import SearchBar from "@/components/SearchBar";
export default function HistoryScreen() {
  const data = [
    {
      id: 1,
      title: "Tomate - Ravageur",
      date: "Aujourd'hui",
      description:
        "Petite description mais celui-ci est grand pour montrer l'utilité de la ...",
    },
    {
      id: 2,
      title: "Tomate - Plant saint",
      date: "Il y a 3 jours",
      description:
        "Description plus courte, tout va bien, aucune anomalie détectée.",
    },
  ];
  return (
    <SafeAreaView className="flex-1 bg-[#DFD8D1]">
      <StatusBar style="auto" />
      <View className="px-5 pt-5 my-8">
        <Text className="text-2xl font-bold text-center text-[#1A3244]">
          Historique
        </Text>
      </View>
      <SearchBar />
      <View className="my-10">
        {data.map((item) => (
          <HistoriqueComp
            key={item.id}
            title={item.title}
            date={item.date}
            description={item.description}
            onPress={() => {
              // Par exemple, navigation vers un écran de détail
              // navigation.navigate('HistoriqueDetail', { id: item.id });
            }}
          />
        ))}
      </View>
      <BottomNav />
    </SafeAreaView>
  );
}
