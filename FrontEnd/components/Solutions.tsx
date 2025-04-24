import { View, Text, FlatList, Linking, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const Solutions = ({ products = [] }: any) => {
  return (
    <View className="p-4 mt-3 rounded-lg flex-1">
      {/* Title */}
      <Text className="text-lg font-bold text-black mt-4 mb-4">
        Où trouver le produit ?
      </Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.ProduitId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {Linking.openURL(item.SiteWeb);}}
            className="bg-white p-4 rounded-lg shadow-md mb-6"
          >
            {/* 1) Product name */}
            <Text className="text-xl font-bold text-gray-900 mb-1">
              {item.ProductName}
            </Text>

            {/* 2) Description */}
            <Text className="text-base text-gray-700 mb-3">
              {item.Description}
            </Text>

            {/* 3) Supplier / arrow row */}
            <View className="flex-row items-center mb-2">
              <Text className="text-[#4A7C59] font-semibold">
                {item.Fournisseur}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color="#4A7C59"
                className="ml-auto"
              />
            </View>

            {/* 4) Price and location */}
            <Text className="text-gray-600 text-sm mb-1">
              Prix: {item.Prix} $
            </Text>
            <Text className="text-gray-400 text-xs">Lieu: {item.Lieu}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Solutions;
