// Root component
import React from 'react';
import { SafeAreaView, StatusBar, View, StyleSheet } from 'react-native';
import AdvisorScreen from './src/AdvisorScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <AdvisorScreen />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { flex: 1, padding: 16 }
});
