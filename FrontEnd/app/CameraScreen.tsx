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
  ActivityIndicator,
} from "react-native";
import React from "react";
import { Image } from "expo-image";
import { Asset, useAssets } from 'expo-asset';
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as ort from 'onnxruntime-react-native';
import { Skia, useImage } from "@shopify/react-native-skia";
import useDatabase from '../hooks/useDatabase'
import * as picture from '../utils/picture'
import * as onnx from '../utils/onnx'

const modelEncoder = require('../assets/models/generalist_model_2025_03_27_encoder.ort')
const plantDecoder = require('../assets/models/generalist_model_plants_2025_03_27_decoder.ort')
const tomatoDecoder = require('../assets/models/generalist_model_tomato_2025_03_27_decoder.ort')

export default function CmeraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const router = useRouter();
  const { plant } = useLocalSearchParams();
  const [model, setModel] = useState(null);
  const [runningModel, setRunningModel] = useState(false);
  const { width, height } = Dimensions.get("window");
  const squareSize = width * 0.8;
  const db = useDatabase();

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    requestPermission();
  }

  const takePicture = async () => {
    if (!ref.current) return;
    
    // Take picture
    const photo: any = await ref.current.takePictureAsync();

    if (!photo?.uri) {
      console.log('Failed to take picture');
      return;
    }

    console.log("Original photo:", photo?.uri); // Log original image

    // Crop image as square
    const cropped = await picture.crop_square(photo.uri);

    if (cropped?.uri) {
      setUri(cropped.uri);
    }
    else {
      console.log('Image cropping failed')
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

  const diagnosePicture = async () => {
    setRunningModel(true);

    // Check if model is loaded, and load it if not
    try {
      const encoder = await onnx.load_model(modelEncoder);
      const decoder = await onnx.load_model(plantDecoder);

      if (uri) {
        // Load image into a tensor
        const inputTensor = await picture.image_to_tensor(uri);

        if (!inputTensor) {
          console.log('Cannot convert picture to pixel data');
          return;
        }

        console.log('Image pixels are loaded into a tensor');

        // Encode image
        const encoded = await onnx.run_model(encoder, inputTensor);

        // Decode image
        const decoded = await onnx.run_model(decoder, encoded);
        console.log(`${decoded.data}`)
      }
    }
    catch (e) {
      console.log(e);
      setRunningModel(false);
      throw e;
    }
    setRunningModel(false);
    router.push(`/IdentificationScreen?image=${encodeURIComponent(uri || '')}`);
  }

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
          {
            runningModel ?
            <ActivityIndicator color="white"/> :
            <TouchableOpacity>
              <Ionicons name="checkmark-circle-outline" size={30} color="white"  onPress={diagnosePicture}/>
            </TouchableOpacity>
          }
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
            position: "absolute", // Position relative to the screen
            top: "50%", // Position at the vertical center of the screen
            left: "0%", // Position at the horizontal center of the screen
            height: squareSize,
            width: squareSize,
            marginTop: -squareSize/2, // Shift up by half the size to center
            marginLeft: width*0.1, // Shift left by half the size to center
            //marginTop: -squareSize / 2, // Shift up by half the size to center
            //marginLeft: -squareSize  / 2, // Shift left by half the size to center
            borderWidth: 10,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      {uri ? renderPicture() : renderCamera()}
    </SafeAreaView>

  );
}
