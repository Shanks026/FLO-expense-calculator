import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

// Import category icons
import TravelIcon from '../assets/icons/HomepageCategory/travel.svg';
import TransferIcon from '../assets/icons/HomepageCategory/transfer.svg';
import FoodIcon from '../assets/icons/HomepageCategory/food.svg';
import SubscriptionIcon from '../assets/icons/HomepageCategory/subscriptions.svg';
import ShoppingIcon from '../assets/icons/HomepageCategory/shopping.svg';
import OthersIcon from '../assets/icons/HomepageCategory/others.svg';
import Income from '../assets/icons/HomepageCategory/income.svg';
import DeleteIcon from '../assets/icons/delete.svg';
import Header from './Header';
import colors from '../themes';

interface Transaction {
  id: number;
  category: string;
  amount: number;
  type: 'Expense' | 'Income';
  color: string;
  date: string;
}

const API_URL = 'http://172.30.66.99:3001';

const Transactions = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(
    null,
  );
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState('0.00');
  const [setBalanceValue, setSetBalanceValue] = useState('0.00');
  const [totalExpense, setTotalExpense] = useState('0.00');
  const [totalIncome, setTotalIncome] = useState('0.00');
  const [totalAmount, setTotalAmount] = useState('0.00');

  useEffect(() => {
    const fetchAccountId = async () => {
      const id = await AsyncStorage.getItem('accountId');
      if (id) {
        setAccountId(id);
        fetchTransactions(id);
      }
    };
    fetchAccountId();

    // Handle Back Press
    const backAction = () => {
      navigation.navigate('Home' as never); // Redirect to Home screen
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove(); // Cleanup event listener
  }, []);
  const fetchTransactions = async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/expenses?accountId=${id}`);
      const sortedTransactions = response.data.sort(
        (a: Transaction, b: Transaction) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setTransactions(sortedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    if (!accountId) return;
    try {
      await axios.delete(`${API_URL}/expenses/${transactionId}`);
      setTransactions(prev =>
        prev
          .filter(item => item.id !== transactionId)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
      );
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', {month: 'long'});
    return `${day} ${month}`;
  };

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Header
          title="Transactions"
          content="Track all your transaction here"
        />
        <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <View style={{marginTop: 30}} />
      <FlatList
        data={transactions}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() =>
              setSelectedTransaction(
                item.id === selectedTransaction ? null : item.id,
              )
            }>
            <View style={styles.transactionItem}>
              <View style={{flexDirection: 'row'}}>
                <View style={styles.iconContainer}>
                  {getCategoryIcon(item.category)}
                </View>
                <View style={{marginLeft: 12}}>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={{color: colors.tertiaryText, fontSize: 12}}>
                    {formatDate(item.date)}
                  </Text>
                </View>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={[
                    styles.amount,
                    {color: item.type === 'Expense' ? '#ffffff' : '#85EB53'},
                  ]}>
                  ₹{item.amount}
                </Text>
                {selectedTransaction === item.id && (
                  <TouchableOpacity
                    style={{marginLeft: 25}}
                    onPress={() => handleDeleteTransaction(item.id)}>
                    <DeleteIcon width={28} height={28} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions available</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 110,
    backgroundColor: '#0E0E0E',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  title: {fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20},
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },

  category: {color: '#fff', fontSize: 16, flex: 1, fontWeight: '500'},
  amount: {fontSize: 16, fontWeight: '500'},
  clearButton: {
    borderWidth: 1,
    borderColor: '#E30000',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {color: '#E30000', fontSize: 13, fontWeight: 'bold'},
});

export default Transactions;
