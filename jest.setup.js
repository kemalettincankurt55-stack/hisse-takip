/* Jest test ortamı için mock'lar (cihaz/tarayıcı gerektirmeden) */

// react-native-reanimated resmi mock'u
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// AsyncStorage resmi jest mock'u (persist için)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// @expo/vector-icons: font yükleme native bağımlılığını atla, basit View döndür
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Icon = (props) => React.createElement(View, { testID: `icon-${props.name}` });
  return new Proxy(
    {},
    {
      get: () => Icon,
    },
  );
});

// expo-notifications: native çağrıları stub'la (modül yüklenince setNotificationHandler çağrılıyor)
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted', granted: true })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted', granted: true })),
  getExpoPushTokenAsync: jest.fn(async () => ({ data: 'ExponentPushToken[test]' })),
  scheduleNotificationAsync: jest.fn(async () => 'notif-id'),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
  setBadgeCountAsync: jest.fn(async () => undefined),
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval', DATE: 'date' },
}));

// react-native-chart-kit: grafikleri basit View'larla değiştir (svg native bağımlılığı olmadan)
jest.mock('react-native-chart-kit', () => {
  const React = require('react');
  const { View } = require('react-native');
  const stub = (name) => (props) => React.createElement(View, { testID: name, ...props });
  return {
    LineChart: stub('LineChart'),
    BarChart: stub('BarChart'),
    PieChart: stub('PieChart'),
    ProgressChart: stub('ProgressChart'),
    ContributionGraph: stub('ContributionGraph'),
    StackedBarChart: stub('StackedBarChart'),
  };
});
