import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useUser } from '../contexts/UserContext';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const { setIsLoggedIn } = useUser();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F5F5F5',
          borderTopWidth: 1,
          paddingBottom: 10,
          paddingTop: 10,
          height: 80,
        },
        tabBarActiveTintColor: '#E53935',
        tabBarInactiveTintColor: '#757575',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "account" : "account-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      >
        {(props) => <ProfileScreen {...props} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
} 