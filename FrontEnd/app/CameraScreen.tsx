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
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

import useDatabase from '../hooks/useDatabase'
import * as picture from '../utils/picture'
import * as onnx from '../utils/onnx'
import * as mathlib from '../utils/mathlib'
import useLocalFiles from '../hooks/useLocalFiles'

export default function CmeraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const router = useRouter();
  const { plant, name } = useLocalSearchParams<{plant: string, name: string}>();
  const [runningModel, setRunningModel] = useState(false);
  const { width, height } = Dimensions.get("window");
  const squareSize = width * 0.8;
  const dir = useLocalFiles();
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
    //await FileSystem.deleteAsync(FileSystem.documentDirectory + 'database/database.db');
    //await FileSystem.deleteAsync(FileSystem.documentDirectory + 'database/database.db-wal');
    //await FileSystem.deleteAsync(FileSystem.documentDirectory + 'database/database.db-shm');

    // Check if model is loaded, and load it if not
    try {
      const encoder = await onnx.load_model(dir + 'models/encoder.ort');

      if (uri && db && dir) {
        // Load image into a tensor
        const inputTensor = await picture.image_to_tensor(uri);

        if (!inputTensor) {
          console.log('Cannot convert picture to pixel data');
          return;
        }

        console.log('Image pixels are loaded into a tensor');

        // Encode image
        const encoded = await onnx.run_model(encoder, inputTensor);
        
        // Select plant
        let plantID;
        let plantName;
        let plantModel;
        let statement;

        if (plant) {
          plantID = Number(plant);
          
          statement = await db.prepareAsync(
            'SELECT PlantName, PlantModelUri FROM Plants WHERE PlantID = ?'
          );
          try {
            const result = await statement.executeAsync<{PlantName: string, PlantModelUri: string}>([plant]);
            const row = await result.getFirstAsync();
            plantName = row?.PlantName;
            plantModel = dir + 'models/' + row?.PlantModelUri;
          }
          finally {
            await statement.finalizeAsync();
          }
        }
        else {
          const plant_decoder = await onnx.load_model(dir + 'models/plant_decoder.ort');
          const decoded = await onnx.run_model(plant_decoder, encoded);
          console.log(`Plant results: ${decoded.data}`);
          const plantIndex = mathlib.argmax(decoded.data);
          
          statement = await db.prepareAsync(
            'SELECT PlantID, PlantName, PlantModelUri FROM Plants WHERE PlantOutputIndex = ?'
          );
          try {
            const result = await statement.executeAsync<{PlantID: number, PlantName: string, PlantModelUri: string}>([plantIndex]);
            const row = await result.getFirstAsync();
            plantID = row?.PlantID;
            plantName = row?.PlantName;
            plantModel = dir + 'models/' + row?.PlantModelUri;
          }
          finally {
            await statement.finalizeAsync();
          }

          if (!plantID) {
            console.log('Cannot find the plant ID');
            setRunningModel(false);
            return;
          }
        }
        console.log(plantID);

        // Diagnose plant
        let plantClass;
        let plantClassCode;
        const disease_decoder = await onnx.load_model(plantModel);
        const decoded = await onnx.run_model(disease_decoder, encoded);
        const plantClassIndex = mathlib.argmax(decoded.data);
        console.log(decoded.data);

        statement = await db.prepareAsync(
          `SELECT PlantClassID, ClassCode FROM PlantClasses
          WHERE PlantID = ? AND PlantClassOutputIndex = ?`
        );
        
        try {
          const result = await statement.executeAsync<{PlantClassID: number, ClassCode: string}>([plantID, plantClassIndex]);
          const row = await result.getFirstAsync();
          plantClass = row?.PlantClassID;
          plantClassCode = row?.ClassCode;
          console.log(plantClass, plantClassCode, plantID, plantClassIndex);
        }
        finally {
          await statement.finalizeAsync();
        }

        if (!plantClass) {
          console.log('Cannot find the plant class');
          setRunningModel(false);
          return;
        }

        console.log(`Plant ${plantName} with class ${plantClassCode}`);

        // Copy picture and thumbnail to local directory
        const filename = picture.create_picture_filename();
        const pictureURI = dir + 'pictures/' + filename;
        await FileSystem.copyAsync({ from: uri, to: pictureURI });

        const thumbnail = await picture.create_thumbnail(uri);
        const thumbnailURI = dir + 'thumbnails/' + filename;
        await FileSystem.copyAsync({ from: thumbnail.uri, to: thumbnailURI });

        // Insert into Historique
        let historiqueId;
        statement = await db.prepareAsync(
          `INSERT INTO Historique (PlantID, PlantClassID, Timestamp, PictureURI, ThumbnailURI)
          VALUES (?, ?, DateTime('now'), ?, ?)
          RETURNING HistoriqueId`
        );
        try {
          const result = await statement.executeAsync<{HistoriqueId: number}>(
            [plantID, plantClass, pictureURI, thumbnailURI]
          );
          historiqueId = result.lastInsertRowId;
        }
        finally {
          await statement.finalizeAsync();
        }

        // Insert into HistoriqueResult
        statement = await db.prepareAsync(
          `INSERT INTO HistoriqueResult (HistoriqueId, PlantClassID, result)
          VALUES (?, ?, ?)`
        );
        try {
          for (let i = 0; i < decoded.data.length; i++) {
            const result = await statement.executeAsync(
              [historiqueId, plantClass, decoded.data[i]]
            );
          }
        }
        finally {
          await statement.finalizeAsync();
        }

        // Display Historique to the console
        statement = await db.prepareAsync(
          'SELECT HistoriqueId, PlantID, PlantClassID, Timestamp, PictureURI FROM Historique'
        );
        try {
          const result = await statement.executeAsync<{HistoriqueId: number, PlantID: Number, PlantClassID: number, Timestamp: string, PictureURI: string}>();
          for await (const row of result) {
            console.log(`${row.HistoriqueId}, ${row.PlantID}, ${row.PlantClassID}, ${row.Timestamp}, ${row.PictureURI}`);
          }
        }
        finally {
          await statement.finalizeAsync();
        }
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
          <Text className="text-2xl font-bold text-center text-[#ffffff]">
            {name || "Camera"}
          </Text>
          <View className="w-[30]" />
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
            {name || "Camera"}
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
