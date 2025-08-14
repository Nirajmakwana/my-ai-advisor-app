import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProductCard({ product, reason }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.meta}>{product.category.toUpperCase()} • ${product.price}</Text>
      {'cpu' in product && <Text style={styles.meta}>{product.cpu} • {product.ram} • {product.storage || ''}</Text>}
      <Text style={styles.desc}>{product.description}</Text>
      {reason ? <Text style={styles.reason}>Why: {reason}</Text> : null}
      {product.features?.length ? (
        <View style={styles.tags}>
          {product.features.slice(0, 6).map((t) => (
            <Text key={t} style={styles.tag}>#{t}</Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', padding: 14, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  meta: { color: '#475569', marginBottom: 2 },
  desc: { color: '#334155', marginVertical: 6 },
  reason: { marginTop: 8, fontStyle: 'italic', color: '#0f766e' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  tag: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, marginRight: 6, marginBottom: 6, color: '#0f172a' }
});
