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
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { useFocusEffect } from "@react-navigation/native";

// Setup month names
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
  // Short month names for visiblity
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
  // Setup day names
  dayNames: [
    "Søndag",
    "Mandag",
    "Tirsdag",
    "Onsdag",
    "Torsdag",
    "Fredag",
    "Lørdag",
  ],
  // Short day names for visibility
  dayNamesShort: [
    "Søn",
    "Man",
    "Tir",
    "Ons",
    "Tor",
    "Fre",
    "Lør"],
  today: "I dag",
};
LocaleConfig.defaultLocale = "da";

// Interface with relevant info about Event
interface Event {
  id: string;
  date: string;
  title: string;
  description: string;
  time: string;
  user: string;
  userId: string,
  stableId: string;
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
  const [addEventsModalVisible, setAddEventsModalVisible] = useState(false);
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (stable?.isMember) {
      fetchEvents();
    }
  }, [stable]);

  // To make sure users stable is fetched when screen comes to view
  useFocusEffect(
    React.useCallback(() => {
      fetchUserStable();
    }, [])
  );

  // Fetching user stable 
  const fetchUserStable = async () => {
    const db = getFirestore();
    const user = auth.currentUser;

    if (user) {
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

            // Check if user is admin or member
            const admin = stableData?.admin === user.uid;
            const member = stableData?.members?.includes(user.uid);

            // Setting info about users stable
            setStable({
              ...stableData,
              isAdmin: admin,
              isMember: member,
              stableId: stableId,
            });
          } else {
            setStable(null);
          }
        }
      }
    }
  };

  // Fetching events if user is member of a stable
  const fetchEvents = async () => {
    if (stable?.isMember && stable?.stableId) {
      try {
        const eventsQuery = query(collection(db, "events"), where("stableId", "==", stable?.stableId));
        const eventsSnapshot = await getDocs(eventsQuery);
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

  // Set selected day when pressing a date
  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  // Allowing admin to see modal when pressing adding button
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

  // Create new event and store in Firebase
  const handleSaveEvent = async () => {
    if (!eventTitle) {
      Alert.alert(
        "Titel krævet",
        "Indtast venligst en titel for begivenheden."
      );
      return;
    }

    // Info about new event
    const newEvent = {
      date: selectedDate,
      title: eventTitle,
      description: eventDescription,
      time: eventTime,
      user: null,
      userId: null,
      stableId: stable?.stableId,
    };

    try {
      if (editingEventId) {
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
  // Editing event by updating fields
  const handleEditEvent = (event: Event) => {
    setEventTitle(event.title);
    setEventDescription(event.description);
    setEventTime(event.time);
    setEditingEventId(event.id);
    setSelectedDate(event.date);
    setEventUser("");
    setModalVisible(true);
  };
  // Delete events 
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
  // Signing up user for event when clicking on button
  const handleSignUp = async (eventId: string) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Bruger ikke fundet", "Du skal være logget ind for at tilmelde dig.");
        return;
      }
      const userDocRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        Alert.alert("Bruger ikke fundet", "Din brugerprofil findes ikke.");
        return;
      }

      const userData = userSnapshot.data();

      const eventRef = doc(db, "events", eventId);
      const eventSnapshot = await getDoc(eventRef);

      if (eventSnapshot.exists()) {
        const eventData = eventSnapshot.data();

        if (eventData.user) {
          Alert.alert("Event er allerede taget");
          return;
        }

        await updateDoc(eventRef, {
          user: userData.name,
          userId: auth.currentUser?.uid
        });

        fetchEvents();
      }
    } catch (error) {
      console.error("Error signing up for event: ", error);
    }
  };
  // Removes user from event
  const handleResign = async (eventId: string) => {
    try {
      const eventRef = doc(db, "events", eventId);
      const eventSnapshot = await getDoc(eventRef);

      await updateDoc(eventRef, {
        user: null,
        userId: null,
      });
      fetchEvents();

    } catch (error) {
      console.error("Error resigning from event: ", error);
    }
  };
  // Admin can see modal for adding in and out for multiple days
  const handleAddInAndOutEvents = async () => {
    setAddEventsModalVisible(true);
    setInTime("");
    setOutTime("");
  }
  // Adding in and out for next 14 days and storing in Firebase
  const handleAddInOutEvents = async () => {
    const today = new Date();

    setAddEventsModalVisible(false);

    for (let i = 0; i < 14; i++) {
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + i);
      const dateString = eventDate.toISOString().split("T")[0];

      const existingEvents = getEventsForDate(dateString);

      if (!existingEvents.some(event => event.title === "Ind")) {
        await addDoc(collection(db, "events"), {
          date: dateString,
          title: "Ind",
          description: "",
          time: inTime,
          stableId: stable?.stableId,
          user: null,
          userId: null,
        });
      }

      if (!existingEvents.some(event => event.title === "Ud")) {
        await addDoc(collection(db, "events"), {
          date: dateString,
          title: "Ud",
          description: "",
          time: outTime,
          stableId: stable?.stableId,
          user: null,
          userId: null,
        });
      }
    }

    Alert.alert("Begivenheder tilføjet for de næste 14 dage!");
    fetchEvents();
  };

  // Retrieving events for a specific day
  const getEventsForDate = (date: string): Event[] => {
    return events
      .filter((event) => event.date === date)
      .sort((a, b) => {
        const timeA = new Date(`1970-01-01T${a.time}:00Z`);
        const timeB = new Date(`1970-01-01T${b.time}:00Z`);
        return timeA.getTime() - timeB.getTime();
      });
  };

  // Displaying mark on dates with events
  const getMarkedDates = () => {
    const markedDates: { [key: string]: any } = {};

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

  // Formating date to dd-mm-yyyy
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return `${day}-${month}-${year}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={getMarkedDates()}
          markingType={"multi-dot"}
          firstDay={1}
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
      {/* Only show buttons if user is admin */}
      {stable?.isMember
        ? stable?.isAdmin && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onCalendarButtonPress}
              style={styles.button}
            >
              <Text>Tilføj</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleAddInAndOutEvents}>
              <Text>Tilføj ind & ud</Text>
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
                    <View style={styles.eventUserContainer}>
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventTitle}>
                          {item.title} {item.time ? `kl. ${item.time}` : ""}
                        </Text>
                        <Text style={styles.eventUser}>
                          {item.user}
                        </Text>
                      </View>

                      <View style={styles.eventButtons}>
                        {stable?.isAdmin && (
                          <View style={styles.eventAdminButtons}>
                            <TouchableOpacity onPress={() => handleDeleteEvent(item.id)}>
                              <Text style={styles.deleteButton}>Slet</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleEditEvent(item)}>
                              <Text style={styles.editButton}>Rediger</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        {item.userId === auth.currentUser?.uid ? (
                          <TouchableOpacity onPress={() => handleResign(item.id)}>
                            <Text style={styles.resignButton}>Afmeld</Text>
                          </TouchableOpacity>
                        ) : item.userId ? (
                          <Text>Optaget</Text>
                        ) : (
                          <TouchableOpacity onPress={() => handleSignUp(item.id)}>
                            <Text style={styles.signUpButton}>Tilmeld</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
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
      <Modal
        visible={addEventsModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setAddEventsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Tilføj "Ind" og "Ud"</Text>
          <Text style={styles.modalLabel}>Tid for "Ind":</Text>
          <TextInput
            style={styles.input}
            placeholder="f.eks. 08:00"
            value={inTime}
            onChangeText={setInTime}
          />
          <Text style={styles.modalLabel}>Tid for "Ud":</Text>
          <TextInput
            style={styles.input}
            placeholder="f.eks. 16:00"
            value={outTime}
            onChangeText={setOutTime}
          />
          <Button title="Tilføj" onPress={handleAddInOutEvents} />
          <Button title="Annuller" onPress={() => setAddEventsModalVisible(false)} />
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
    marginRight: 2,
    justifyContent: "center",
    alignItems: "center"
  },
  eventAdminButtons: {
    flexDirection: "row",
    backgroundColor: "#fcf7f2",
    gap: 10,
  },
  editButton: {
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#ffffff",
  },
  deleteButton: {
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#ffffff",
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
    width: 150,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#ffffff",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    margin: 0,
    textAlign: "center",
  },
  signUpButton: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: "#ffffff",
    color: "#000000",
    borderRadius: 10,
    borderWidth: 1,
  },
  resignButton: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: "#ffffff",
    color: "#000000",
    borderRadius: 10,
    borderWidth: 1,
  },
  eventUserContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fcf7f2"
  },
  eventInfo: {
    backgroundColor: "#fcf7f2"
  },
  eventUser: {
    fontSize: 16,
  }
});
