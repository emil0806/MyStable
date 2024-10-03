import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Button,
  Modal,
  Text,
  TextInput,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { View } from '@/components/Themed';

interface Event {
  id: string;
  date: string;
  title: string;
  description: string;
  time: string;
}

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Load events from storage or API if needed
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    // Fetch events from local storage or backend
    // For now, we'll start with an empty array
    setEvents([]);
  };

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    // Handle date selection if needed
  };

  const onCalendarButtonPress = () => {
    if (!selectedDate) {
      Alert.alert('No Date Selected', 'Please select a date on the calendar.');
      return;
    }
    setModalVisible(true);
    setEventTitle('');
    setEventDescription('');
    setEventTime('');
    setEditingEventId(null);
  };

  const handleSaveEvent = () => {
    if (!eventTitle) {
      Alert.alert('Title Required', 'Please enter an event title.');
      return;
    }

    if (editingEventId) {
      // Update existing event
      const updatedEvents = events.map((event) =>
        event.id === editingEventId
          ? { ...event, title: eventTitle, description: eventDescription, time: eventTime }
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
    setEventTitle('');
    setEventDescription('');
    setEventTime('');
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
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedEvents = events.filter((event) => event.id !== id);
          setEvents(updatedEvents);
        },
      },
    ]);
  };

  const getDefaultEventsForDate = (date: string): Event[] => [
    {
      id: `default-1-${date}`,
      date,
      title: 'Turnout',
      description: '',
      time: '08:00',
    },
    {
      id: `default-2-${date}`,
      date,
      title: 'Bring-in',
      description: '',
      time: '19:30',
    },
  ];

  const getEventsForDate = (date: string): Event[] => {
    const defaultEvents = getDefaultEventsForDate(date);
    const userEvents = events.filter((event) => event.date === date);
    return [...defaultEvents, ...userEvents];
  };

  const getMarkedDates = () => {
    const markedDates: { [key: string]: any } = {};

    // Include dates with user events
    events.forEach((event) => {
      if (markedDates[event.date]) {
        // If the date already exists, add another dot
        if (markedDates[event.date].dots) {
          markedDates[event.date].dots.push({ color: 'blue' });
        } else {
          markedDates[event.date].dots = [{ color: 'blue' }];
        }
      } else {
        markedDates[event.date] = {
          dots: [{ color: 'blue' }],
        };
      }
    });

    // Include default events for all dates in the current month
    const currentMonth = new Date().getMonth(); // 0-based month index
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
        .toISOString()
        .split('T')[0];

      if (markedDates[date]) {
        // Date already has user events, add an additional dot
        markedDates[date].dots.push({ color: 'red' });
      } else {
        // Date has only default events
        markedDates[date] = {
          dots: [{ color: 'red' }],
        };
      }
    }

    // Add selected date
    if (selectedDate) {
      markedDates[selectedDate] = {
        ...(markedDates[selectedDate] || {}),
        selected: true,
        selectedColor: '#2e78b7',
      };
    }

    // Mark today's date
    markedDates[today] = {
      ...(markedDates[today] || {}),
      customStyles: {
        text: {
          color: 'red',
          fontWeight: 'bold',
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
        markingType={'multi-dot'}
        theme={{
          arrowColor: '#2e78b7',
          // Remove 'todayTextColor' if it's interfering
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
                    {item.title} {item.time ? `at ${item.time}` : ''}
                  </Text>
                  <Text>{item.description}</Text>
                  {item.id.startsWith('default-') ? null : (
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
            {editingEventId ? 'Edit Event' : 'Add Event'}
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
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noEventsText: {
    fontStyle: 'italic',
    color: '#666',
  },
  eventItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  editButton: {
    marginRight: 15,
    color: 'blue',
  },
  deleteButton: {
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
  },
});
