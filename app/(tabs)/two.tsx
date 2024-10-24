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
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import { View } from "@/components/Themed";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { useFocusEffect } from "@react-navigation/native";

// Opsætning af lokaliserede ugedage og måneder til dansk
LocaleConfig.locales["da"] = {
  monthNames: [
    "Januar",
    "Februar",
    "Marts",
    "April",
    "Maj",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "December",
  ],
  monthNamesShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Maj",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dec",
  ],
  dayNames: [
    "Søndag",
    "Mandag",
    "Tirsdag",
    "Onsdag",
    "Torsdag",
    "Fredag",
    "Lørdag",
  ],
  dayNamesShort: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"],
  today: "I dag",
};
LocaleConfig.defaultLocale = "da";

interface Event {
  id: string;
  date: string;
  title: string;
  description: string;
  time: string;
  user: string;
}

export default function CalendarScreen() {
  const [stable, setStable] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventUser, setEventUser] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (stable?.isMember) {
      fetchEvents();
    }
  }, [stable]);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserStable();
    }, [])
  );

  const fetchUserStable = async () => {
    const db = getFirestore();
    const user = auth.currentUser;

    if (user) {
      // Hent brugerens dokument
      const userDocRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const stableId = userData?.stableId;

        if (stableId) {
          const stablesDocRef = doc(db, "stables", stableId);
          const stableSnapshot = await getDoc(stablesDocRef);

          if (stableSnapshot.exists()) {
            const stableData = stableSnapshot.data();

            // Tjek, om brugeren er admin eller medlem
            const admin = stableData?.admin === user.uid;
            const member = stableData?.members?.includes(user.uid);

            setStable({
              ...stableData,
              isAdmin: admin,
              isMember: member,
            });
          } else {
            setStable(null);
          }
        }
      }
    }
  };

  const fetchEvents = async () => {
    if (stable?.isMember) {
      try {
        const eventsCollection = collection(db, "events");
        const eventsSnapshot = await getDocs(eventsCollection);
        const fetchedEvents: Event[] = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Fejl ved hentning af begivenheder: ", error);
      }
    }
  };

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const onCalendarButtonPress = () => {
    if (!selectedDate) {
      Alert.alert("Ingen dato valgt", "Vælg venligst en dato på kalenderen.");
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
      Alert.alert(
        "Titel krævet",
        "Indtast venligst en titel for begivenheden."
      );
      return;
    }

    const newEvent = {
      date: selectedDate,
      title: eventTitle,
      description: eventDescription,
      time: eventTime,
      user: auth.currentUser ? auth.currentUser.uid : "ukendt", // Ensure the user is associated with the event
    };

    try {
      if (editingEventId) {
        // You can add logic for updating an event if required
      } else {
        // Add new event to Firebase
        await addDoc(collection(db, "events"), newEvent);
        Alert.alert("Begivenheden er gemt!");
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
      console.error("Fejl ved lagring af begivenhed: ", error);
      Alert.alert("Fejl", "Kunne ikke gemme begivenhed. Prøv igen.");
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
    Alert.alert(
      "Slet begivenhed",
      "Er du sikker på, at du vil slette denne begivenhed?",
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Slet",
          style: "destructive",
          onPress: () => {
            const updatedEvents = events.filter((event) => event.id !== id);
            setEvents(updatedEvents);
          },
        },
      ]
    );
  };

  const getEventsForDate = (date: string): Event[] => {
    return events.filter((event) => event.date === date);
  };

  const getMarkedDates = () => {
    const markedDates: { [key: string]: any } = {};

    // Mark dates with user-added events only
    events.forEach((event) => {
      if (!event.id.startsWith("default-")) {
        if (markedDates[event.date]) {
          if (markedDates[event.date].dots) {
            markedDates[event.date].dots.push({ color: "red" });
          } else {
            markedDates[event.date].dots = [{ color: "red" }];
          }
        } else {
          markedDates[event.date] = {
            dots: [{ color: "red" }],
          };
        }
      }
    });

    // Add selected date
    if (selectedDate) {
      markedDates[selectedDate] = {
        ...(markedDates[selectedDate] || {}),
        selected: true,
        selectedColor: "#6E8E8A",
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

  // Funktion til at formatere dato til dd-mm-yyyy
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // +1 fordi måneder er 0-indekserede
    const year = String(date.getFullYear()); // Henter hele året (fire cifre)
    return `${day}-${month}-${year}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={getMarkedDates()}
          markingType={"multi-dot"}
          firstDay={1} // Starter ugen med mandag
          theme={{
            arrowColor: "#6E8E8A",
            monthTextColor: "#6E8E8A",
            calendarBackground: "#fcf7f2",
            textSectionTitleColor: "#6E8E8A",
            selectedDayBackgroundColor: "#6E8E8A",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#6E8E8A",
            dayTextColor: "#2d4150",
            textDisabledColor: "#d9e1e8",
          }}
        />
      </View>
      {stable?.isMember
        ? stable?.isAdmin && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={onCalendarButtonPress}
                style={styles.button}
              >
                <Text>Tilføj</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}>
                <Text>Tilføj ind/ud</Text>
              </TouchableOpacity>
            </View>
          )
        : null}

      {selectedDate ? (
        stable?.isMember ? (
          <View style={styles.eventsContainer}>
            <Text style={styles.eventsTitle}>
              Begivenheder d. {formatDate(selectedDate)}:
            </Text>
            {getEventsForDate(selectedDate).length === 0 ? (
              <Text style={styles.noEventsText}>
                Ingen begivenheder for denne dato.
              </Text>
            ) : (
              <FlatList
                data={getEventsForDate(selectedDate)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.eventItem}>
                    <Text style={styles.eventTitle}>
                      {item.title} {item.time ? `kl. ${item.time}` : ""}
                    </Text>
                    {stable?.isAdmin && (
                      <View style={styles.eventButtons}>
                        <TouchableOpacity onPress={() => handleEditEvent(item)}>
                          <Text style={styles.editButton}>Rediger</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteEvent(item.id)}
                        >
                          <Text style={styles.deleteButton}>Slet</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              />
            )}
          </View>
        ) : (
          <Text style={styles.text}>
            Du skal være medlem af en stald for at kunne se begivenheder.
          </Text>
        )
      ) : null}
      {/* Modal for adding/editing events */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingEventId ? "Rediger begivenhed" : "Tilføj begivenhed"}
          </Text>
          <Text style={styles.modalLabel}>
            Dato: {formatDate(selectedDate)}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Titel for begivenhed"
            value={eventTitle}
            onChangeText={setEventTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Tid (f.eks. 14:30)"
            value={eventTime}
            onChangeText={setEventTime}
          />
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Beskrivelse"
            value={eventDescription}
            onChangeText={setEventDescription}
            multiline
          />
          <Button title="Gem begivenhed" onPress={handleSaveEvent} />
          <Button title="Annuller" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcf7f2",
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 20,
  },
  eventsContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fcf7f2",
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
  },
  noEventsText: {
    fontStyle: "italic",
    color: "#666",
  },
  eventItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    backgroundColor: "#fcf7f2",
    margin: 0,
    paddingTop: 8,
    paddingBottom: 5,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    margin: 0,
  },
  eventButtons: {
    flexDirection: "row",
    backgroundColor: "#fcf7f2",
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  editButton: {
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#fcf7f2",
  },
  deleteButton: {
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#fcf7f2",
    color: "red",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fcf7f2",
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
  calendarContainer: {
    borderWidth: 2,
    borderColor: "#6E8E8A",
    borderRadius: 10,
    overflow: "hidden",
    margin: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#fcf7f2",
    marginBottom: 10,
    marginTop: 10,
  },
  button: {
    marginLeft: 10,
    marginRight: 10,
    width: 100,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#fcf7f2",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    margin: 0,
    textAlign: "center",
  },
});
