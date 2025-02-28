import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import colors from '../themes';

const LoginScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const API_URL = 'http://172.30.66.99:3001';

  const handleLogin = async () => {
    try {
      const response = await axios.get(`${API_URL}/users?username=${username}`);
      console.log('API Response:', response.data); // Log full API response

      const user = response.data[0];

      if (user && user.password === password) {
        await AsyncStorage.setItem('userId', String(user.id)); // Store user ID

        if (user?.accountId) {
          await AsyncStorage.setItem('accountId', String(user.accountId)); // Store account ID if available
        } else {
          console.warn('Account ID is missing in API response'); // Log warning if missing
        }

        navigation.replace('Main');
        // Navigate to Home screen
      } else {
        Alert.alert('Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'column', alignItems: 'center'}}>
        <Text
          style={{
            fontSize: 22,
            color: '#ffffff',
            fontWeight: '500',
            marginBottom: 5,
          }}>
          Welcome to FLO
        </Text>
        <Text style={{fontSize: 12, color: '#B4B4B4'}}>
          Your Personal Expense Calculator
        </Text>
      </View>
      <Text style={{fontSize: 14, color: '#B4B4B4', alignSelf: 'center'}}>
        Please Login to continue
      </Text>
      <View>
        <Text style={styles.label}>Username:</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="eg. jake123"
          placeholderTextColor="#606060"
          style={[styles.input, isUsernameFocused && styles.inputFocused]}
          onFocus={() => setIsUsernameFocused(true)}
          onBlur={() => setIsUsernameFocused(false)}
        />

        <Text style={[styles.label, {marginTop: 25}]}>Password:</Text>

        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="eg. wordswap123"
          placeholderTextColor="#606060"
          style={[styles.input, isPasswordFocused && styles.inputFocused]}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
        />
      </View>

      <View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            // marginBottom: 15,
          }}>
          <Text style={styles.actionText}>Forgot Password?</Text>
          <Text
            style={styles.actionText}
            onPress={() => navigation.navigate('Signup')}>
            New User? Register
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mainBg,
    justifyContent: 'space-between',
    paddingVertical: 200,
    paddingHorizontal: 25,
  },
  input: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 30,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: colors.secondary, // Focused border color
  },
  actionText: {
    color: colors.secondary,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: colors.secondary,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 50,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  buttonText: {
    color: colors.blkText,
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  footerText: {color: '#fff', fontSize: 16},
});

export default LoginScreen;
