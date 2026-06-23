import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

import { colors } from '@/constants/theme';
import { getCities, type ApiCity } from '@/services/travoApi';

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '');

export default function MapScreen() {
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getCities();
      setCities(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load cities');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera zoomLevel={3} centerCoordinate={[-98.5795, 39.8283]} />
        {cities.map((c) =>
          c.lng != null && c.lat != null ? (
            <MapboxGL.PointAnnotation
              key={String(c.id)}
              id={String(c.id)}
              coordinate={[parseFloat(c.lng), parseFloat(c.lat)]}
            >
              <View style={styles.pin} />
              <MapboxGL.Callout title={`${c.city}, ${c.state_name}`} />
            </MapboxGL.PointAnnotation>
          ) : null,
        )}
      </MapboxGL.MapView>

      {error ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Backend offline — pins unavailable</Text>
          <Pressable onPress={() => void load()}>
            <Text style={styles.bannerRetry}>Retry</Text>
          </Pressable>
          <Pressable onPress={() => setError(null)}>
            <Text style={styles.bannerDismiss}>✕</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  pin: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textPrimary,
  },
  banner: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
  },
  bannerText: {
    color: '#fff',
    flex: 1,
    fontSize: 13,
  },
  bannerRetry: {
    color: '#60a5fa',
    fontWeight: '600',
    fontSize: 13,
  },
  bannerDismiss: {
    color: '#9ca3af',
    fontSize: 13,
    paddingLeft: 4,
  },
});
