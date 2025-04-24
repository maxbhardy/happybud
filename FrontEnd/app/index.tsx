import React from "react";
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import BottomNav from "@/components/BottomNav";
import SearchBar from "@/components/SearchBar";
import Plants from "@/components/Plants";
import { Ionicons } from "@expo/vector-icons";
import { replaceLocalFiles, setupLocalFiles } from '@/utils/localfiles'

export default function HomeScreen() {
  // Define vegetable items

  useEffect(() => {
    //replaceLocalFiles(); // To replace database and models
    setupLocalFiles(); // To add only missing files
  }, []); // Runs once when loading home screen


  return (
    <SafeAreaView className="flex-1 bg-[#DFD8D1]">
      <StatusBar style="auto" />

      {/* Header */}
      <View className="px-5 pt-5 my-8">
        <Text className="text-2xl font-bold text-center text-[#1A3244]">
          Accueil
        </Text>
      </View>

      {/* Info text */}
      <View className="px-5 py-3 mb-6">
        <Text className="text-gray-600 text-center">
          Les plants en gris nécessitent une connection internet pour leur
          première utilisation.
        </Text>
      </View>

      {/* Search bar */}
      <SearchBar />

      {/* The Plants */}
      <Plants />

      {/* BUTTON FOR THE PROPOSED SOLUTIONS  */}
      {/* <View className="flex-1 items-center justify-center ">
        <TouchableOpacity className="flex-row items-center justify-between bg-[#B67342] rounded-full px-6 py-3 w-60">
          <Text className="text-white font-bold text-base">
            Solutions proposées
          </Text>
          <Ionicons name="arrow-up" size={16} color="white" />
        </TouchableOpacity>
      </View> */}

      {/* Bottom Navigation */}

      <BottomNav />
    </SafeAreaView>
  );
}
