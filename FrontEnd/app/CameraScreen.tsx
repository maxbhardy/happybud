// Créé à partir de de https://github.com/expo/examples/blob/master/with-camera/App.tsx

import {
    CameraMode,
    CameraType,
    CameraView,
    FlashMode,
    useCameraPermissions,
  } from "expo-camera";
  import { useRef, useState } from "react";
  import { Button, Pressable, StyleSheet, Text, View, SafeAreaView } from "react-native";
  import { Image } from "expo-image";
  import { Ionicons } from "@expo/vector-icons";
  import { useRouter } from "expo-router";
  
  export default function CmeraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const ref = useRef<CameraView>(null);
    const [uri, setUri] = useState<string | null>(null);
    const [facing, setFacing] = useState<CameraType>("back");
    const [flash, setFlash] = useState<FlashMode>("off");
    const [recording, setRecording] = useState(false);
    const router = useRouter();
  
    if (!permission) {
      return null;
    }
  
    if (!permission.granted) {
      return (
        <SafeAreaView className="flex-1 bg-[#DFD8D1]">
          <View className="flex-1 align-center justify-center">
            <Text className="text-2x1 font-bold text-center text-[#1A3244]">
              Vous devez autorser l'utilisation de la caméra
            </Text>
              <Pressable onPress={requestPermission} className="flex-2 flex-row align-center justify-center">
                <Ionicons name="camera" color="#1A3244" size={64}/>
                <Text className="text-2x1 font-bold text-center text-[#1A3244] align-middle">
                  Donner l'autorisation
                </Text>
              </Pressable>
        </View>
        </SafeAreaView>
        
      );
    }
  
    const takePicture = async () => {
      const photo = await ref.current?.takePictureAsync();
      setUri(photo?.uri);
    };
  
    const recordVideo = async () => {
      if (recording) {
        setRecording(false);
        ref.current?.stopRecording();
        return;
      }
      setRecording(true);
      const video = await ref.current?.recordAsync();
      console.log({ video });
    };
  
    const toggleFacing = () => {
      setFacing((prev) => (prev === "back" ? "front" : "back"));
    };

    const toggleFlash = () => {
      setFlash((prev) => (prev === "off" ? "on" : "off"))
    }
  
    const renderPicture = () => {
      return (
        <View className="flex-1 px-[10] pt-5">
          <View className="flex-1 w-full items-center flex-row justify-between px-[30]">
            <Pressable>
              {<Ionicons name="arrow-back" size={30} color="white" onPress={() => router.push("/")}/>}
            </Pressable>
            <Text className="text-2 font-bold text-center text-[#ffffff]">
              Tomate
            </Text>
            <View className="w-30" />
          </View>
          <Image
            source={{ uri }}
            contentFit="contain"
            //style={{ width: 300, aspectRatio: 1 }}
            style={{flex: 5, width: "100%", height: "100%"}}
            //className="flex-6 w-full h-full"
          />
          <View className="flex-1 mx-8">
            <Text className="text-2 text-center text-[#ffffff] pt-10">
              Souhaitez-vous soumettre la photo à l'algorithme ou la reprendre ?
            </Text>
          </View>
          <View className="flex-1 w-full items-center flex-row justify-around">
            <Pressable onPress={() => setUri(null)} >
              <Ionicons name="arrow-undo-outline" size={30} color="white" />
            </Pressable>
            <Pressable>
              <Ionicons name="checkmark-circle-outline" size={30} color="white" />
            </Pressable>
          </View>
        </View>
      );
    };
  
    const renderCamera = () => {
      return (
        <View className="flex-1 px-[10] pt-5">
          <View className="flex-1 w-full items-center flex-row justify-between px-[30]">
            <Pressable>
              {<Ionicons name="arrow-back" size={30} color="white" onPress={() => router.push("/")}/>}
            </Pressable>
            <Text className="text-2 font-bold text-center text-[#ffffff]">
              Tomate
            </Text>
            <Pressable onPress={toggleFlash}>
              { flash === "off" ? (
                  <Ionicons name="flash-off" size={30} color="white"/>
                ) : (
                  <Ionicons name="flash" size={30} color="white"/>
                )
              }
            </Pressable>
          </View>
          <CameraView
            //className="flex-6 w-full h-full"
            style={{flex: 6, width: "100%", height: "100%"}}
            ref={ref}
            flash={flash}
            facing={facing}
            responsiveOrientationWhenOrientationLocked
          />
          <View className="flex-1 w-full items-center flex-row justify-between px-[30]">
            <Pressable>
              {<Ionicons name="image-outline" size={30} color="white"/>}
            </Pressable>
            <Pressable onPress={takePicture}>
              {({ pressed }) => (
                <View
                  style={[
                    styles.shutterBtn,
                    {
                      opacity: pressed ? 0.5 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.shutterBtnInner,
                      {
                        backgroundColor: "white",
                      },
                    ]}
                  />
                </View>
              )}
            </Pressable>
            <Pressable onPress={toggleFacing}>
              <Ionicons name="camera-reverse" size={32} color="white" />
            </Pressable>
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
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    shutterBtn: {
      backgroundColor: "transparent",
      borderWidth: 5,
      borderColor: "white",
      width: 75,
      height: 75,
      borderRadius: 45,
      alignItems: "center",
      justifyContent: "center",
    },
    shutterBtnInner: {
      width: 60,
      height: 60,
      borderRadius: 50,
    },
  });