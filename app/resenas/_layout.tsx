import { Stack } from 'expo-router';

export default function ResenasLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Dejar Reseña',
          headerStyle: { backgroundColor: '#1A73E8' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack>
  );
}
