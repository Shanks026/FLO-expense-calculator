import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import TrendUpIcon from '../assets/icons/Cards/trendingup.svg';
import TrendDownIcon from '../assets/icons/Cards/trendingdown.svg';
import colors from '../themes';

function ExpenseCard({totalIncome, totalExpense, totalAmount}) {
  const isPositiveTotal = parseFloat(totalIncome) > parseFloat(totalExpense);

  return (
    <View>
      <View
        style={{
          // backgroundColor: colors.tertiary,
          paddingVertical: 30,
          paddingHorizontal: 20,
          borderRadius: 20,
          marginTop: 3,
          flexDirection: 'col',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        {/* <Text style={{color: '#ffffff', fontSize: 20, fontWeight: 'bold'}}>
          ₹{totalAmount}
        </Text> */}
        <Text
          style={{
            color: colors.secondaryText,
            fontSize: 13,
            fontWeight: '400',
          }}>
          Balance
        </Text>
        <Text
          style={{
            color: isPositiveTotal ? colors.expPositive : colors.expNegative,
            fontSize: 28,
            fontWeight: 'bold',
            marginTop: 2,
          }}>
          {isPositiveTotal ? `+₹${totalAmount}` : `-₹${totalAmount}`}
        </Text>
      </View>
      <View style={styles.cardsRow}>
        <ExpenseCardItem
          title="Expenditure"
          amount={totalExpense}
          // amount={totalAmount}
          IconComponent={TrendUpIcon}
        />
        <ExpenseCardItem
          title="Income"
          amount={totalIncome}
          IconComponent={TrendDownIcon}
        />
      </View>
    </View>
  );
}

const ExpenseCardItem = ({title, amount, IconComponent}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <IconComponent width={20} height={20} style={styles.icon} />
    </View>
    <Text style={styles.cardAmount}>₹{amount}</Text>
  </View>
);

const styles = StyleSheet.create({
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: colors.tertiary,
    width: '50%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  icon: {
    marginLeft: 5,
  },
  cardTitle: {
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: '400',
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
});

export default ExpenseCard;
