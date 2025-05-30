import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import BottomNav from "@/components/BottomNav";
import { StatusBar } from "expo-status-bar";
import HistoriqueComp from "@/components/HistoriqueComp";
import SearchBar from "@/components/SearchBar";
import { openDatabase } from "@/utils/database";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";


export default function HistoryScreen() {
  const [thumbnailURI, setThumbnailURI] = useState<Array<string | null>>([]);
  const [historiqueId, setHistoriqueId] = useState<Array<string | null>>([]);
  const [plantName, setPlantName] = useState<Array<string | null>>([]);
  const [timestamp, setTimestamp] = useState<Array<string | null>>([]);
  const [plantClassName, setPlantClassName] = useState<Array<string | null>>([]);
  const [data, setData] = useState<Array<any>>([]);
  const router = useRouter();

  const getHistorique = async () => {
    const db = await openDatabase();

    //await db.execAsync('DELETE FROM Historique');
    //await db.execAsync('DELETE FROM HistoriqueResults');

    const historiques = await db.getAllAsync(
      `SELECT HistoriqueId, PlantName, ClassName, Timestamp, ThumbnailURI
      FROM Historique 
      JOIN Plants USING (PlantID)
      JOIN PlantClasses USING (PlantClassID)
      ORDER BY Timestamp DESC`
    );

    setData(historiques);
    console.log(historiques);
    await db.closeAsync();
  };

  const deleteHistorique = async (historiqueId: number) => {
    // Open database
    const db = await openDatabase();

    // Delete Historique results
    await db.runAsync(
      `DELETE FROM HistoriqueResult WHERE HistoriqueId = ?`, [historiqueId]
    );

    // Delete Historique
    await db.runAsync(
      `DELETE FROM Historique WHERE HistoriqueId = ?`, [historiqueId]
    );

    // Refetch historique
    const historiques = await db.getAllAsync(
      `SELECT HistoriqueId, PlantName, ClassName, Timestamp, ThumbnailURI
      FROM Historique 
      JOIN Plants USING (PlantID)
      JOIN PlantClasses USING (PlantClassID)
      ORDER BY Timestamp DESC`
    );

    setData(historiques);
    console.log(historiques);

    // Close database
    await db.closeAsync();
  }

  useEffect(() => {
    getHistorique(); // Call the async function when the component mounts
  }, []);

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
              historiqueid={item.HistoriqueId}
              title={item.PlantName}
              date={item.Timestamp}
              description={item.ClassName}
              image={item.ThumbnailURI}
              onPress={() => {
                router.push(`/IdentificationScreen?historiqueID=${item.HistoriqueId}`)
                // Par exemple, navigation vers un écran de détail
                // navigation.navigate('HistoriqueDetail', { id: item.id });
              }}
              onDelete={deleteHistorique}
            />
          ))}
        </View>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}
