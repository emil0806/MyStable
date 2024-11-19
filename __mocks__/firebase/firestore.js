const mockDatabase = {
  invitations: [
    {
      id: "invitation-id",
      invitedUserId: "test-user-id",
      stableName: "Invitation Stable",
      stableId: "test-stable-id",
    },
  ],
};

// Mock for Firestore
export const getFirestore = jest.fn();

export const doc = jest.fn((db, collection, id) => ({
  id,
  collection,
}));

export const setDoc = jest.fn((docRef, data) => {
  const key = `${docRef.collection}/${docRef.id}`;
  mockDatabase[key] = data;
  return Promise.resolve();
});

export const getDoc = jest.fn((docRef) => {
  const key = `${docRef.collection}/${docRef.id}`;
  const data = mockDatabase[key];
  return Promise.resolve({
    exists: () => !!data,
    data: () => data || null,
  });
});

export const deleteDoc = jest.fn((docRef) => {
  const key = `${docRef.collection}/${docRef.id}`;
  delete mockDatabase[key];
  return Promise.resolve();
});

export const collection = jest.fn((db, collectionName) => ({
  collectionName,
}));

export const query = jest.fn((collectionRef, ...constraints) => ({
  collectionRef,
  constraints,
}));

export const where = jest.fn((field, operator, value) => ({
  field,
  operator,
  value,
}));

export const getDocs = jest.fn((query) =>
  Promise.resolve({
    empty: mockDatabase[query.collectionRef.collectionName].length === 0,
    docs: mockDatabase[query.collectionRef.collectionName]
      .filter((doc) => {
        // Filter mock data based on query constraints
        return query.constraints.every((constraint) => {
          const { field, operator, value } = constraint;
          if (operator === "==") {
            return doc[field] === value;
          }
          return false;
        });
      })
      .map((doc) => ({
        id: doc.id,
        data: () => doc,
      })),
  })
);
