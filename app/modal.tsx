import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { collection, getDocs, addDoc, query, where, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/firebaseConfig';

export default function ModalScreen() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [stableId, setStableId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserStable();
    fetchAnnouncements();
  }, [stableId]);

  const fetchUserStable = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const userStableId = userData.stableId;
        setStableId(userStableId);

        const stableDocRef = doc(db, 'stables', userStableId);
        const stableSnapshot = await getDoc(stableDocRef);
        if (stableSnapshot.exists()) {
          const stableData = stableSnapshot.data();
          setIsAdmin(stableData.admin === user.uid);
        }
      }
    }
  };

  const fetchAnnouncements = async () => {
    if (stableId) {
      const announcementsQuery = query(
        collection(db, 'announcements'),
        where('stableId', '==', stableId)
      );
      const querySnapshot = await getDocs(announcementsQuery);
      const fetchedAnnouncements = querySnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          ...data,
        };
      });
      setAnnouncements(fetchedAnnouncements);
    }
  };

  const handleAddAnnouncement = async () => {
    if (newAnnouncement.trim() === "") {
      Alert.alert('Fejl', 'Indtast venligst en meddelelse.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;


      await addDoc(collection(db, 'announcements'), {
        text: newAnnouncement,
        stableId: stableId,
        date: formattedDate,
      });

      setNewAnnouncement("");
      fetchAnnouncements();
    } catch (error) {
      console.error('Fejl ved tilføjelse af meddelelse: ', error);
      Alert.alert('Fejl', 'Kunne ikke tilføje meddelelse. Prøv igen.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meddelelser</Text>
      <View style={styles.separator} lightColor="#000" darkColor="rgba(255,255,255,0.1)" />

      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.announcementItem}>
            <Text style={styles.announcementText}>{item.text}</Text>
            <Text style={styles.announcementMeta}>— {item.date}</Text>
          </View>
        )}
      />

      {/* Admin-only input for posting new announcements */}
      {isAdmin && (
        <View style={styles.adminContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tilføj ny meddelelse"
            value={newAnnouncement}
            onChangeText={setNewAnnouncement}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddAnnouncement}>
            <Text style={styles.addButtonText}>Tilføj</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
  },
  announcementItem: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: '100%',
  },
  announcementText: {
    fontSize: 16,
  },
  announcementMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  adminContainer: {
    marginTop: 20,
    width: '100%',
  },
  input: {
    borderColor: '#000',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
  },
  addButton: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});