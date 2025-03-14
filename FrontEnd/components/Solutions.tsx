import { View, Text, FlatList } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const products = [
  {
    id: "1",
    name: "L’entrepôt Rona",
    price: "14,99 $",
    address: "465 Bd du Royaume O, Chicoutimi",
  },
  {
    id: "2",
    name: "Pépinière Boréalis",
    price: "8,99 $",
    address: "2568 Rue Mathias, Jonquière",
  },
  {
    id: "3",
    name: "Canadian Tire",
    price: "12,99 $",
    address: "1257 Bd Talbot, Chicoutimi",
  },
  {
    id: "4",
    name: "Les Serres St-Do",
    price: "33,99 $",
    address: "3187 Rue St-Dominique, Chicoutimi",
  },
  {
    id: "5",
    name: "Walmart",
    price: "9,99 $",
    address: "1000 Bd du Royaume, Chicoutimi",
  },
];

const Solutions = () => {
  return (
    <View className="bg-[#E5A985] p-6 mt-6 rounded-lg flex-1">
      {/* Solutions Header */}
      <Text className="text-xl font-bold text-white mb-3">Solutions</Text>

      {/* Solution Block */}
      <View className="bg-white p-4 rounded-lg shadow-md mb-4">
        <Text className="text-lg font-semibold text-[#4A7C59]">
          Vaporiser le plant avec du BTK
        </Text>
        <Text className="text-gray-600 text-sm">
          Diluer le BTK à la concentration recommandée et vaporiser sur les
          feuilles.
        </Text>
      </View>

      {/* Product List Title */}
      <Text className="text-lg font-bold text-white mt-4 mb-4">
        Où trouver le produit ?
      </Text>

      {/* Scrollable Product List Using FlatList */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        nestedScrollEnabled={true} // Allows scrolling inside another ScrollView
        keyboardShouldPersistTaps="handled" // Improves tap response
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-lg shadow-md flex-row items-center mb-6">
            <View className="ml-4">
              <Text className="text-[#4A7C59] font-semibold">{item.name}</Text>
              <Text className="text-gray-600 text-sm">{item.price}</Text>
              <Text className="text-gray-400 text-xs">{item.address}</Text>
            </View>
            <Ionicons
              name="arrow-forward"
              size={16}
              color="#4A7C59"
              className="ml-auto"
            />
          </View>
        )}
      />
    </View>
  );
};

export default Solutions;
