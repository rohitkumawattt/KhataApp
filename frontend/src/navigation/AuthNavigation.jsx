import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from '../screens/Welcome';
import Login from '../screens/Login';
import Register from '../screens/Register';
import VerifyEmail from '../screens/VerifyEmail';
import ForgotPassword from '../screens/ForgotPassword';

const Stack = createNativeStackNavigator();

const AuthNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" component={Welcome} />
      <Stack.Screen name="login" component={Login} />
      <Stack.Screen name="register" component={Register} />
      <Stack.Screen name="verifyEmail" component={VerifyEmail} />
      <Stack.Screen name="forgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  );
};

export default AuthNavigation;

