import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {Dimensions} from 'react-native';
import {View} from 'react-native';

// Import Screens
import HomePage from './components/Homepage';
import AnalyticsScreen from './components/AnalyticsScreen';
import SummaryScreen from './components/SummaryScreen';
import Transactions from './components/Transactions';
import Settings from './components/Settings';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import AddExpenseScreen from './components/AddExpense';

// Import SVG Icons (Ensure React Components)
import CategoryIcon from './assets/icons/Navigation/category.svg';
import AnalyticsIcon from './assets/icons/Navigation/chart.svg';
import HomeIcon from './assets/icons/Navigation/home.svg';
import TransactionsIcon from './assets/icons/Navigation/transactions.svg';
import SettingsIcon from './assets/icons/Navigation/settings.svg';

// TypeScript Types
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
  AddExpense: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Category: undefined;
  Analytics: undefined;
  Transactions: undefined;
  Settings: undefined;
};

// Navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

// Fix getTabIcon function
const TabBarIcon = ({
  IconComponent,
  focused,
}: {
  IconComponent: React.FC<any>;
  focused: boolean;
}) => (
  <View style={{opacity: focused ? 1 : 0.4}}>
    <IconComponent width={28} height={28} />
  </View>
);

// Bottom Tab Navigator
const MainTabs = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false, // Removes text labels
      tabBarStyle: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        elevation: 0,
        backgroundColor: '#141414',
        borderRadius: 50,
        padding: 20,
        marginHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 0,
        // zIndex: -5,
      },
      tabBarIconStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
    }}>
    <Tab.Screen
      name="Category"
      component={SummaryScreen}
      options={{
        tabBarIcon: ({focused}) => (
          <TabBarIcon IconComponent={CategoryIcon} focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Analytics"
      component={AnalyticsScreen}
      options={{
        tabBarIcon: ({focused}) => (
          <TabBarIcon IconComponent={AnalyticsIcon} focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Home"
      component={HomePage}
      options={{
        tabBarIcon: ({focused}) => (
          <TabBarIcon IconComponent={HomeIcon} focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Transactions"
      component={Transactions}
      options={{
        tabBarIcon: ({focused}) => (
          <TabBarIcon IconComponent={TransactionsIcon} focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Settings"
      component={Settings}
      options={{
        tabBarIcon: ({focused}) => (
          <TabBarIcon IconComponent={SettingsIcon} focused={focused} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Main Stack Navigator
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
