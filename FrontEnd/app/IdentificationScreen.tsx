import {
  View,
  Text,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  PanResponder,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import BottomNav from "@/components/BottomNav";
import { Ionicons } from "@expo/vector-icons";
import Solutions from "@/components/Solutions";

import useDatabase from '../hooks/useDatabase'

export default function IdentificationScreen () {
  const router = useRouter();
  const { historiqueid } = useLocalSearchParams<{historiqueid: string}>();
  const [isRead, setIsRead] = useState<boolean>(false);
  const [pictureURI, setPictureURI] = useState<string|null>(null);
  const [plantName, setPlantName] = useState<string|null>(null);
  const [className, setClassName] = useState<string|null>(null);
  const [plantClassID, setPlantClassID] = useState<string|null>(null);
  const [classDescription, setClassDescription] = useState<string|null>(null);
  const [classIdentification, setClassIdentification] = useState<string|null>(null);
  const [showSolutions, setShowSolutions] = useState(false);
  const slideAnim = useRef(new Animated.Value(1)).current; // Animation value
  const db = useDatabase();

  const readDatabase = async () => {
    if (db && historiqueid) {
      const row = await db.getFirstAsync<{
        PlantName: string,
        PlantClassID: string,
        ClassName: string,
        ClassDescription: string,
        ClassIdentification: string,
        PictureURI: string,
      }>(
        `SELECT
          PlantName, PlantClassID, ClassName, ClassDescription,
          ClassIdentification, PictureURI
        FROM Historique
        JOIN Plants USING (PlantID)
        JOIN PlantClasses USING (PlantClassID)
        WHERE HistoriqueID = ?`,
        [historiqueid]
      );
      if (row?.PlantName) setPlantName(row.PlantName);
      if (row?.PlantClassID) setPlantClassID(row.PlantClassID);
      if (row?.ClassName) setClassName(row.ClassName);
      if (row?.ClassDescription) setClassDescription(row.ClassDescription);
      if (row?.ClassIdentification) setClassIdentification(row.ClassIdentification);
      if (row?.PictureURI) setPictureURI(row.PictureURI);
    }
  };

  useEffect(() => {
    readDatabase(); // Call the async function when the component mounts
  }, [db, historiqueid]); // This effect runs when db changes


  return (
    <SafeAreaView className="flex-1 bg-[#DFD8D1]">
      <ScrollView contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}>
        <View className="p-4 mt-6">
          {
            plantName ?
            <Text className="text-3xl font-extrabold text-gray-800 mb-2 text-center">
              {plantName}
            </Text>:
            <View/>
          }
        </View>
        {/* Image Section */}
        <View className=" p-4 rounded-lg shadow-md">
          {
            pictureURI ?
            <Image source={{ uri: pictureURI }} className="w-full h-64 rounded-lg" />:
            //<Image source={{ uri: pictureURI}} style={{ flex: 5, width: "100%", height: "100%" }}/>:
            <View/>
          }
        </View>
        <View className=" p-4 mt-6 ">
          {
            className ?
            <Text className="text-2xl font-extrabold text-gray-800 mb-2">
              {className}
            </Text>:
            <View/>
          }
          {
            classDescription ?
            <Text className="text-gray-600 text-lg py-4 px-2 leading-relaxed text-justify">
              {classDescription}
            </Text>:
            <View/>
          }
          <Text className="text-2xl font-extrabold text-gray-800 mb-2">
            Comment l'identifier ?
          </Text>
          {
            classIdentification ?
            <Text className="text-gray-600 text-lg py-4 px-2 leading-relaxed text-justify">
              {classIdentification}
            </Text>:
            <View/>
          }
        </View>

        {/* Solutions Button */}
        {
          plantClassID ?
          <View className="flex-1 items-center justify-center mb-20 mt-4">
            <TouchableOpacity
              className="flex-row items-center justify-between bg-[#B67342] rounded-full px-6 py-3 w-60"
              onPress={() => router.push(`/SolutionsScreen?plantclassid=${plantClassID}`)}
            >
              <Text className="text-white font-bold text-base">
                Solutions proposées
              </Text>
              <Ionicons name="chevron-forward" size={16} color="white" />
            </TouchableOpacity>
          </View>:
          <View/>
        }
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
};
