import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// Screens
import TasksScreen from './src/screens/TasksScreen';
import TimerScreen from './src/screens/TimerScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import SubjectsScreen from './src/screens/SubjectsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              switch (route.name) {
                case 'Tasks':
                  iconName = focused ? 'list' : 'list-outline';
                  break;
                case 'Timer':
                  iconName = focused ? 'timer' : 'timer-outline';
                  break;
                case 'Calendar':
                  iconName = focused ? 'calendar' : 'calendar-outline';
                  break;
                case 'Subjects':
                  iconName = focused ? 'book' : 'book-outline';
                  break;
                default:
                  iconName = 'help-outline';
              }

              return <Ionicons name={iconName as any} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#4ECDC4',
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: '#1A1A1A',
            },
            headerTintColor: '#4ECDC4',
            tabBarStyle: {
              backgroundColor: '#1A1A1A',
              borderTopColor: '#333',
            },
          })}
        >
          <Tab.Screen name="Tasks" component={TasksScreen} />
          <Tab.Screen name="Timer" component={TimerScreen} />
          <Tab.Screen name="Calendar" component={CalendarScreen} />
          <Tab.Screen name="Subjects" component={SubjectsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
} 