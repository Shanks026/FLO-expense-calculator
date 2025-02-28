import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Navigation from './Navigation';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Account from '../assets/icons/Sidebar/account.svg';
import Budget from '../assets/icons/Sidebar/budget.svg';
import Delete from '../assets/icons/Sidebar/delete.svg';
import Logout from '../assets/icons/Sidebar/logout.svg';
import Category from '../assets/icons/Sidebar/category.svg';
import colors from '../themes';
import Header from './Header';

interface Transaction {
  id: number;
  category: string;
  amount: number;
  type: 'Expense' | 'Income';
  color: string;
}

function Settings({navigation}: {navigation: any}) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [firstName, setfirstName] = useState<string | null>(null);
  const [lastName, setlastName] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const API_URL = 'http://172.30.66.99:3001';

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const id = await AsyncStorage.getItem('accountId');
        console.log('🔹 Retrieved accountId from AsyncStorage:', id);

        if (id) {
          setAccountId(id);

          const apiUrl = `  ${API_URL}/users?accountId=${id}`;
          console.log('🛠️ Fetching User with URL:', apiUrl);

          const userResponse = await axios.get(apiUrl);
          console.log('🟢 Full User Response:', userResponse.data); // Log response

          setfirstName(userResponse.data[0].firstName);
          setlastName(userResponse.data[0].lastName);

          if (userResponse.data.length > 0) {
            console.log('✅ Fetched User Data:', userResponse.data[0]); // Log first user
            setUsername(userResponse.data[0].username); // Store username
          } else {
            console.warn('⚠️ No user found for this accountId');
          }
        }
      } catch (error) {
        console.error('❌ Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchAccountId = async () => {
      try {
        const id = await AsyncStorage.getItem('accountId');
        console.log('Retrieved accountId from AsyncStorage:', id);
        if (id) {
          setAccountId(id);
        }
      } catch (error) {
        console.error('Error fetching accountId:', error);
      }
    };

    fetchAccountId();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('accountId');
      console.log('✅ Account ID removed from AsyncStorage');
      navigation.replace('Login'); // 🔄 Redirect to login
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!accountId) {
      console.warn('No account ID found.');
      return;
    }

    try {
      // Delete all expenses associated with the account
      const expenseResponse = await axios.get(
        `  ${API_URL}/expenses?accountId=${accountId}`,
      );
      const deleteExpensePromises = expenseResponse.data.map(
        (transaction: Transaction) =>
          axios.delete(`  ${API_URL}/expenses/${transaction.id}`),
      );
      await Promise.all(deleteExpensePromises);
      console.log('✅ All transactions deleted for accountId:', accountId);

      // Delete balance record
      const balanceResponse = await axios.get(
        `  ${API_URL}/balance?accountId=${accountId}`,
      );
      if (balanceResponse.data.length > 0) {
        await axios.delete(
          `  ${API_URL}/balance/${balanceResponse.data[0].id}`,
        );
        console.log('✅ Balance record deleted.');
      }

      // Delete the user account
      const userResponse = await axios.get(
        `  ${API_URL}/users?accountId=${accountId}`,
      );
      if (userResponse.data.length > 0) {
        await axios.delete(`  ${API_URL}/users/${userResponse.data[0].id}`);
        console.log('✅ User account deleted.');
      }

      // Clear AsyncStorage and log out
      await AsyncStorage.removeItem('accountId');
      console.log('✅ Account ID removed from AsyncStorage');

      navigation.replace('Login'); // Redirect to login
    } catch (error) {
      console.error('❌ Error deleting account:', error);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <SafeAreaView>
        <Header title="Settings" content="Choose your own preferences" />
        <View
          style={{
            padding: 20,
          }}>
          <View
            style={{
              flexDirection: 'row',
              // backgroundColor: '#191919',
              justifyContent: 'flex-start',
              marginVertical: 30,
            }}>
            <TouchableOpacity>
              <Image
                source={require('../assets/shanks.jpg')}
                style={styles.avatarMenu}
              />
            </TouchableOpacity>
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                marginLeft: 15,
              }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 5,
                }}>
                {firstName} {lastName}
              </Text>
              <Text style={{color: colors.secondaryText, fontSize: 16}}>
                {username}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.clickable}>
            <Account />
            <View>
              <Text style={styles.clickableText}>My Profile</Text>
              <Text style={styles.clickableSubText}>
                Change profile image, username, password
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clickable}>
            <Budget />
            <View>
              <Text style={styles.clickableText}>Appearance</Text>
              <Text style={styles.clickableSubText}>
                Change the appearance of the application
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clickable}>
            <Category />
            <View>
              <Text style={styles.clickableText}>Manage Categories</Text>
              <Text style={styles.clickableSubText}>
                Change profile image, username, password
              </Text>
            </View>
          </TouchableOpacity>
          <View>
            <TouchableOpacity
              style={styles.drawerButton}
              onPress={handleDeleteAccount}>
              <Text
                style={{fontSize: 14, fontWeight: 'bold', color: colors.text}}>
                Delete Account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: '#E30000',
                padding: 15,
                borderRadius: 50,
                alignItems: 'center',
                marginTop: 20,
              }}
              onPress={handleLogout}>
              <Text
                style={{color: '#E30000', fontSize: 14, fontWeight: 'bold'}}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* <Navigation navigation={navigation} /> */}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mainBg,
    padding: 20,
    justifyContent: 'space-between',
  },
  avatarMenu: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  drawerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginTop: 40,
    borderRadius: 30,
    backgroundColor: '#E30000',
  },

  clickable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 15,
  },
  clickableText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
  clickableSubText: {
    color: '#8C8C8C',
    marginTop: 3,
    fontSize: 12,
    marginLeft: 15,
  },
});

export default Settings;
