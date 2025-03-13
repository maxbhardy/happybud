// Créé à partir de de https://github.com/expo/examples/blob/master/with-camera/App.tsx

import {
  CameraMode,
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import {
  Button,
  Pressable,
  StyleSheet,
  Dimensions,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";


export default function CmeraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [recording, setRecording] = useState(false);
  const router = useRouter();
  const { plant } = useLocalSearchParams();
  


  const { width, height } = Dimensions.get("window");
  const squareSize = width * 0.8;

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    requestPermission();
  }

  const takePicture = async () => {
    // Capture the picture
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) {
      // Get the dimensions of the original image
      const { width, height } = await ImageManipulator.manipulateAsync(
        photo.uri,
        [],
        { format: ImageManipulator.SaveFormat.JPEG }
      );

      // Set the desired crop area (for example, a square crop in the center)
      const squareSize = Math.min(width, height) * 0.8; // 80% of the smaller dimension
      const crop = {
        originX: (width - squareSize) / 2,
        originY: (height - squareSize) / 2,
        width: squareSize,
        height: squareSize,
      };

      // Perform the crop
      const cropped = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ crop }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Set the cropped image URI to state
      setUri(cropped.uri);
    }
  };
  
  const cropImage = async (imageUri: string) => {
    if (!ref.current) return;
  
    const cameraSizes = await ref.current?.getAvailablePictureSizesAsync();
    if (!cameraSizes || cameraSizes.length === 0) return;
    
    const selectedSize = cameraSizes[cameraSizes.length - 1]; // Pick the largest size
    const [cameraWidth, cameraHeight] = selectedSize.split("x").map(Number);
    
  
    const squareSize = Math.min(cameraWidth, cameraHeight) * 0.8; // Crop based on camera view
  
    const cropped = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          crop: {
            originX: (cameraWidth - squareSize) / 2,
            originY: (cameraHeight - squareSize) / 2,
            width: squareSize,
            height: squareSize,
          },
        },
      ],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );
  
    if (cropped?.uri) {
      setUri(cropped.uri);
    } else {
      console.error("Image cropping failed");
    }
  };
  
  

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((prev) => (prev === "off" ? "on" : "off"));
  };

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setUri(result.assets[0].uri);
    }
  };

  const renderPicture = () => {
    return (
      <View className="flex-1 px-[10] pt-5">
        <View className="flex-1 w-full items-center flex-row justify-between px-[30]">
          <TouchableOpacity>
            {
              <Ionicons
                name="arrow-back"
                size={30}
                color="white"
                onPress={() => router.push("/")}
              />
            }
          </TouchableOpacity>
          {/* <Text className="text-2xl font-bold text-center text-white">
            Camera
          </Text> */}
          <View className="w-30" />
        </View>
        <Image
          source={{ uri }}
          contentFit="contain"
          //style={{ width: 300, aspectRatio: 1 }}
          style={{ flex: 5, width: "100%", height: "100%" }}
          //className="flex-6 w-full h-full"
        />
        <View className="flex-1 mx-8">
          <Text className="text-2 text-center text-[#ffffff] pt-10">
            Souhaitez-vous soukmettre la photo à l'algorithme ou la reprendre ?
          </Text>
        </View>
        <View className="flex-1 w-full items-center flex-row justify-around">
          <TouchableOpacity onPress={() => setUri(null)}>
            <Ionicons name="arrow-undo-outline" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="checkmark-circle-outline" size={30} color="white"  onPress={() => router.push(`/IdentificationScreen?image=${encodeURIComponent(uri || '')}`)}/>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCamera = () => {
    return (
      
      
      <View className="flex-1 px-[10] pt-5">
        <View className="flex-1 w-full items-center flex-row justify-between px-[30]">
          <TouchableOpacity>
            {
              <Ionicons
                name="arrow-back"
                size={30}
                color="white"
                onPress={() => router.push("/")}
              />
            }
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-center text-[#ffffff]">
            {plant || "Camera"}
          </Text>
          <TouchableOpacity onPress={toggleFlash}>
            {flash === "off" ? (
              <Ionicons name="flash-off" size={30} color="white" />
            ) : (
              <Ionicons name="flash" size={30} color="white" />
            )}
          </TouchableOpacity>
        </View>
        <CameraView
          //className="flex-6 w-full h-full"
          style={{ flex: 6, width: "100%", height: "100%" }}
          ref={ref}
          flash={flash}
          facing={facing}
          responsiveOrientationWhenOrientationLocked
        />

        <View
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: squareSize,
            height: squareSize,
            transform: [{ translateX: -squareSize / 2 }, { translateY: -squareSize / 2 }],
            borderWidth: 3,
            borderColor: "white",
          }}
        />

        <View className="flex-1 w-full items-center flex-row justify-between px-[30]">
          <TouchableOpacity onPress={pickImageAsync}>
            {<Ionicons name="image-outline" size={30} color="white" />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={takePicture}
            className="group rounded-full w-[70] h-[70] bg-white items-center justify-center active:opacity-50"
          >
            <View className="rounded-full w-[60] h-[60] bg-black items-center justify-center">
              <View className="rounded-full w-[50] h-[50] bg-white group-active:opacity-50" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFacing}>
            <Ionicons name="camera-reverse" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#000000]">
      {uri ? renderPicture() : renderCamera()}
    </SafeAreaView>
  );
}
