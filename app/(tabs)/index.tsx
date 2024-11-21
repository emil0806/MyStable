import { useEffect, useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Text, View } from "@/components/Themed";
import { useRouter, useSegments } from "expo-router";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import ViewAllHorsesScreen from "../stables/ViewAllHorses";
import { auth, db } from "@/firebaseConfig";
import AddHorseButton from "@/components/AddHorseButton"; // Import the Add Horse Button component
import AddHorseModal from "@/components/AddHorseModal"; // Import the Add Horse Modal component
import React from "react";

export default function TabOneScreen() {
  const [stable, setStable] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUserReady, setIsUserReady] = useState(false);
  const [invitation, setInvitation] = useState<any | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const { colors } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  // Callback on fetching user invitations when screen is in view
  useFocusEffect(
    React.useCallback(() => {
      fetchUserInvitation();
    }, [])
  );

  // Fetches user stable from Firebase
  const fetchUserStable = async () => {
    setLoading(true);
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

            // Check if the user is an admin or member
            const isAdmin = stableData?.admin === user.uid;
            const isMember = stableData?.members?.includes(user.uid);

            setStable({ ...stableData, isAdmin, isMember });
          } else {
            setStable(null);
          }
        }
      }
    }
    setLoading(false);
  };

  // Fetching user invitiatins from Firebase 
  const fetchUserInvitation = async () => {
    const db = getFirestore();
    const user = auth.currentUser;

    if (user) {
      const invitationsRef = collection(db, "invitations");
      const q = query(invitationsRef, where("invitedUserId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const invitationDoc = querySnapshot.docs[0];
        const invitationData = invitationDoc.data();
        setInvitation({ ...invitationData, id: invitationDoc.id });
      } else {
        setInvitation(null);
      }
    }
  };

  // Updates member list when user accepts
  const handleAcceptInvitation = async () => {
    if (!invitation) {
      return;
    }

    try {
      const db = getFirestore();
      const currentUserId = auth.currentUser!.uid;
      const userDocRef = doc(db, "users", currentUserId);

      await updateDoc(userDocRef, {
        stableId: invitation.stableId,
      });

      const stableDocRef = doc(db, "stables", invitation.stableId);
      const stableSnapshot = await getDoc(stableDocRef);
      if (stableSnapshot.exists()) {
        const stableData = stableSnapshot.data();

        const updatedMembers = stableData.members
          ? [...stableData.members, currentUserId]
          : [currentUserId];
        await updateDoc(stableDocRef, {
          members: updatedMembers,
          numOfMembers: updatedMembers.length,
        });
      }

      const invitationDocRef = doc(db, "invitations", invitation.id);
      await deleteDoc(invitationDocRef);

      setInvitation(null);
      fetchUserStable();
      Alert.alert("Du er nu medlem af stalden!");
    } catch (error) {
      console.error("Fejl ved accept ", error);
      Alert.alert("Fejl, kunne ikke acceptere invitation!");
    }
  };

  // Removes invitation when user declines
  const handleDeclineInvitation = async () => {
    if (!invitation) {
      return;
    }

    try {
      const invitationDocRef = doc(db, "invitations", invitation.id);
      await deleteDoc(invitationDocRef);

      setInvitation(null);
      Alert.alert("Du har afvist invitationen!");
    } catch (error) {
      console.error("Fejl ved afvisning af invitation ", error);
      Alert.alert("Fejl ved afvisning af invitation!");
    }
  };

  // Opens modal by changing visibility
  const openModal = () => {
    setModalVisible(true);
  };

  // Closes modal by chaning visibility
  const closeModal = () => {
    setModalVisible(false);
  };

  // Close modal and fetch users stable when they have submitted
  const handleModalSubmit = () => {
    closeModal();
    fetchUserStable();
  };
  // If user exists then fetching user stable adn setting ready
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsUserReady(true);
        fetchUserStable();
        fetchUserInvitation();
      } else {
        setIsUserReady(false);
        setStable(null);
        setInvitation(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isUserReady) {
      fetchUserStable();
    }
  }, [segments, isUserReady]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {stable ? (
        <>
          <View style={styles.stableCard}>
            <Text style={styles.stableTitle}>{stable.name}</Text>
            <Text style={styles.stableInfo}>E-mail: {stable.email}</Text>
            <Text style={styles.stableInfo}>tlf. nummer: {stable.phone}</Text>
            <Text style={styles.stableInfo}>
              Antal medlemmer: {stable.numOfMembers}
            </Text>

            {/* Show the Add Member and Add Horse buttons side by side if the user is an admin */}
            {stable.isAdmin && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.addMemberButton}
                  onPress={() => router.push("../stables/AddMember")}
                >
                  <Text style={styles.buttonText}>+ Tilføj medlem</Text>
                </TouchableOpacity>

                {/* Add Horse Button for Admins */}
                <AddHorseButton onPress={openModal} />
              </View>
            )}
          </View>
          <View style={styles.allHorses}>
            {/* View All Horses */}
            <ViewAllHorsesScreen />

          </View>
        </>
      ) : (
        <View style={styles.container}>
          {/* Button for creating a new stable */}
          <TouchableOpacity
            style={styles.createStableButton}
            onPress={() => router.push("../stables/CreateStableScreen")}
          >
            <Text style={styles.buttonText}>Opret stald</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Horse Modal */}
      <AddHorseModal
        visible={isModalVisible}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />

      {/* Invitations and Stables */}
      <View style={styles.stableCard}>
        <TouchableOpacity
          style={styles.createStableButton}
          onPress={() => router.push("../stables/ViewAllStables")}
        >
          <Text style={styles.buttonText}>Se alle stalde</Text>
        </TouchableOpacity>

        {invitation && (
          <View style={styles.inviContainer}>
            <Text style={styles.stableInfo}>
              Du er blevet inviteret til at være medlem af:{" "}
              {invitation.stableName}
            </Text>
            <TouchableOpacity
              style={styles.addMemberButton}
              onPress={handleAcceptInvitation}
            >
              <Text style={styles.buttonText}>Accepter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addMemberButton}
              onPress={handleDeclineInvitation}
            >
              <Text style={styles.buttonText}>Afvis</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fcf7f2",
    flex: 1,
  },
  inviContainer: {
    flex: 1,
    backgroundColor: "#fcf7f2",
    gap: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fcf7f2",
  },
  addMemberButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#ffffff",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addHorseButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  stableCard: {
    backgroundColor: "#FCF7F2",
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
  },
  stableTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  stableInfo: {
    fontSize: 16,
    marginBottom: 5,
    color: "#000",
  },
  createStableButton: {
    marginTop: 10,
    width: 200,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#ffffff",
    alignSelf: "center",
  },
  allHorses: {
    flex: 1
  }
});
