import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  Platform,
} from 'react-native';
import {LineChart, BarChart} from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

const API_URL = 'http://172.30.66.99:3001';

const AnalyticsScreen = ({accountId}) => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [chartData, setChartData] = useState({labels: [], values: []});

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    processChartData();
  }, [filteredExpenses]);

  // 🟢 Fetch expenses from API
  const fetchExpenses = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/expenses?accountId=${accountId}`,
      );
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  // 🟢 Filter expenses by selected period
  const filterExpenses = period => {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'yearly':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        startDate = selectedDate;
        break;
      default:
        startDate = new Date(0); // Show all
    }

    const filtered = expenses.filter(exp => new Date(exp.date) >= startDate);
    setFilteredExpenses(filtered);
  };

  // 🟢 Process data for charts
  const processChartData = () => {
    if (filteredExpenses.length === 0) {
      setChartData({labels: [], values: []});
      return;
    }

    // Aggregate expenses by category
    const categoryTotals = {};
    filteredExpenses.forEach(exp => {
      categoryTotals[exp.category] =
        (categoryTotals[exp.category] || 0) + exp.amount;
    });

    // Convert to chart format
    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    setChartData({labels, values});
  };

  // 🟢 Handle date selection
  const onDateChange = (event, date) => {
    if (date) {
      setSelectedDate(date);
      filterExpenses('custom');
    }
    if (Platform.OS === 'android') {
      setShowPicker(false); // Hide picker after selection
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Expense Analytics</Text>

      {/* Bar Chart: Expenses by Category */}
      {chartData.labels.length > 0 ? (
        <BarChart
          data={{
            labels: chartData.labels,
            datasets: [{data: chartData.values}],
          }}
          width={350}
          height={220}
          chartConfig={{
            backgroundGradientFrom: '#ff8c00',
            backgroundGradientTo: '#ff4500',
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
        />
      ) : (
        <Text style={styles.noData}>No data available</Text>
      )}

      {/* Select Date */}
      <Button title="Select Date" onPress={() => setShowPicker(true)} />

      {/* Date Picker */}
      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#141414'},
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  noData: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AnalyticsScreen;
