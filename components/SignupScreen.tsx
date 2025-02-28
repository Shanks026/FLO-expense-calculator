import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {signUp} from '../services/api';
import {StackNavigationProp} from '@react-navigation/stack';
import colors from '../themes';
type Props = {
  navigation: StackNavigationProp<any>;
};

const SignupScreen: React.FC<Props> = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert('Error', 'Please fill in all the fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      const newUser = await signUp(
        username,
        password,
        email,
        firstName,
        lastName,
      );
      Alert.alert('Success', 'Account created! Please log in.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Sign-up failed. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'column', alignItems: 'center'}}>
        <Text style={styles.title}>Welcome to FLO</Text>
        <Text style={styles.subtitle}>Your Personal Expense Calculator</Text>
      </View>
      <Text style={styles.subtitle}>Please Sign Up to continue</Text>
      <View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'column', width: '48%'}}>
            <Text style={styles.label}>First Name:</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="eg. Jacob"
              placeholderTextColor="#606060"
              style={[
                styles.input,
                focusedInput === 'firstName' && styles.inputFocused,
              ]}
              onFocus={() => setFocusedInput('firstName')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
          <View style={{flexDirection: 'column', width: '48%'}}>
            <Text style={styles.label}>Last Name:</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="eg. Joestar"
              placeholderTextColor="#606060"
              style={[
                styles.input,
                focusedInput === 'lastName' && styles.inputFocused,
              ]}
              onFocus={() => setFocusedInput('lastName')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
        </View>

        <Text style={styles.label}>Username:</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="eg. jake321"
          placeholderTextColor="#606060"
          style={[
            styles.input,
            focusedInput === 'username' && styles.inputFocused,
          ]}
          onFocus={() => setFocusedInput('username')}
          onBlur={() => setFocusedInput(null)}
        />

        <Text style={styles.label}>Email:</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={[
            styles.input,
            focusedInput === 'email' && styles.inputFocused,
          ]}
          placeholder="eg. jakestar@gmail.com"
          placeholderTextColor="#606060"
          onFocus={() => setFocusedInput('email')}
          onBlur={() => setFocusedInput(null)}
        />

        <Text style={styles.label}>Password:</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter password"
          placeholderTextColor="#606060"
          style={[
            styles.input,
            focusedInput === 'password' && styles.inputFocused,
          ]}
          onFocus={() => setFocusedInput('password')}
          onBlur={() => setFocusedInput(null)}
        />

        <Text style={styles.label}>Confirm Password:</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter Password"
          placeholderTextColor="#606060"
          secureTextEntry
          style={[
            styles.input,
            focusedInput === 'confirmPassword' && styles.inputFocused,
          ]}
          onFocus={() => setFocusedInput('confirmPassword')}
          onBlur={() => setFocusedInput(null)}
        />
      </View>
      <View>
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.actionText}>Terms and Conditions</Text>
          <Text
            style={styles.actionText}
            onPress={() => navigation.navigate('Login')}>
            Login
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
    // padding: 20,
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 22,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.tertiaryText,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: colors.secondary,
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
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginVertical: 15,
  },
  buttonText: {
    color: colors.blkText,
    fontSize: 16,
    fontWeight: '500',
    alignSelf: 'center',
  },
});

export default SignupScreen;
