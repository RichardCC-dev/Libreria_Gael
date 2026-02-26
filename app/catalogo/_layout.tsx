import { Stack } from 'expo-router';

export default function CatalogoLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Catálogo de Productos',
          headerStyle: { backgroundColor: '#10B981' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack>
  );
}
