import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import colors from '../themes';

interface BalanceCardProps {
  balance?: number; // Allow balance to be undefined initially
  totalLimit?: number;
  setModalVisible: (visible: boolean) => void;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  balance = 0,
  totalLimit = 0,
  setModalVisible,
}) => {
  // Ensure balance and totalLimit are valid numbers
  const safeBalance = Number(balance) || 0;
  const safeTotalLimit = Number(totalLimit) || 0;

  const formattedBalance = safeBalance.toFixed(2);
  const percentage =
    safeTotalLimit > 0
      ? ((safeBalance / safeTotalLimit) * 100).toFixed(0)
      : '0';

  return (
    <View style={styles.balanceContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.balanceTitle}>Balance</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.button}>
          <Text style={styles.buttonText}>Set Balance</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceInfo}>
        <View style={styles.amountRow}>
          <Text style={styles.balanceAmount}>₹{formattedBalance}</Text>
          <Text style={styles.limitText}> of ₹{safeTotalLimit.toFixed(2)}</Text>
        </View>

        {safeBalance > safeTotalLimit ? (
          <Text style={styles.exceedText}>
            +₹{(safeBalance - safeTotalLimit).toFixed(2)}
          </Text>
        ) : safeBalance < 0 ? (
          <Text style={styles.overspentText}>
            -₹{Math.abs(safeBalance).toFixed(2)}
          </Text>
        ) : (
          <Text style={styles.percentageText}>{percentage}%</Text>
        )}
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {width: `${Math.min(Number(percentage), 100)}%`},
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceContainer: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 20,
    marginBottom: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.blkText,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.blkText,
  },
  buttonText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  balanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 25,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.blkText,
  },
  limitText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.blkText,
    opacity: 0.5,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.blkText,
  },
  exceedText: {
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: colors.balLimBg,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    color: colors.balLimText,
  },
  progressBar: {
    height: 7,
    width: '100%',
    borderRadius: 15,
    marginTop: 15,
    backgroundColor: colors.balSecBg,
  },
  progressFill: {
    height: '100%',
    borderRadius: 15,
    backgroundColor: colors.balProg,
  },
  overspentText: {
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#FF5454', // Dark red background
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    color: '#450808', // Bright red text
  },
});

export default BalanceCard;
