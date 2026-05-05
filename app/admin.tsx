import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, Platform, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { fetchWishes } from '../utils/supabase';

export default function AdminScreen() {
  const router = useRouter();
  const [wishes, setWishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchWishes().then((data) => {
        setWishes(data);
        setLoading(false);
      });
    }, [])
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const isActive = (curseEnd: string) => new Date(curseEnd).getTime() > Date.now();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>👁️ 저주받은 자들의 기록</Text>
        <Text style={styles.subtitle}>Book of the Cursed — {wishes.length} souls</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading rituals...</Text>
        </View>
      ) : wishes.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No rituals yet.</Text>
        </View>
      ) : (
        <FlatList
          data={wishes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <View style={[styles.card, isActive(item.curse_end) && styles.cardActive]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardNumber}>#{wishes.length - index}</Text>
                <Text style={[styles.cardStatus, isActive(item.curse_end) ? styles.statusActive : styles.statusExpired]}>
                  {isActive(item.curse_end) ? '🔴 ACTIVE' : '⚫ EXPIRED'}
                </Text>
              </View>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardWish}>"{item.wish}"</Text>
              <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 50 : 20,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  backText: {
    color: '#666',
    fontSize: 22,
  },
  title: {
    color: '#8A0303',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#555',
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#444',
    fontSize: 14,
  },
  emptyText: {
    color: '#333',
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#333',
  },
  cardActive: {
    borderLeftColor: '#8A0303',
    backgroundColor: '#1a0000',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardNumber: {
    color: '#555',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardStatus: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusActive: {
    color: '#cc0000',
  },
  statusExpired: {
    color: '#444',
  },
  cardName: {
    color: '#ccc',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardWish: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  cardDate: {
    color: '#444',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
