import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal
} from 'react-native';
import { useSelector } from 'react-redux';
import { API_BASE_URL } from '../config/api';

const { height } = Dimensions.get('window');

const NewClosetSheet = forwardRef(({ onAddCloset }, ref) => {

  const [closetName, setClosetName] = useState('');
  const [visible, setVisible] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const [loading, setloading] = useState(false);

  const open = () => {
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
  };

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  const handleSubmit = async () => {
    try {
      setloading(true);

      const data = {
        user_id: user.user_id,
        name: closetName
      };

      const response = await fetch(
        `${API_BASE_URL}/v1/closets/create/`,
        {
          method: 'POST',
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(data)
        }
      );

      const returneddata = await response.json();

      const newcloset = {
        id: returneddata.closet_id,
        closet_id: returneddata.closet_id,
        name: returneddata.name,
        items: returneddata.items
      };

      onAddCloset(newcloset);

      setloading(false);
      setClosetName('');
      close();

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <View style={styles.overlay}>

        <View style={styles.modalBox}>

          <TouchableOpacity onPress={close} style={styles.cross}>
            <Text style={{ fontSize: 20 }}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Creating New Closet</Text>

          <TextInput
            placeholder="Enter closet name"
            placeholderTextColor="grey"
            value={closetName}
            onChangeText={setClosetName}
            style={styles.input}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.addButton}
            disabled={!closetName}
          >
            {!loading ? (
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                Add Closet
              </Text>
            ) : (
              <ActivityIndicator size="small" color="#fff" />
            )}
          </TouchableOpacity>

        </View>

      </View>
    </Modal>
  );
});

export default NewClosetSheet;

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },

  cross: {
    position: 'absolute',
    top: 15,
    right: 20,
    zIndex: 10,
  },

  label: {
    fontSize: 16,
    marginBottom: 10,
    marginTop: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },

  addButton: {
    backgroundColor: 'black',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },

});