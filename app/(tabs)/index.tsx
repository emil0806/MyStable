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
import CreateStableLink from "../stables/CreateStableLink";
import { useRouter, useSegments } from "expo-router";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import ViewAllHorsesScreen from "../stables/ViewAllHorses";
import { auth, db } from "@/firebaseConfig";
import React from "react";

export default function TabOneScreen() {
  const [stable, setStable] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUserReady, setIsUserReady] = useState(false);
  const [invitation, setInvitation] = useState<any | null>(null);
  const { colors } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  const fetchUserStable = async () => {
    setLoading(true);
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
            const isAdmin = stableData?.admin === user.uid;
            const isMember = stableData?.members?.includes(user.uid);

            setStable({ ...stableData, isAdmin, isMember }); // Gem admin og medlem status
          } else {
            setStable(null);
          }
        }
      }
    }
    setLoading(false);
  };

  const fetchUserInvitation = async () => {
    const db = getFirestore();
    const user = auth.currentUser;

    if (user) {
      const invitationsRef = collection(db, "invitations");
      const q = query(invitationsRef, where("invitedUserId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const invitationData = querySnapshot.docs[0].data();
        console.log("Fetched invitation:", invitationData);
        setInvitation(invitationData);
      } else {
        setInvitation(null);
      }
    }
  };

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
          numOfMembers: updatedMembers.length - 1,
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // When user is authenticated, set the user readiness flag and fetch data
        setIsUserReady(true);
        fetchUserStable(); // Fetch stable info when the user is authenticated
        fetchUserInvitation();
      } else {
        setIsUserReady(false); // No authenticated user
        setStable(null);
        setInvitation(null);
        setLoading(false); // Stop loading if no user is authenticated
      }
    });

    // Cleanup the auth state listener when the component unmounts
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

            {/* Vis kun knappen til at tilføje medlemmer, hvis brugeren er admin */}
            {stable.isAdmin && (
              <TouchableOpacity
                style={styles.addMemberButton}
                onPress={() => router.push("../stables/AddMember")}
              >
                <Text style={styles.buttonText}>Tilføj medlem</Text>
              </TouchableOpacity>
            )}
          </View>
          <ViewAllHorsesScreen />
        </>
      ) : (
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.createStableButton}
            onPress={() => router.push("../stables/CreateStableScreen")}
          >
            <Text style={styles.buttonText}>Opret stald</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.stableCard}>
        <TouchableOpacity
          style={styles.createStableButton}
          onPress={() => router.push("../stables/ViewAllStables")}
        >
          <Text style={styles.buttonText}>Se alle stalde</Text>
        </TouchableOpacity>

        {invitation && (
          <View style={styles.stableCard}>
            <Text style={styles.stableInfo}>
              Du er blevet inviteret til at deltage i {invitation.stableName}
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
    flex: 1,
    backgroundColor: "#fcf7f2",
  },
  title: {
    fontSize: 36,
    marginBottom: 20,
    textAlign: "center",
  },
  createStableButton: {
    marginTop: 10,
    marginBottom: 50,
    width: 200,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#ffffff",
    alignSelf: "center",
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
  noStableText: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 20,
  },
  addMemberButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#fcf7f2",
  },
});
