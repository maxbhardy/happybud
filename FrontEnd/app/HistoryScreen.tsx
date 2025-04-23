import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
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
    var historiques = await db.getAllAsync("SELECT * FROM Historique ORDER BY Timestamp DESC");

    for (const row of historiques) {
      console.log(row.HistoriqueId);

      // const hist_res = db.getFirstAsync("SELECT * FROM HistoriqueResult WHERE HistoriqueId == ?",row.HistoriqueId);
      const plant_name = db.getFirstAsync("SELECT PlantName FROM Plants WHERE PlantID = ?", row.PlantID);

      const plant_class_name = db.getFirstAsync("SELECT ClassName FROM PlantClasses WHERE PlantClassID = ?", row.PlantClassID);

      historiques.plant_name = plant_name;
      historiques.plant_class_name = plant_class_name;
      //      thumbnailURI.push(row?.ThumbnailURI);
      //      plantName.push(plant_name);
      //      historiqueId.push(row?.HistotriqueId);
      //      timestamp.push(row?.Timestamp);
      //      plantClassName.push(plant_class_info?.ClassName);
      setData(historiques);
    }

  };

  useEffect(() => {
    getHistorique(); // Call the async function when the component mounts
  }, [db]);

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
            key={item.HistoriqueId}
            title={item.plant_name}
            date={item.Timestamp}
            description={item.plant_class_name}
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
