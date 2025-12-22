import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const JoinNowPrompt = ({ onJoinPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Unlock Your Fashion World</Text>
        <Text style={styles.subtitle}>
          Join now to create your closets, curate looks, and add your favorite fits to cart. 
          Step into the exclusive side of style.
        </Text>

        <TouchableOpacity activeOpacity={0.8} onPress={onJoinPress}>
          <LinearGradient
            colors={['#C6A664', '#E3C888', '#F5E3B3']} // rich gold
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Join Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default JoinNowPrompt;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  inner: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: 'black',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 15,
    color: '#545454ff',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.3,
    width: width * 0.85,
    marginBottom: 30,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    shadowColor: '#C6A664',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#0a0a0a',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
