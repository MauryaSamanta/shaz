import React, { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Dimensions, Easing, findNodeHandle, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { useSelector } from 'react-redux';
import ClosetDets from '../components/ClosetDets';
import BlinkingShaz from '../components/LogoLoader';
import NewClosetSheet from '../components/NewCloset';
// import NewClosetSheet from '../components/NewCloset';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const AnimatedClosetCard = React.forwardRef(({ item, onPressIn, onPressOut, onPress }, ref) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    const tiltDirection = Math.random() > 0.5 ? 1 : -1;
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: tiltDirection * 0.07,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      })
    ]).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-57.3deg', '57.3deg'],
  });

  return (
    <TouchableOpacity
      ref={ref}
      onPress={onPress}
      onPressIn={() => { onPressIn && onPressIn(); }}
      onPressOut={() => { onPressOut && onPressOut(); }}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }, { rotate }],
          }
        ]}
      >
        {item.items.length > 0 && (
          <Image source={{ uri: `https://shaz-dsdo.onrender.com/v1/items/getimage?url=${encodeURIComponent(item?.items[0]?.image_url)}` }} style={styles.image} />
        )}
        <View style={styles.overlay}>
          <Text style={styles.text}>{item.name}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

const MoodBoardsScreen = () => {
  const user = useSelector((state) => state.auth.user);
  const sheetRef = useRef();
  const [closets, setClosets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedcloset, setselectedcloset] = useState(null);
  // track whether the closet sheet is open
  const [isClosetOpen, setIsClosetOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const [cardLayout, setCardLayout] = useState(null);
  const handleAddCloset = (closet) => {
    console.log(closet);
    setClosets(prev => [closet, ...prev]);
    // You can make API call here
  };

  useEffect(() => {
    const getclosets = async () => {
      setLoading(true);
      const response = await fetch(`https://shaz-dsdo.onrender.com/v1/closets/${user.user_id}`, {
        method: 'GET'
      });
      const returneddata = await response.json();
      setClosets(returneddata)
      setLoading(false);
      console.log(returneddata)
    }
    getclosets();
  }, [])

  const closetSheetRef = useRef();

  // When the closetSheetRef becomes available, wrap its close method so we can track closes that originate from inside the sheet
  useEffect(() => {
    const ref = closetSheetRef.current;
    if (ref && !ref.__closeWrapped) {
      const origClose = ref.close?.bind(ref);
      ref.close = (...args) => {
        if (origClose) origClose(...args);
        // ensure our state reflects closed sheet
        setIsClosetOpen(false);
      };
      // mark wrapped so we don't double-wrap
      ref.__closeWrapped = true;
    }
  }, [closetSheetRef.current]);

  // Back handler: only intercept when sheet is open
  useEffect(() => {
    const onBackPress = () => {
      if (isClosetOpen) {
        closeCloset();
        return true; // consumed
      }
      else if (sheetRef.current?.close) {
        sheetRef.current.close();
        return true; // consumed

      }
      return false; // let system handle (exit screen / app)
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isClosetOpen]);
  const openCloset = (item, cardRef) => {
    if (!cardRef) return;
    setIsClosetOpen(true)
    const nodeHandle = findNodeHandle(cardRef);
    UIManager.measure(nodeHandle, (x, y, width, height, pageX, pageY) => {
      setCardLayout({ x: pageX, y: pageY, width, height });
      setselectedcloset(item);
      anim.setValue(0);

      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: false,
        speed: 2,      // controls "snappiness"
        bounciness: 0,  // 0 = no bounce (sleek)
        // damping: 15,    // smooth settling
      }).start();
    });
  };

  const closeCloset = () => {
    setselectedcloset(null);
    Animated.timing(anim, {
      toValue: 0, // animate back to the card
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      // only reset state AFTER animation completes
      setIsClosetOpen(false);

      setCardLayout(null);

    });
  };



  // render item: set isClosetOpen true then open sheet
  const renderMoodboard = ({ item }) => {
    const cardRef = React.createRef();
    return (
      <AnimatedClosetCard
        ref={cardRef}
        item={item}
        onPress={() => openCloset(item, cardRef.current)}
      />
    );
  };

  const fullscreenStyle = cardLayout ? {
    position: "absolute",
    left: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [cardLayout.x, 0],
    }),
    top: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [cardLayout.y, 0],
    }),
    width: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [cardLayout.width, SCREEN_WIDTH],
    }),
    height: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [cardLayout.height, SCREEN_HEIGHT],
    }),
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "white",
    zIndex: 2000,
  } : {};

  const overlayOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  return (
    <View>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{
          flexDirection: 'row',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          marginTop: 20,
        }}>
          <Text style={[styles.title, { fontFamily: 'STIXTwoTextBold', fontSize: 28 }]}>
            My Closets
          </Text>

          <TouchableOpacity
            onPress={() => sheetRef.current?.open()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              display: 'flex',
              backgroundColor: 'black',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20
            }}
          >
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>+</Text>
          </TouchableOpacity>

          <NewClosetSheet ref={sheetRef} onAddCloset={handleAddCloset} />
          {/* <ClosetDetailsSheet ref={closetSheetRef} /> */}
          {/* {isClosetOpen&&(<ClosetDets visible={isClosetOpen} closetData={selectedcloset} onClose={()=>{setselectedcloset(null); setIsClosetOpen(false)}}/>)} */}
        </View>

        {loading ? (
          <BlinkingShaz />
        ) : closets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Create your own Closets</Text>
          </View>
        ) : (
          <FlatList
            data={closets}
            renderItem={renderMoodboard}
            keyExtractor={(item) => item.closet_id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            scrollEnabled={false}
            contentContainerStyle={styles.grid}
          />
        )}
      </ScrollView>
      {isClosetOpen && cardLayout && (
        <>
          <Animated.View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: "black",
              opacity: overlayOpacity,
              zIndex: 1999,   // below fullscreen card
            }}
          />
          <Animated.View style={fullscreenStyle}>
            <ClosetDets
              visible={isClosetOpen}
              closetData={selectedcloset}
              onClose={closeCloset}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 40,
    width: 400,
    zIndex: 1,

  },
  title: {
    color: 'black',
    fontSize: 24,
    // fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: 160,
    aspectRatio: 1.2,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 10,
    //backgroundColor: 'rgba(0,0,0,0.6)',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    color: 'gray',
    fontSize: 16,
  },
  grid: {
    paddingBottom: 400,
  },
});

export default MoodBoardsScreen;
