import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Solutions from "@/components/Solutions";
import useDatabase from "@/hooks/useDatabase";
const ProductScreen = () => {
  const { id, name, desc } = useLocalSearchParams();
  const db = useDatabase();
  const [rows, setRows] = useState<any[]>([])
 

    const readDatabase = async () => {
      if (db && id) {
        try {
          const allRows = await db.getAllAsync(
            `SELECT * FROM Produits WHERE ProduitID IN (
                SELECT ProduitID
                  FROM PlantSolutionRelationship
                WHERE SolutionID = ?
              );`,
            [id]
          )
          setRows(allRows)
        } catch (err) {
          console.error('Query failed', err)
        } finally {
          
        }
      }
    };
  
    useEffect(() => {
        readDatabase(); // Call the async function when the component mounts
      }, [db, id]); // This effect runs when db changes
  return (
    <SafeAreaView className="flex-1 bg-[#DFD8D1]">
      <View className="px-5 pt-5 my-8">
        <Text className="text-2xl font-bold text-center text-[#1A3244]">
          Les produits
        </Text>
      </View>
      <View className="px-5">
        <Text className="text-3xl font-bold text-gray-900 mb-4">{name}</Text>

        {/* Description */}
        <Text className="text-base text-gray-700 leading-relaxed">{desc}</Text>
      </View>
      <Solutions products={rows}/>
    </SafeAreaView>
  );
};

export default ProductScreen;
