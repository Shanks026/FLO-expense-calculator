import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Keyboard,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TravelIcon from '../assets/icons/categories/travel.svg';
import TransferIcon from '../assets/icons/categories/transfer.svg';
import FoodIcon from '../assets/icons/categories/food.svg';
import SubscriptionIcon from '../assets/icons/categories/subscriptions.svg';
import ShoppingIcon from '../assets/icons/categories/shopping.svg';
import OthersIcon from '../assets/icons/categories/others.svg';
import Navigation from './Navigation';
import Header from './Header';
import {Animated} from 'react-native';
import colors from '../themes';

const ExpenseTracker = ({navigation}) => {
  const [selectedType, setSelectedType] = useState<'Expense' | 'Income'>(
    'Expense',
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const switchAnim = useRef(new Animated.Value(0)).current; // Animated value
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const API_URL = 'http://172.30.66.99:3001';

  const categories = [
    {name: 'Travel', icon: TravelIcon},
    {name: 'Transfer', icon: TransferIcon},
    {name: 'Food', icon: FoodIcon},
    {name: 'Subscription', icon: SubscriptionIcon},
    {name: 'Shopping', icon: ShoppingIcon},
    {name: 'Others', icon: OthersIcon},
  ];

  useEffect(() => {
    const fetchAccountId = async () => {
      const id = await AsyncStorage.getItem('accountId');
      if (id) setAccountId(id);
    };
    fetchAccountId();
  }, []);

  useEffect(() => {
    Animated.timing(switchAnim, {
      toValue: selectedType === 'Expense' ? 0 : 1,
      duration: 200, // Smooth transition
      useNativeDriver: false,
    }).start();
  }, [selectedType]);

  useEffect(() => {
    if (selectedType === 'Income') {
      setSelectedCategory('Income');
    } else {
      setSelectedCategory(null);
    }
  }, [selectedType]);

  const handleSubmit = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount.');
      return;
    }
    if (!accountId) {
      Alert.alert('Error', 'User account not found. Please log in again.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      Alert.alert('Error', 'Invalid amount entered.');
      return;
    }
    const expenseData = {
      accountId,
      amount: parsedAmount,
      type: selectedType,
      category: selectedCategory,
      date: new Date().toISOString(),
    };
    try {
      await axios.post(`${API_URL}/expenses`, expenseData);
      setTimeout(() => navigation.navigate('Main'), 500); // Navigate to Home instead of goBack
    } catch (error) {
      Alert.alert('Error', 'Failed to save expense. Check server logs.');
    }
  };

  const categoryColors = {
    Food: '#CC85FF',
    Travel: '#FFB650',
    Shopping: '#55E0FF',
    Transfer: '#BBFF55',
    Subscription: '#FF3D6A',
    Others: '#3597FF',
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Keep Header inside the main container */}
        <Header
          title="Add Expense"
          content="Enter an amount and choose a category"
        />
        <View style={styles.toggleContainer}>
          <Animated.View
            style={[
              styles.switchBackground,
              {
                left: switchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '50%'], // Move between Expense & Income
                }),
              },
            ]}
          />
          {['Expense', 'Income'].map((type, index) => (
            <TouchableOpacity
              key={type}
              style={styles.toggleButton}
              onPress={() => setSelectedType(type)}>
              <Text
                style={[
                  styles.toggleText,
                  selectedType === type && styles.selectedText,
                ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={{marginTop: 25}}>
            <Text style={styles.label}>Amount *</Text>
            <TextInput
              style={[styles.input, isFocused && styles.inputFocused]}
              placeholder="Enter Amount"
              placeholderTextColor="#A5A5A5"
              keyboardType="numeric"
              value={amount}
              onChangeText={text =>
                /^[0-9]*\.?[0-9]*$/.test(text) && setAmount(text)
              }
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </View>

          {selectedType === 'Expense' && (
            <View style={{marginTop: 25}}>
              <Text style={styles.label}>Select Category *</Text>

              <View style={styles.categoryContainer}>
                {categories.map(({name, icon: Icon}) => {
                  const isSelected = selectedCategory === name;
                  const categoryColor = categoryColors[name] || colors.text; // Default color

                  return (
                    <TouchableOpacity
                      key={name}
                      style={[
                        styles.categoryBox,
                        {
                          backgroundColor: isSelected
                            ? categoryColor
                            : colors.mutedBg,
                        },
                      ]}
                      onPress={() => setSelectedCategory(name)}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Icon
                          width={22}
                          height={22}
                          color={isSelected ? colors.blkText : categoryColor} // Use color instead of fill
                        />
                        <Text
                          style={[
                            styles.categoryText,
                            {
                              color: isSelected
                                ? colors.blkText
                                : categoryColor, // Change text color dynamically
                              marginLeft: 8,
                            },
                          ]}>
                          {name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Add {selectedType}</Text>
        </TouchableOpacity>

        {/* <Navigation navigation={navigation} /> */}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mainBg,
    paddingBottom: 90,
    padding: 20,
  },
  scrollContainer: {},
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 20,
  },
  label: {fontSize: 15, color: colors.text, marginBottom: 12},
  input: {
    backgroundColor: colors.inputBg, // Background color
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 30,
    color: colors.text, // Text color
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'transparent', // Default no border
  },

  inputFocused: {
    borderColor: colors.secondary, // Focused border color
  },

  // selectedToggle: {borderColor: '#B2F91B'},

  // selectedCategory: {borderColor: '#B2F91B'},

  // selectedCategoryText: {color: '#ffffff'},
  button: {
    backgroundColor: colors.secondary,
    padding: 15,
    alignItems: 'center',
    borderRadius: 50,
    marginBottom: 25,
  },
  buttonText: {fontSize: 14, color: '#000', fontWeight: 'bold'},
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.tertiary,
    borderRadius: 50,
    marginTop: 25,
  },
  switchBackground: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 50,
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 50,
    zIndex: 2, // Ensure text is above switch
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.tertiaryText, // Default inactive color
  },
  selectedText: {
    color: colors.blkText, // Active text color
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryBox: {
    width: '49%',
    paddingVertical: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tertiary,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ExpenseTracker;
