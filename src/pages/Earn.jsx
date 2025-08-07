import { useEffect } from 'react';
import { db } from './firebase'; // adjust path
import { collection, addDoc } from 'firebase/firestore';

function Earn() {
  useEffect(() => {
    async function writeTestData() {
      try {
        const docRef = await addDoc(collection(db, "users"), {
          name: "Montasir",
          joined: new Date(),
          telegramId: "123456789"
        });
        console.log("Document written with ID:", docRef.id);
      } catch (error) {
        console.error("Error writing document:", error);
      }
    }

    writeTestData();
  }, []);

  return (
    <div>
      {/* Your original content */}
    </div>
  );
}

export default Earn;
