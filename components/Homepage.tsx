import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import TravelIcon from '../assets/icons/HomepageCategory/travel.svg';
import TransferIcon from '../assets/icons/HomepageCategory/transfer.svg';
import FoodIcon from '../assets/icons/HomepageCategory/food.svg';
import SubscriptionIcon from '../assets/icons/HomepageCategory/subscriptions.svg';
import ShoppingIcon from '../assets/icons/HomepageCategory/shopping.svg';
import OthersIcon from '../assets/icons/HomepageCategory/others.svg';
import Income from '../assets/icons/HomepageCategory/income.svg';
// import Delete from '../assets/icons/delete.svg';

//sidebarIcons
import Account from '../assets/icons/Sidebar/account.svg';
import Budget from '../assets/icons/Sidebar/budget.svg';
import Delete from '../assets/icons/Sidebar/delete.svg';
import Logout from '../assets/icons/Sidebar/logout.svg';
import Category from '../assets/icons/Sidebar/category.svg';

import Navigation from './Navigation';
import axios from 'axios';
import ExpenseCard from './ExpenseCard';
import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Settings from './Settings';
import SettingsIcon from '../assets/icons/Sidebar/settings.svg';
import Header from './Header';
import BalanceCard from './BalanceCard';
import {ScrollView} from 'react-native-gesture-handler';
import colors from '../themes';

interface Transaction {
  id: number;
  category: string;
  amount: number;
  type: 'Expense' | 'Income';
  color: string;
}

const {width, height} = Dimensions.get('window');

