import { useEffect, useState } from "react";
import { collection, addDoc, Timestamp, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./use-auth";
import { useInvestments } from "./useInvestments";
import { useMailNotification } from "./useMailNotification";

export function useWithdraw() {
  const { user } = useAuth();
  const { investments } = useInvestments();
  const { notifyWithdrawal } = useMailNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [canWithdraw, setCanWithdraw] = useState(false);

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
  
  // Check if user has any completed investments (matured for 30 days)
  useEffect(() => {
    if (!user || !investments.length) return;
    
    // User can withdraw if they have at least one completed investment
    // or if they have an active investment that's older than 30 days
    const hasCompletedInvestment = investments.some(inv => 
      inv.status === 'completed' || 
      (inv.status === 'active' && inv.daysRemaining === 0)
    );
    
    setCanWithdraw(hasCompletedInvestment);
  }, [user, investments]);

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
      
      // Check if user has any completed investments
      if (!canWithdraw) {
        setError("You can only withdraw after your investments have matured for 30 days");
        return false;
      }
      
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

  return { submitWithdraw, loading, error, canWithdraw };
}
