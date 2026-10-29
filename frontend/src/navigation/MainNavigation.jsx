import React from 'react';
import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigation from "./TabNavigation"
import AddEntry from "../screens/AddEntry"
import AddPerson from "../screens/AddPerson"
import PersonDetails from "../screens/PersonDetails"
import EditProfile from "../screens/EditProfile"
import ContactUs from "../screens/ContactUs"
import Settings from "../screens/Settings"
import AllAmount from '../screens/AllAmount';
import ContactHistory from "../screens/ContactHistory"

const Stack = createNativeStackNavigator();

const MainNavigation = () => {

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigation}
      />
      <Stack.Screen name='AddEntry' component={AddEntry} />
      <Stack.Screen name='Entries' component={AllAmount} />
      <Stack.Screen name='AddPerson' component={AddPerson} />
      <Stack.Screen name='PersonDetails' component={PersonDetails} />
      <Stack.Screen name='EditProfile' component={EditProfile} />
      <Stack.Screen name='ContactUs' component={ContactUs} />
      <Stack.Screen name='ContactHistory' component={ContactHistory} />
      <Stack.Screen name='Settings' component={Settings} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({});

export default MainNavigation;