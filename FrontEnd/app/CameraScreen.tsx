// Créé à partir de de https://github.com/expo/examples/blob/master/with-camera/App.tsx

import {
    CameraMode,
    CameraType,
    CameraView,
    useCameraPermissions,
  } from "expo-camera";
  import { useRef, useState } from "react";
  import { Button, Pressable, StyleSheet, Text, View, SafeAreaView } from "react-native";
  import { Image } from "expo-image";
  import { AntDesign } from "@expo/vector-icons";
  import { Feather } from "@expo/vector-icons";
  import { FontAwesome6 } from "@expo/vector-icons";
  
  export default function CmeraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const ref = useRef<CameraView>(null);
    const [uri, setUri] = useState<string | null>(null);
    const [facing, setFacing] = useState<CameraType>("back");
    const [recording, setRecording] = useState(false);
  
    if (!permission) {
      return null;
    }
  
    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={{ textAlign: "center" }}>
            We need your permission to use the camera
          </Text>
          <Button onPress={requestPermission} title="Grant permission" />
        </View>
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
  
    const renderPicture = () => {
      return (
        <View>
          <Image
            source={{ uri }}
            contentFit="contain"
            style={{ width: 300, aspectRatio: 1 }}
          />
          <Button onPress={() => setUri(null)} title="Take another picture" />
        </View>
      );
    };
  
    const renderCamera = () => {
      return (
        <View style={{flex: 1, paddingHorizontal: 10}}>
          <CameraView
            style={styles.camera}
            //className="flex-5 width-100% height-100%"
            ref={ref}
            facing={facing}
            responsiveOrientationWhenOrientationLocked
          />
          <View style={styles.shutterContainer}>
            <Pressable>
              {<AntDesign name="picture" size={30} color="white"/>}
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
              <FontAwesome6 name="rotate-left" size={30} color="white" />
            </Pressable>
          </View>
        </View>
      );
    };
  
    return (
      <SafeAreaView className="flex-1 bg-[#000000]">
        {/* Header */}
        <View className="px-5 pt-5 my-8">
          <Text className="text-2xl font-bold text-center text-[#ffffff]">
            Photo
          </Text>
        </View>
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
    camera: {
      flex: 6,
      width: "100%",
      height: "100%",
    },
    shutterContainer: {
      flex: 1,
      //position: "absolute",
      //bottom: 44,
      //left: 0,
      width: "100%",
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 30,
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