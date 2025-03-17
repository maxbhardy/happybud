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
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Asset } from 'expo-asset';
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ort from 'onnxruntime-react-native';

export default function CmeraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [recording, setRecording] = useState(false);
  const router = useRouter();
  const { plant } = useLocalSearchParams();
  const [model, setModel] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [runningModel, setRunningModel] = useState(false);

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    requestPermission();
  }

  const takePicture = async () => {
    const photo : any = await ref.current?.takePictureAsync();
    setUri(photo?.uri);
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

  const loadModel = async () => {
    if (model) {
      return model;
    }
    else {
      try {
        const assets = await Asset.loadAsync([require('../assets/models/tomato_model_2025_02_28_v2.ort')]);
        //const assets = await Asset.loadAsync([require('../assets/models/mnist.ort')]);
        const modelUri = assets[0]?.localUri;

        if (modelUri) {
          let myModel = await ort.InferenceSession.create(modelUri);
          setModel(myModel);
          console.log('Model is loaded');
          return myModel;
        }
        else {
          console.log('Cannot load the model', `${assets[0]}`);
          setModel(null);
          return null;
        }
      }
      catch (e) {
        console.log('Cannot load the model', `${e}`);
        setModel(null);
        throw e;
      }
    }
  };

  const runModel = async () => {
    setRunningModel(true);
    // Check if model is loaded, and load it if not
    try {
      let myModel = await loadModel();

      // Load image into a tensor
      const inputData = new Float32Array(224 * 224 * 3);
      // Fill array with image data
      const inputTensor = new ort.Tensor('float32', inputData, [224, 224, 3]);

      // Prepare model input
      const feeds = { l_x_: inputTensor };
      const fetches = await myModel.run(feeds);
      const output = fetches[myModel.outputNames[0]];

      if (!output) {
        console.log('Failed to get output from model inference');
        setRunResult(null);
      }
      else {
        console.log('Model inference has returned output', `output shape: ${output.dims}, output data: ${output.data}`);
        setRunResult(output);
      }
    }
    catch (e) {
      console.log(e);
      setRunResult(null);
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
            Souhaitez-vous soumettre la photo à l'algorithme ou la reprendre ?
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
              <Ionicons name="checkmark-circle-outline" size={30} color="white"  onPress={runModel}/>
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
