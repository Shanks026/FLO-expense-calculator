import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navigation from './Navigation';

const API_URL = 'http://172.30.66.99:3001';

const categories = [
  {
    name: 'Food',
    backgroundColor: '#CC85FF',
    subtextColor: '#702378',
    progressBackground: '#8E44AD',
  },
  {
    name: 'Travel',
    backgroundColor: '#FFB650',
    subtextColor: '#84581C',
    progressBackground: '#D35400',
  },
  {
    name: 'Shopping',
    backgroundColor: '#55E0FF',
    subtextColor: '#2A7282',
    progressBackground: '#2471A3',
  },
  {
    name: 'Subscription',
    backgroundColor: '#FF3D6A',
    subtextColor: '#802037',
    progressBackground: '#A93226',
  },
  {
    name: 'Others',
    backgroundColor: '#3597FF',
    subtextColor: '#1A436E',
    progressBackground: '#1F618D',
  },
  {
    name: 'Transfer',
    backgroundColor: '#BBFF55',
    subtextColor: '#59772B',
    progressBackground: '#229954',
  },
];

const SummaryScreen = ({navigation}) => {
  const [categoryTotals, setCategoryTotals] = useState({});
  const [balance, setBalance] = useState('0');
  const [setBalanceValue, setSetBalanceValue] = useState('0');
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchAccountId = async () => {
      try {
        const id = await AsyncStorage.getItem('accountId');
        if (id) {
          fetchBalanceAndTransactions(id);
        }
      } catch (error) {
        console.error('Error fetching accountId:', error);
      }
    };
    fetchAccountId();
  }, []);

  const fetchBalanceAndTransactions = async id => {
    try {
      const balanceResponse = await axios.get(
        `${API_URL}/balance?accountId=${id}`,
      );
      let fetchedBalance =
        balanceResponse.data.length > 0
          ? parseFloat(balanceResponse.data[0].balance)
          : 0;
      setSetBalanceValue(fetchedBalance.toFixed(2));

      const transactionResponse = await axios.get(
        `${API_URL}/expenses?accountId=${id}`,
      );
      calculateTotals(transactionResponse.data, fetchedBalance);
      calculateCategoryTotals(transactionResponse.data);
    } catch (error) {
      console.error('Error fetching balance or transactions:', error);
    }
  };

  const calculateTotals = (data, fetchedBalance) => {
    let totalExpense = 0,
      totalIncome = 0;
    data.forEach(item =>
      item.type === 'Expense'
        ? (totalExpense += item.amount)
        : (totalIncome += item.amount),
    );
    const netDifference = totalIncome - totalExpense;
    setTotalExpense(totalExpense);
    setTotalIncome(totalIncome);
    setTotalAmount(Math.abs(netDifference));
    setBalance((fetchedBalance + netDifference).toFixed(2));
  };

  const calculateCategoryTotals = expenses => {
    const totals = categories.reduce(
      (acc, category) => ({...acc, [category.name]: 0}),
      {},
    );
    expenses.forEach(exp => {
      const categoryKey =
        categories.find(
          cat => cat.name.toLowerCase() === exp.category.trim().toLowerCase(),
        )?.name || 'Others';
      totals[categoryKey] += exp.amount;
    });
    setCategoryTotals(totals);
  };

  const balancePercentage =
    parseFloat(setBalanceValue) > 0
      ? (parseFloat(balance) / parseFloat(setBalanceValue)) * 100
      : 0;

  const clampedBalancePercentage = Math.max(
    0,
    Math.min(balancePercentage, 100),
  );

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Expense Summary</Text>
        <View style={[styles.categoryContainer, styles.balanceContainer]}>
          <View style={styles.headerRow}>
            <Text style={styles.categoryTitle}>Balance</Text>
          </View>
          <View style={styles.categoryInfo}>
            <View style={styles.amountRow}>
              <Text style={styles.categoryAmount}>₹{balance}</Text>
              <Text style={[styles.subtext, {color: '#56780C'}]}>
                {' '}
                of ₹{setBalanceValue}
              </Text>
            </View>
            <Text style={styles.percentageText}>
              {balancePercentage.toFixed(2)}%
            </Text>
          </View>
          <View style={[styles.progressBar, {backgroundColor: '#229954'}]}>
            <View
              style={[
                styles.progressFill,
                {width: `${clampedBalancePercentage}%`},
              ]}
            />
          </View>
        </View>
        <Text style={styles.title}>Category-wise Calculations</Text>
        <ScrollView style={styles.categoryScroll}>
          {categories.map(category => {
            const percentage =
              totalAmount > 0 && categoryTotals[category.name]
                ? (categoryTotals[category.name] / totalAmount) * 100
                : 0;

            const clampedPercentage = Math.max(0, Math.min(percentage, 100));

            return (
              <View
                key={category.name}
                style={[
                  styles.categoryContainer,
                  {backgroundColor: category.backgroundColor},
                ]}>
                <View style={styles.headerRow}>
                  <Text style={styles.categoryTitle}>{category.name}</Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#ffffff',
                      backgroundColor: '#000000',
                      borderRadius: 30,
                      paddingVertical: 5,
                      paddingHorizontal: 12,
                    }}>
                    View Records
                  </Text>
                </View>
                <View style={styles.categoryInfo}>
                  <View style={styles.amountRow}>
                    <Text style={styles.categoryAmount}>
                      ₹{categoryTotals[category.name]?.toFixed(2) || '0.00'}
                    </Text>
                    <Text
                      style={[styles.subtext, {color: category.subtextColor}]}>
                      {' '}
                      of ₹{totalAmount.toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.percentageText}>
                    {clampedPercentage.toFixed(2)}%
                  </Text>
                </View>
                <View
                  style={[
                    styles.progressBar,
                    {backgroundColor: category.progressBackground},
                  ]}>
                  <View
                    style={[
                      styles.progressFill,
                      {width: `${clampedPercentage}%`},
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>
      </ScrollView>
      {/* <Navigation navigation={navigation} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#0E0E0E'},
  title: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryContainer: {padding: 20, borderRadius: 15, marginBottom: 25},
  balanceContainer: {backgroundColor: '#B2F91B'},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between'},
  categoryTitle: {fontSize: 16, fontWeight: '500', color: '#000'},
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 25,
  },
  amountRow: {flexDirection: 'row', alignItems: 'flex-end'},
  categoryAmount: {fontSize: 24, fontWeight: 'bold', color: '#000'},
  subtext: {fontSize: 15, fontWeight: '500'},
  progressBar: {
    height: 8,
    width: '100%',
    borderRadius: 15,
    marginTop: 15,
    backgroundColor: '#E0E0E0', // Light grey background for empty progress
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000', // Black progress fill for ALL categories and balance
    borderRadius: 15,
    minWidth: 2, // Ensures visibility even for small percentages
  },
  categoryScroll: {maxHeight: 520},
  outerContainer: {flex: 1, backgroundColor: '#0E0E0E'},
  percentageText: {fontSize: 24, fontWeight: 'bold', color: '#000'},
});

export default SummaryScreen;
