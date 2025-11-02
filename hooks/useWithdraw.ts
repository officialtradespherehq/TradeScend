import { useEffect, useState } from "react";
import { collection, addDoc, Timestamp, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./use-auth";
import { useMailNotification } from "./useMailNotification";

export function useWithdraw() {
  const { user } = useAuth();
  const { notifyWithdrawal } = useMailNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchName = async () => {
      if (user?.uid) {
        const docRef = doc(db, "Users", user.uid)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          setUserName(snap.data().name)
        }
      }
    }

    fetchName()
  }, [user])
  
  // NOTE: maturity-based withdraw restrictions removed — withdrawals
  // will be controlled by KYC and balance checks only in the UI.

  const submitWithdraw = async (amount: number, wallet: string, coin: string) => {
    setLoading(true)
    setError(null)

    try {
      // Get current user balance
      const userRef = doc(db, "Users", user?.uid || "");
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        setError("User data not found");
        return false;
      }
      
      const userData = userSnap.data();
      const currentBalance = userData.balance || 0;
      
      // Validate withdrawal amount
      if (amount <= 0) {
        setError("Withdrawal amount must be greater than zero");
        return false;
      }
      
      if (amount > currentBalance) {
        setError("Insufficient balance for this withdrawal");
        return false;
      }
      
      // Maturity check removed — allow withdrawal if balance and other
      // validations pass. Any business rules should be enforced server-side.
      
      // Create withdrawal request in the withdrawals collection
      // This will be the single source of truth for withdrawals
      const withdrawalRef = await addDoc(collection(db, "withdrawals"), {
        userId: user?.uid,
        name: userName,
        email: user?.email,
        amount,
        walletAddress: wallet,
        coin,
        status: "pending",
        createdAt: Timestamp.now(),
      });
      
      // Update user balance
      const newBalance = currentBalance - amount;
      await updateDoc(userRef, {
        balance: newBalance
      });
      
      // Send email notification to admin about withdrawal request
      try {
        await notifyWithdrawal({
          userName: userName || 'User',
          userEmail: user?.email || undefined,
          userId: user?.uid,
          amount,
          walletAddress: wallet,
          coin
        });
        console.log("Withdrawal notification sent successfully");
      } catch (notificationError) {
        console.error("Failed to send withdrawal notification:", notificationError);
        // Continue with withdrawal process even if notification fails
      }
      
      // Note: We're not creating a separate transaction record in the Transactions collection
      // because the useTransactions hook already fetches from both collections
      // and was causing duplicate entries
      
      return true;
    } catch (err: any) {
      console.error("Withdrawal error:", err);
      setError("Failed to submit withdrawal.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { submitWithdraw, loading, error };
}
