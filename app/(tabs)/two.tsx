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

interface Event {
  id: string;
  date: string;
  title: string;
  description: string;
  time: string;
}

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // Load events from storage or API if needed
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    // Pre-populate events with default events for a range of dates
    const defaultEvents: Event[] = [];
    const startDate = new Date(); // Today
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 365); // Next 365 days

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      defaultEvents.push(
        {
          id: `default-1-${dateStr}`,
          date: dateStr,
          title: 'Turnout',
          description: '',
          time: '08:00',
        },
        {
          id: `default-2-${dateStr}`,
          date: dateStr,
          title: 'Bring-in',
          description: '',
          time: '19:30',
        }
      );
    }

    setEvents(defaultEvents);
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
    setEditingEventId(null);
  };

  const handleSaveEvent = () => {
    if (!eventTitle) {
      Alert.alert("Title Required", "Please enter an event title.");
      return;
    }

    if (editingEventId) {
      // Update existing event
      const updatedEvents = events.map((event) =>
        event.id === editingEventId
          ? {
            ...event,
            title: eventTitle,
            description: eventDescription,
            time: eventTime,
          }
          : event
      );
      setEvents(updatedEvents);
    } else {
      // Add new event
      const newEvent = {
        id: Date.now().toString(),
        date: selectedDate,
        title: eventTitle,
        description: eventDescription,
        time: eventTime,
      };
      setEvents([...events, newEvent]);
    }

    // Reset the form and close the modal
    setModalVisible(false);
    setEventTitle("");
    setEventDescription("");
    setEventTime("");
    setEditingEventId(null);
  };

  const handleEditEvent = (event: Event) => {
    setEventTitle(event.title);
    setEventDescription(event.description);
    setEventTime(event.time);
    setEditingEventId(event.id);
    setSelectedDate(event.date);
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
      <Button title="Add Event" onPress={onCalendarButtonPress} />

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
                  <View style={styles.eventButtons}>
                    <TouchableOpacity onPress={() => handleEditEvent(item)}>
                      <Text style={styles.editButton}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteEvent(item.id)}>
                      <Text style={styles.deleteButton}>Delete</Text>
                    </TouchableOpacity>
                  </View>
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
