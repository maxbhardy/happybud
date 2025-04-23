import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import BottomNav from "@/components/BottomNav";
import { StatusBar } from "expo-status-bar";
import HistoriqueComp from "@/components/HistoriqueComp";
import SearchBar from "@/components/SearchBar";
import { getHistoriqueResults } from "@/utils/database";
import { useState, useEffect } from "react";
import useDatabase from "@/hooks/useDatabase";


export default function HistoryScreen() {
  const [thumbnailURI, setThumbnailURI] = useState<Array<string | null>>([]);
  const [historiqueId, setHistoriqueId] = useState<Array<string | null>>([]);
  const [plantName, setPlantName] = useState<Array<string | null>>([]);
  const [timestamp, setTimestamp] = useState<Array<string | null>>([]);
  const [plantClassName, setPlantClassName] = useState<Array<string | null>>([]);
  const [data, setData] = useState<Array<any>>([]);
  const db = useDatabase();



  const getHistorique = async () => {
    var historiques = await db.getAllAsync(`SELECT * FROM Historique 
    INNER JOIN Plants ON PlantID = Historique.PlantID
    INNER JOIN PlantClasses ON Historique.PlantClassID = PlantClasses.PlantClassID
    ORDER BY Timestamp DESC`);

    setData(historiques);
    console.log(historiques);
  };

  useEffect(() => {
    getHistorique(); // Call the async function when the component mounts
  }, [db]);

  return (
    <SafeAreaView className="flex-1 bg-[#DFD8D1]">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
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
              key={item.HistoriqueId}
              title={item.PlantName}
              date={item.Timestamp}
              description={item.ClassName}
              onPress={() => {
                // Par exemple, navigation vers un écran de détail
                // navigation.navigate('HistoriqueDetail', { id: item.id });
              }}
            />
          ))}
        </View>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}
