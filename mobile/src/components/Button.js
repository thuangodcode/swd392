import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../utils/constants';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle 
}) => {
  const getButtonStyle = () => {
    const styles = [buttonStyles.button, buttonStyles[size]];
    
    if (variant === 'primary') {
      styles.push(buttonStyles.primary);
    } else if (variant === 'secondary') {
      styles.push(buttonStyles.secondary);
    } else if (variant === 'outline') {
      styles.push(buttonStyles.outline);
    } else if (variant === 'danger') {
      styles.push(buttonStyles.danger);
    }
    
    if (disabled) {
      styles.push(buttonStyles.disabled);
    }
    
    return styles;
  };

  const getTextStyle = () => {
    const styles = [buttonStyles.text];
    
    if (variant === 'outline') {
      styles.push(buttonStyles.outlineText);
    }
    
    if (size === 'small') {
      styles.push(buttonStyles.smallText);
    } else if (size === 'large') {
      styles.push(buttonStyles.largeText);
    }
    
    return styles;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  disabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.5,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  text: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
  outlineText: {
    color: COLORS.primary,
  },
  smallText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 18,
  },
});

export default Button;
