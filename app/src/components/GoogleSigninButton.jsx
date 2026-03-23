import React, { useRef, useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  View,
  Animated,
  ActivityIndicator,
} from "react-native";

const GoogleButton = ({ onPress }) => {

  const [loading,setLoading] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  const handlePress = async () => {

    if(loading) return;

    setLoading(true);

    Animated.sequence([

      Animated.parallel([
        Animated.timing(scaleAnim,{
          toValue:0.7,
          duration:200,
          useNativeDriver:true
        }),
        Animated.timing(opacityAnim,{
          toValue:0,
          duration:250,
          useNativeDriver:true
        })
      ]),

      Animated.timing(loaderOpacity,{
        toValue:1,
        duration:200,
        useNativeDriver:true
      })

    ]).start();

    try{
      await onPress();
    }catch(e){
      console.log(e);
    }

  };

  return (
    <View style={styles.wrapper}>

      {/* Button */}
      <Animated.View
        style={{
          opacity:opacityAnim,
          transform:[{scale:scaleAnim}]
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePress}
          style={styles.container}
        >

          <View style={styles.inner}>

            <View style={styles.iconContainer}>
              <Image
                source={require("../assets/images/google.png")}
                style={styles.icon}
              />
            </View>

            <Text style={styles.text}>
              Continue with Google
            </Text>

          </View>

        </TouchableOpacity>
      </Animated.View>

      {/* Spinner */}
      <Animated.View
        style={[
          styles.loader,
          {opacity:loaderOpacity}
        ]}
      >
        <ActivityIndicator size="large" color="black"/>
      </Animated.View>

    </View>
  );
};

const styles = StyleSheet.create({

  wrapper:{
    justifyContent:"center",
    alignItems:"center"
  },

  container:{
    backgroundColor:"black",
    borderRadius:30,
    paddingVertical:14,
    paddingHorizontal:22,
    elevation:8
  },

  inner:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center"
  },

  iconContainer:{
    marginRight:10
  },

  icon:{
    width:18,
    height:18,
    resizeMode:"contain"
  },

  text:{
    color:"white",
    fontSize:16,
    letterSpacing:0.5
  },

  loader:{
    position:"absolute",
    justifyContent:"center",
    alignItems:"center"
  }

});

export default GoogleButton;