const Homepage = ({navigation}: {navigation: any}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [balanceInput, setBalanceInput] = useState<string>('');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0'); // Default to "0"
  const [setBalanceValue, setSetBalanceValue] = useState<string>('0'); // Original set balance
  const [username, setUsername] = useState<string | null>(null);
  const [firstName, setfirstName] = useState<string | null>(null);
  const [lastName, setlastName] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerAnimation = useRef(new Animated.Value(-width * 0.7)).current;
  const [isFocused, setIsFocused] = useState(false);

  const API_URL = 'http://172.30.66.99:3001';

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

  useFocusEffect(
    useCallback(() => {
      if (accountId) {
        fetchBalanceAndTransactions();
      }
    }, [accountId]),
  );

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const id = await AsyncStorage.getItem('accountId');
        console.log('🔹 Retrieved accountId from AsyncStorage:', id);

        if (id) {
          setAccountId(id);

          const apiUrl = `${API_URL}/users?accountId=${id}`;
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

  const toggleDrawer = () => {
    if (drawerVisible) {
      Animated.timing(drawerAnimation, {
        toValue: -width * 0.7,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setDrawerVisible(false));
    } else {
      setDrawerVisible(true);
      Animated.timing(drawerAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const fetchBalanceAndTransactions = async () => {
    if (!accountId) return;
    try {
      const balanceResponse = await axios.get(
        `${API_URL}/balance?accountId=${accountId}`,
      );
      let fetchedBalance = 0;

      if (balanceResponse.data.length > 0) {
        fetchedBalance = parseFloat(balanceResponse.data[0].balance);
        setSetBalanceValue(fetchedBalance.toFixed(2)); // Store the original set balance
      } else {
        console.warn('No balance record found, setting to 0');
        setSetBalanceValue('0.00'); // Fallback for set balance
      }

      const transactionResponse = await axios.get(
        `${API_URL}/expenses?accountId=${accountId}`,
      );
      const fetchedTransactions = transactionResponse.data;

      setTransactions(fetchedTransactions);

      calculateTotals(fetchedTransactions, fetchedBalance);
    } catch (error) {
      console.error('Error fetching balance or transactions:', error);
    }
  };

  const calculateTotals = (
    data: Transaction[],
    fetchedBalance: number | null,
  ) => {
    let totalExpense = 0;
    let totalIncome = 0;

    data.forEach(item => {
      if (item.type === 'Expense') {
        totalExpense += item.amount;
      } else if (item.type === 'Income') {
        totalIncome += item.amount;
      }
    });

    const calculatedTotalAmount = Math.abs(totalExpense - totalIncome);

    setTotalExpense(totalExpense.toFixed(2));
    setTotalIncome(totalIncome.toFixed(2));
    setTotalAmount(calculatedTotalAmount.toFixed(2));

    if (fetchedBalance !== null && fetchedBalance > 0) {
      const adjustedBalance = (
        fetchedBalance +
        (totalIncome - totalExpense)
      ).toFixed(2);
      setBalance(adjustedBalance);
    } else {
      setBalance(null); // Hide balance if it's not set
    }
  };

  const categoryOrderRef = useRef<string[]>([
    'Food',
    'Travel',
    'Transfer',
    'Shopping',
    'Subscription',
    'Others',
  ]);

  const calculateCategoryExpenses = () => {
    let categoryTotals: Record<string, number> = {
      Food: 0,
      Travel: 0,
      Transfer: 0,
      Shopping: 0,
      Subscription: 0,
      Others: 0,
    };

    transactions.forEach(transaction => {
      if (
        transaction.type === 'Expense' &&
        categoryTotals.hasOwnProperty(transaction.category)
      ) {
        categoryTotals[transaction.category] += transaction.amount;
      }
    });

    let categories = Object.keys(categoryTotals).map(category => ({
      category,
      amount: categoryTotals[category],
      percentage:
        Number(totalExpense) > 0
          ? Math.floor((categoryTotals[category] / Number(totalExpense)) * 100)
          : 0,
      colors: categoryColors[category],
    }));

    // Sort categories based on the latest transaction date
    categories.sort((a, b) => {
      const latestA = transactions
        .filter(t => t.category === a.category)
        .reduce(
          (latest, t) =>
            new Date(t.date) > new Date(latest.date) ? t : latest,
          {date: '1970-01-01'},
        );

      const latestB = transactions
        .filter(t => t.category === b.category)
        .reduce(
          (latest, t) =>
            new Date(t.date) > new Date(latest.date) ? t : latest,
          {date: '1970-01-01'},
        );

      return (
        new Date(latestB.date).getTime() - new Date(latestA.date).getTime()
      );
    });

    return categories;
  };

  const handleSaveBalance = async () => {
    const newBalance = parseFloat(balanceInput);
    if (isNaN(newBalance) || !accountId) return;

    try {
      const response = await axios.get(
        `${API_URL}/balance?accountId=${accountId}`,
      );

      if (response.data.length > 0) {
        const balanceId = response.data[0].id;

        await axios.put(`${API_URL}/balance/${balanceId}`, {
          accountId,
          balance: newBalance,
        });

        setBalance(newBalance.toString());
      } else {
        await axios.post(`${API_URL}/balance`, {
          accountId,
          balance: newBalance,
        });
        setBalance(newBalance.toString());
      }

      fetchBalanceAndTransactions();
    } catch (error) {
      console.error('Error updating balance:', error);
    }

    setModalVisible(false);
  };

  const handleClearAll = async () => {
    if (!accountId) return;

    try {
      // Fetch and delete all transactions
      const response = await axios.get(
        `${API_URL}/expenses?accountId=${accountId}`,
      );
      const deletePromises = response.data.map((transaction: Transaction) =>
        axios.delete(`${API_URL}/expenses/${transaction.id}`),
      );

      await Promise.all(deletePromises);
      console.log('All transactions deleted for accountId:', accountId);

      // Reset transactions and balances in the UI
      setTransactions([]);
      setTotalExpense('0.00');
      setTotalIncome('0.00');
      setTotalAmount('0.00');
      setBalance('0.00'); // Reset calculated balance
      setSetBalanceValue('0.00'); // Directly reset set balance

      // Fetch balance record
      const balanceResponse = await axios.get(
        `${API_URL}/balance?accountId=${accountId}`,
      );

      if (balanceResponse.data.length > 0) {
        const balanceId = balanceResponse.data[0].id;

        // Update balance to 0 in the backend
        await axios.patch(`${API_URL}/balance/${balanceId}`, {
          balance: 0.0,
        });

        console.log('Balance updated to 0 in the backend.');
      }
    } catch (error) {
      console.error(
        'Error deleting transactions and resetting balance:',
        error,
      );
    }
  };

  const categoryColors = {
    Food: {bgColor: '#CC85FF', percentageBg: '#31094D', progressBg: '#A464D2'},
    Travel: {
      bgColor: '#FFB650',
      percentageBg: '#4C310A',
      progressBg: '#CD8F38',
    },
    Transfer: {
      bgColor: '#BBFF55',
      percentageBg: '#2B4109',
      progressBg: '#91D728',
    },
    Shopping: {
      bgColor: '#55E0FF',
      percentageBg: '#093D48',
      progressBg: '#34C0DF',
    },
    Subscription: {
      bgColor: '#FF3D6A',
      percentageBg: '#4C0A19',
      progressBg: '#D72A53',
    },
    Others: {
      bgColor: '#3597FF',
      percentageBg: '#082443',
      progressBg: '#2477D0',
    },
  };

  const categoryExpenses = calculateCategoryExpenses();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Travel':
        return <TravelIcon />;
      case 'Transfer':
        return <TransferIcon />;
      case 'Food':
        return <FoodIcon />;
      case 'Subscription':
        return <SubscriptionIcon />;
      case 'Shopping':
        return <ShoppingIcon />;
      case 'Others':
        return <OthersIcon />;
      case 'Income':
        return <Income />;
      default:
        return null;
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('accountId');
      console.log('✅ Account ID removed from AsyncStorage');
      navigation.replace('Login'); // 🔄 Redirect to login
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Header
          title={`Hello ${firstName || 'Guest'}!`}
          content="Here is your financial summary"
        />
        <TouchableOpacity onPress={toggleDrawer}>
          <Image
            source={require('../assets/shanks.jpg')}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <View>
        <BalanceCard
          balance={balance}
          totalLimit={parseFloat(setBalanceValue)}
          setModalVisible={setModalVisible}
          totalAmount={totalAmount}
        />

        {!viewAll && (
          <ExpenseCard
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            totalAmount={totalAmount}
            balance={balance}
            handleClearAll={handleClearAll}
          />
        )}
      </View>

      {/*Category Cards*/}
      <View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            // backgroundColor: '#ffffff',
            alignItems: 'center',
            marginBottom: 15,
          }}>
          <Text style={styles.sectionTitle}>Category Split</Text>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={handleClearAll}>
              <Text style={styles.buttonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewAllButton, {marginLeft: 10}]}
              onPress={() => navigation.navigate('SummaryScreen')}>
              <Text style={styles.buttonText}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{flexDirection: 'row'}}>
            {categoryExpenses.map(({category, amount, percentage, colors}) => (
              <View
                key={category}
                style={{
                  backgroundColor: colors.bgColor,
                  width: 175,
                  padding: 18,
                  borderRadius: 20,
                  marginRight: 3,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <Text
                    style={{
                      color: '#000000',
                      fontWeight: '500',
                      fontSize: 15,
                    }}>
                    {category}
                  </Text>
                  <Text
                    style={{
                      color: '#ffffff',
                      fontWeight: '500',
                      fontSize: 12,
                      backgroundColor: colors.percentageBg,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 30,
                    }}>
                    {percentage}%
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    marginBottom: 10,
                  }}>
                  <Text
                    style={{
                      color: '#000000',
                      fontWeight: 'bold',
                      fontSize: 20,
                    }}>
                    ₹{amount}
                  </Text>
                  <Text
                    style={{
                      marginLeft: 4,
                      fontWeight: '500',
                      color: '#000000',
                      opacity: 0.5,
                    }}>
                    of ₹{Math.round(totalExpense)}
                  </Text>
                </View>

                <View
                  style={{
                    height: 5,
                    borderRadius: 30,
                    backgroundColor: colors.progressBg,
                    overflow: 'hidden',
                  }}>
                  <View
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      backgroundColor: 'black',
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      {/* <View style={styles.transactionsContainer}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            // marginBottom: 10,
            paddingHorizontal: 10,
          }}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={handleClearAll}>
              <Text style={styles.buttonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewAllButton, {marginLeft: 10}]}
              onPress={() => setViewAll(!viewAll)}>
              <Text style={styles.buttonText}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View>
          {recentTransactions.length === 0 ? (
            <Text style={styles.noTransactionsText}>No transactions yet</Text>
          ) : (
            <FlatList
              data={viewAll ? transactions : recentTransactions}
              keyExtractor={item => item.id.toString()}
              style={{maxHeight: viewAll ? '100%' : 300}} // Expand height when viewing all
              renderItem={({item}) => (
                <View style={styles.transactionItem}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor: item.color,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 10,
                        },
                      ]}>
                      <Text>{getCategoryIcon(item.category)}</Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 14,
                          fontWeight: '400',
                        }}>
                        {item.category}
                      </Text>
                    </View>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        {
                          color:
                            item.type === 'Expense' ? '#ffffff' : '#ffffff',
                        },
                      ]}>
                      {item.type === 'Income' ? '+' : '-'} ₹{item.amount}
                    </Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View> */}

      <TouchableOpacity
        onPress={() => navigation.navigate('AddExpense')}
        style={{
          backgroundColor: colors.secondary,
          paddingVertical: 15,
          paddingHorizontal: 20,
          borderRadius: 50,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{color: colors.blkText, fontWeight: 'bold', fontSize: 14}}>
          Add Expense
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Set Balance</Text>
            <TextInput
              style={[styles.input, isFocused && styles.inputFocused]}
              placeholder="Enter Amount"
              placeholderTextColor="#A5A5A5"
              keyboardType="numeric"
              value={balanceInput}
              onChangeText={setBalanceInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}>
                <Text
                  style={{color: colors.text, fontWeight: '500', fontSize: 14}}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveBalance}
                style={styles.saveButton}>
                <Text
                  style={{
                    color: colors.blkText,
                    fontWeight: '500',
                    fontSize: 14,
                  }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {drawerVisible && (
        <TouchableWithoutFeedback onPress={toggleDrawer}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      {/* Drawer */}
      <Animated.View
        style={[styles.drawer, {transform: [{translateX: drawerAnimation}]}]}>
        <View>
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              padding: 10,
              marginBottom: 30,
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
                alignItems: 'center',
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
                {username || 'Guest'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.drawerButton}>
            <Budget />
            <Text style={styles.drawerButtonText}>Budget Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.drawerButton}
            onPress={() => navigation.navigate('Settings')}>
            <SettingsIcon />
            <Text style={styles.drawerButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
        <View style={{marginTop: 390}}>
          <TouchableOpacity style={styles.drawerButton} onPress={handleLogout}>
            <Logout />
            <Text style={styles.drawerButtonTextRed}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* <Navigation navigation={navigation} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mainBg,
    paddingBottom: 110,
    padding: 20,
    justifyContent: 'space-between',
  },
  avatar: {width: 50, height: 50, borderRadius: 50},
  avatarMenu: {
    width: 70,
    height: 70,
    borderRadius: 50,
    marginBottom: 20,
    marginTop: 40,
  },
  greeting: {color: colors.text, fontSize: 22, fontWeight: 500},
  subtext: {color: '#aaa', fontSize: 12, marginTop: 2},
  button: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 50,
  },
  buttonText: {color: colors.text, fontWeight: '500', fontSize: 12},

  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 3,
  },
  dateRange: {color: '#ccc', fontSize: 12, marginBottom: 10},
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    width: 350,
    backgroundColor: colors.mainBg,
    padding: 20,
    borderRadius: 20,
    paddingVertical: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.inputBg, // Background color
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 30,
    color: colors.text, // Text color
    fontSize: 14,
    borderWidth: 1,
    marginTop: 20,
    borderColor: 'transparent', // Default no border
  },

  inputFocused: {
    borderColor: colors.secondary, // Focused border color
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  cancelButton: {
    padding: 18,
    // borderWidth: 1,
    backgroundColor: colors.tertiary,
    borderRadius: 30,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: colors.secondary,
    padding: 18,
    borderRadius: 30,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderColor: '#373737',
    borderWidth: 1,
  },

  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    // backgroundColor: '#191919',
    borderRadius: 15,
    marginTop: 8,
  },
  transactionsContainer: {
    // backgroundColor: '#ffffff',
    // paddingVertical: 15,
    borderRadius: 15,
    height: 175,
    // flex: 1,
    // marginBottom: 20,
    overflow: 'hidden',
  },
  transactionAmount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  noTransactionsText: {
    color: colors.tertiaryText,
    fontSize: 16,
    textAlign: 'center',
    // alignSelf: 'center',
    marginTop: 70,
  },
  logoutButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  transactionList: {
    flexGrow: 1,
  },
  iconCircle: {width: 30, height: 30, borderRadius: 15},
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.7,
    height: height,
    backgroundColor: colors.mainBg,
    zIndex: 2000,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 2, height: 0},
    shadowRadius: 8,
    elevation: 15,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height, // Ensures it covers the full screen
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },

  drawerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  drawerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 15,
  },
  drawerButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
  drawerButtonTextRed: {
    color: '#EA3323',
    fontSize: 16,
    marginLeft: 15,
    fontWeight: 500,
  },
  // balanceContainer: {
  //   padding: 20,
  //   backgroundColor: colors.mainBg,
  //   borderRadius: 15,
  //   marginBottom: 20,
  // },
});

export default Homepage;
