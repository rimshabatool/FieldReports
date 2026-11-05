import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlatformPressable } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ComposeScreen } from '../screens/ComposeScreen';
import { OutboxScreen } from '../screens/OutboxScreen';
import { ServerReportScreen } from '../screens/ServerReportScreen';
import { ServerReportsScreen } from '../screens/ServerReportsScreen';
import {colors, scale, typography} from '../theme';
import {
  PhoneStackParamList,
  ServerStackParamList,
  TabParamList,
} from './types';

const TAB_BAR_CONTENT_HEIGHT = scale.vs(42);

const PhoneStack = createNativeStackNavigator<PhoneStackParamList>();
const ServerStack = createNativeStackNavigator<ServerStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    primary: colors.text,
    text: colors.text,
    border: colors.line,
  },
};

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerTintColor: colors.text,
  headerTitleStyle: {
    fontSize: typography.button,
    fontWeight: '600' as const,
  },
  contentStyle: {backgroundColor: colors.background},
};

function PhoneNavigator() {
  return (
    <PhoneStack.Navigator screenOptions={screenOptions}>
      <PhoneStack.Screen
        name="Outbox"
        component={OutboxScreen}
        options={{ headerShown: false }}
      />
      <PhoneStack.Screen
        name="Compose"
        component={ComposeScreen}
        options={{ title: 'New report' }}
      />
    </PhoneStack.Navigator>
  );
}

function ServerNavigator() {
  return (
    <ServerStack.Navigator screenOptions={screenOptions}>
      <ServerStack.Screen
        name="ServerReports"
        component={ServerReportsScreen}
        options={{ headerShown: false }}
      />
      <ServerStack.Screen
        name="ServerReport"
        component={ServerReportScreen}
        options={{ title: 'Report' }}
      />
    </ServerStack.Navigator>
  );
}

export function RootNavigator() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, scale.vs(8));

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tabs.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.line,
            height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
            paddingTop: scale.vs(8),
            paddingBottom: bottomInset,
          },
          tabBarShowLabel: true,
          tabBarIcon: () => null,
          tabBarIconStyle: {display: 'none'},
          tabBarLabelStyle: {
            fontSize: typography.caption,
            fontWeight: '600',
          },
          tabBarButton: props => (
            <PlatformPressable
              {...props}
              pressColor="transparent"
              android_ripple={{color: 'transparent', borderless: false}}
            />
          ),
        }}>
        <Tabs.Screen
          name="Phone"
          component={PhoneNavigator}
          options={{ title: 'Your Reports' }}
        />
        <Tabs.Screen
          name="Server"
          component={ServerNavigator}
          options={{ title: 'Received' }}
        />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}
