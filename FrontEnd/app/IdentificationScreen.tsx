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
import { useState, useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import BottomNav from "@/components/BottomNav";
import { Ionicons } from "@expo/vector-icons";
import Solutions from "@/components/Solutions";

const IdentificationScreen = () => {
  const { image } = useLocalSearchParams();
  const [showSolutions, setShowSolutions] = useState(false);
  const slideAnim = useRef(new Animated.Value(1)).current; // Animation value

  // Function to Show Solutions (Slide Up)
  const showSolutionsPanel = () => {
    setShowSolutions(true);
    Animated.timing(slideAnim, {
      toValue: 1, // Fully visible
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  // Function to Hide Solutions (Slide Down)
  const hideSolutionsPanel = () => {
    Animated.timing(slideAnim, {
      toValue: 0, // Move down
      duration: 500, // Matches swipe duration
      useNativeDriver: true,
    }).start(() => setShowSolutions(false));
  };

  // Enable Swipe Down to Close (ONLY from Top Section)
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (_, gestureState) =>
      gestureState.y0 < 100, // Limit drag detection to top 100px
    onMoveShouldSetPanResponder: (_, gestureState) =>
      gestureState.y0 < 100, // Allow movement only if touch starts in top section
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(1 - gestureState.dy / 1000);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 150) {
        hideSolutionsPanel();
      } else {
        showSolutionsPanel();
      }
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-[#DFD8D1]">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Image Section */}
        <View className=" p-4 rounded-lg shadow-md">
          <Image source={{ uri: image }} className="w-full h-64 rounded-lg" />
        </View>
        <View className=" p-4 mt-6 ">
          <Text className="text-2xl font-extrabold text-gray-800 mb-2">
            Diagnostic de la maladie
          </Text>

          <Text className="text-gray-600 text-lg py-4 px-2 leading-relaxed text-justify">
            D'après l'image, le plant de tomate présente des dégâts foliaires
            dus à une infestation d'insectes, probablement causée par des
            chenilles (larves de Lépidoptères). La présence de traces
            d’alimentation irrégulières, de taches nécrotiques et de feuilles
            enroulées suggère une attaque par Tuta absoluta (mineuse de la
            tomate) ou par des chenilles de la noctuelle du tabac (Tomato
            Hornworm).
          </Text>
        </View>
        {/* POSSIBLE CAUSES  */}
        <View className=" p-4 mt-4 ">
          <Text className="text-2xl font-extrabold text-gray-800 mb-2">
            Cause possible :
          </Text>
          <Text className="py-4 px-2 text-xl font-semibold">Symptômes : Tuta absoluta (Mineuse de la tomate)</Text>
          <View className="pl-2">
            <Text className="text-gray-600 text-lg leading-relaxed">
              • Galeries ou tunnels irréguliers dans les feuilles.
            </Text>
            <Text className="text-gray-600 text-lg leading-relaxed">
              • Brunissement et nécrose des zones touchées.
            </Text>
            <Text className="text-gray-600 text-lg leading-relaxed">
              • Affaiblissement du plant, entraînant une réduction du rendement
              en fruits.
            </Text>
            <Text className="text-gray-600 text-lg leading-relaxed">
              • Peut également endommager les tiges et les fruits, provoquant
              des trous.
            </Text>
          </View>
        </View>
        <View className=" p-4 my-4 ">
          <Text className="text-2xl font-extrabold text-gray-800 mb-2">
            Autre ravageur :
          </Text>
          <Text className="py-4 px-2 text-xl font-semibold">Symptômes : La noctuelle du tabac (Manduca quinquemaculata)</Text>
          <View className="pl-2">
            <Text className="text-gray-600 text-lg leading-relaxed">
              • Trous larges et irréguliers dans les feuilles.
            </Text>
            <Text className="text-gray-600 text-lg leading-relaxed">
              • Défoliation sévère : les feuilles ou tiges peuvent être totalement rongées en une nuit.
            </Text>
            <Text className="text-gray-600 text-lg leading-relaxed">
              • Chenilles vertes visibles sur le plant.
            </Text>
            <Text className="text-gray-600 text-lg leading-relaxed">
              • Excréments noirs (frass) présents sur les feuilles.
            </Text>
          </View>
        </View>

        {/* Solutions Button */}
        <View className="flex-1 items-center justify-center mb-20 mt-4">
          <TouchableOpacity
            className="flex-row items-center justify-between bg-[#B67342] rounded-full px-6 py-3 w-60"
            onPress={showSolutionsPanel}
          >
            <Text className="text-white font-bold text-base">
              Solutions proposées
            </Text>
            <Ionicons name="chevron-up" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Solutions Component - Slide Up Overlay */}
      {showSolutions && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "100%",
            backgroundColor: "#E5A985",
            transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [1000, 0] }) }],
          }}
        >
          {/* Draggable Indicator (Swipe Detection Only at the Top) */}
          <View {...panResponder.panHandlers}>
            <TouchableWithoutFeedback onPress={hideSolutionsPanel}>
              <View className="items-center h-20 -mb-10 bg-white pt-4">
                <View className="w-28 h-2 bg-gray-700 rounded-full" />
              </View>
            </TouchableWithoutFeedback>
          </View>

          {/* Scrollable Solutions Content */}
          <Solutions />
        </Animated.View>
      )}

      <BottomNav />
    </SafeAreaView>
  );
};

export default IdentificationScreen;
