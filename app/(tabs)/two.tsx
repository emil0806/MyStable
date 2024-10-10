import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Button,
  Modal,
  Text,
  TextInput,
  Alert,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { View } from "@/components/Themed";
import { addDoc, collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';

interface Event {
  id: string;
  date: string;
  title: string;
  description: string;
  time: string;
  user: string;
}

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventUser, setEventUser] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); // Track if the current user is an admin

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchAdminStatus();
  }, []);

  useEffect(() => {
    // Load events from storage or API if needed
    fetchEvents();
  }, []);

  const fetchAdminStatus = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsAdmin(userData.isAdmin || false); // Assume isAdmin is a field in the user document
      }
    }
  };

  const fetchEvents = async () => {
    try {
      const eventsCollection = collection(db, "events");
      const q = query(eventsCollection, where("date", "==", selectedDate));
      const eventsSnapshot = await getDocs(q);
      const fetchedEvents: Event[] = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching events: ", error);
    }
  };

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const onCalendarButtonPress = () => {
    if (!selectedDate) {
      Alert.alert("No Date Selected", "Please select a date on the calendar.");
      return;
    }
    setModalVisible(true);
    setEventTitle("");
    setEventDescription("");
    setEventTime("");
    setEventUser("");
    setEditingEventId(null);
  };

  const handleSaveEvent = async () => {
    if (!eventTitle) {
      Alert.alert("Title Required", "Please enter an event title.");
      return;
    }

    const newEvent = {
      date: selectedDate,
      title: eventTitle,
      description: eventDescription,
      time: eventTime,
      user: auth.currentUser ? auth.currentUser.uid : "unknown", // Ensure the user is associated with the event
    };

    try {
      if (editingEventId) {
        // You can add logic for updating an event if required
      } else {
        // Add new event to Firebase
        await addDoc(collection(db, "events"), newEvent);
        Alert.alert('Event saved to Firebase!');
      }

      // Fetch updated events for the selected date to show the newly created task
      fetchEvents();

      // Reset the form and close the modal
      setModalVisible(false);
      setEventTitle("");
      setEventDescription("");
      setEventTime("");
      setEditingEventId(null);
    } catch (error) {
      console.error('Error saving event to Firebase: ', error);
      Alert.alert('Error', 'Failed to save event. Please try again.');
    }
  };

  const handleEditEvent = (event: Event) => {
    setEventTitle(event.title);
    setEventDescription(event.description);
    setEventTime(event.time);
    setEditingEventId(event.id);
    setSelectedDate(event.date);
    setEventUser("");
    setModalVisible(true);
  };

  const handleDeleteEvent = (id: string) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedEvents = events.filter((event) => event.id !== id);
          setEvents(updatedEvents);
        },
      },
    ]);
  };

  const getEventsForDate = (date: string): Event[] => {
    return events.filter((event) => event.date === date);
  };

  const getMarkedDates = () => {
    const markedDates: { [key: string]: any } = {};

    // Mark dates with user-added events only
    events.forEach((event) => {
      if (!event.id.startsWith('default-')) {
        if (markedDates[event.date]) {
          if (markedDates[event.date].dots) {
            markedDates[event.date].dots.push({ color: 'red' });
          } else {
            markedDates[event.date].dots = [{ color: 'red' }];
          }
        } else {
          markedDates[event.date] = {
            dots: [{ color: 'red' }],
          };
        }
      }
    });

    // Add selected date
    if (selectedDate) {
      markedDates[selectedDate] = {
        ...(markedDates[selectedDate] || {}),
        selected: true,
        selectedColor: "#2e78b7",
      };
    }

    // Mark today's date
    markedDates[today] = {
      ...(markedDates[today] || {}),
      customStyles: {
        text: {
          color: "red",
          fontWeight: "bold",
        },
      },
    };

    return markedDates;
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={getMarkedDates()}
        markingType={"multi-dot"}
        theme={{
          arrowColor: '#2e78b7',
        }}
      />
      <Button title="Tilføj" onPress={onCalendarButtonPress} />
      <Button title="Tilføj ind/ud" />

      {/* Display events for the selected date */}
      {selectedDate && (
        <View style={styles.eventsContainer}>
          <Text style={styles.eventsTitle}>Events on {selectedDate}:</Text>
          {getEventsForDate(selectedDate).length === 0 ? (
            <Text style={styles.noEventsText}>No events for this date.</Text>
          ) : (
            <FlatList
              data={getEventsForDate(selectedDate)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.eventItem}>
                  <Text style={styles.eventTitle}>
                    {item.title} {item.time ? `at ${item.time}` : ""}
                  </Text>
                  <Text>{item.description}</Text>
                  {isAdmin && (
                    <View style={styles.eventButtons}>
                      <TouchableOpacity onPress={() => handleEditEvent(item)}>
                        <Text style={styles.editButton}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteEvent(item.id)}>
                        <Text style={styles.deleteButton}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            />
          )}
        </View>
      )}

      {/* Modal for adding/editing events */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingEventId ? "Edit Event" : "Add Event"}
          </Text>
          <Text style={styles.modalLabel}>Date: {selectedDate}</Text>
          <TextInput
            style={styles.input}
            placeholder="Event Title"
            value={eventTitle}
            onChangeText={setEventTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Event Time (e.g., 14:30)"
            value={eventTime}
            onChangeText={setEventTime}
          />
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Event Description"
            value={eventDescription}
            onChangeText={setEventDescription}
            multiline
          />
          <Button title="Save Event" onPress={handleSaveEvent} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  eventsContainer: {
    flex: 1,
    padding: 10,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noEventsText: {
    fontStyle: "italic",
    color: "#666",
  },
  eventItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  eventButtons: {
    flexDirection: "row",
    marginTop: 10,
  },
  editButton: {
    marginRight: 15,
    color: "blue",
  },
  deleteButton: {
    color: "red",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
  },
});
