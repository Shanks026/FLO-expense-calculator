import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import MenuIcon from '../assets/icons/Navigation/transactions.svg';
import AddIcon from '../assets/icons/Navigation/home.svg';
import BarIcon from '../assets/icons/Navigation/chart.svg';
import Category from '../assets/icons/Navigation/category.svg';
import Settings from '../assets/icons/Navigation/settings.svg';

const Navigation = ({navigation}) => {
  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => navigation.navigate('AnalyticsScreen')}>
        <Category width={24} height={24} />
      </TouchableOpacity>
      <TouchableOpacity>
        <MenuIcon
          width={24}
          height={24}
          onPress={() => navigation.navigate('SummaryScreen')}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('AddExpense')}>
        <AddIcon width={24} height={24} />
      </TouchableOpacity>
      <TouchableOpacity>
        <BarIcon width={24} height={24} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
        <Settings width={24} height={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#141414',
    borderRadius: 30,
  },
  footerText: {color: '#fff', fontSize: 16},
});

export default Navigation;
