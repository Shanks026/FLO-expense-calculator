import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import colors from '../themes';

interface HeaderProps {
  title: string;
  content: string;
  firstName?: string;
  toggleDrawer?: () => void;
}

const Header: React.FC<HeaderProps> = ({title, content, toggleDrawer}) => {
  return (
    <View style={styles.header}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View>
          <Text style={styles.greeting}>{title}</Text>
          <Text style={styles.subtext}>{content}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 15,
    marginTop: 10,
  },
  avatar: {width: 50, height: 50, borderRadius: 50},
  greeting: {color: colors.text, fontSize: 22, fontWeight: '500'},
  subtext: {color: colors.secondaryText, fontSize: 12, marginTop: 2},
});

export default Header;
