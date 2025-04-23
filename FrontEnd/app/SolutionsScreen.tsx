import React, { useEffect, useState } from "react";
import { Text, View, SafeAreaView } from "react-native";
import BottomNav from "@/components/BottomNav";

import SolutionsComp from "@/components/SolutionsComp";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import useDatabase from "@/hooks/useDatabase";

const SolutionsScreen = () => {
  const { plantClassID } = useLocalSearchParams();
  const db = useDatabase();
  const [rows, setRows] = useState<any[]>([])
  const router = useRouter();

  useEffect(() => {
   (async () => {
      try {
        const allRows = await db.getAllAsync(
          `SELECT * FROM PlantSolutions WHERE SolutionID IN (
             SELECT SolutionID
               FROM ClassSolutionRelationships
              WHERE PlantClassID = ?
           );`,
          [plantClassID]
        )
        setRows(allRows)
      } catch (err) {
        console.error('Query failed', err)
      } finally {
        
      }
    })()
  }, [db, plantClassID])
  if (rows.length === 0) {
    return (
      <View className="text-center">
        <Text>Aucune solution pour cette classe de plante.</Text>
      </View>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-[#DFD8D1]">
      <View className="px-5 pt-5 my-8">
        <Text className="text-2xl font-bold text-center text-[#1A3244]">
          Les solutions
        </Text>
      </View>

      <View className="my-10">
      {rows.map(item => (
        <SolutionsComp
          key={item.SolutionID}
          title={item.SolutionName}
          description={item.SolutionSummary}
          onPress={() =>
            router.push({
              pathname: '/ProductScreen',
              params: {
                id: String(item.SolutionID),
                name: item.SolutionName,
                desc: item.SolutionDescription,
              },
            })
          }
        />
      ))}
    </View>
      <BottomNav />
    </SafeAreaView>
  );
};

export default SolutionsScreen;
