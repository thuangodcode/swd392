import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../utils/constants';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>⚠️ Oops!</Text>
              <Text style={styles.errorText}>Something went wrong</Text>
              <View style={styles.errorDetails}>
                <Text style={styles.errorMessage}>
                  {this.state.error?.toString()}
                </Text>
              </View>
              <Text style={styles.hint}>
                This is a development error. Check the console logs for more details.
              </Text>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.danger,
    marginBottom: 15,
  },
  errorDetails: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorMessage: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  hint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default ErrorBoundary;
