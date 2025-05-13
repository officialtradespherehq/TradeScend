import { useEffect, useState, useCallback } from "react";
import { doc, getDoc, Timestamp, updateDoc, onSnapshot, collection, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./use-auth";
import { useInvestments } from "./useInvestments";
import { useTransactions } from "./useTransactions";

// Helper function to safely convert any timestamp format to a Date object
function safelyConvertToDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  
  try {
    // If it's a Firestore Timestamp with toDate method
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // If it's already a Date
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    // If it's a number (milliseconds since epoch)
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    
    // If it's a string that can be parsed
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // If it's a Firestore timestamp-like object with seconds and nanoseconds
    if (timestamp && typeof timestamp.seconds === 'number') {
      return new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
    }
  } catch (error) {
    console.error("Error converting timestamp:", error);
    return null;
  }
  
  return null;
}

export function useBalance() {
  const { user } = useAuth();
  const { investments } = useInvestments();
  const { create: createTransaction } = useTransactions();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to refresh balance manually
  const refreshBalance = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
  // Fetch balance from database and set up real-time listener
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Set up real-time listener for the user's balance
    const userRef = doc(db, "Users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setBalance(userData.balance || 0);
      } else {
        // If user document doesn't exist, set balance to 0
        setBalance(0);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to balance updates:", error);
      setLoading(false);
      
      // Fallback to one-time fetch if real-time listener fails
      const fetchBalance = async () => {
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setBalance(docSnap.data().balance || 0);
          }
        } catch (err) {
          console.error("Error fetching balance:", err);
        }
        setLoading(false);
      };
      
      fetchBalance();
    });

    // Listen for recent transactions that might affect balance
    const recentTransactionsQuery = query(
      collection(db, "Transactions"),
      where("uid", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(5)
    );
    
    const transactionsUnsubscribe = onSnapshot(recentTransactionsQuery, () => {
      // When new transactions come in, we don't need to update balance directly
      // as the user document listener will handle that
      console.log("New transaction detected");
    });

    return () => {
      unsubscribe();
      transactionsUnsubscribe();
    };
  }, [user, refreshTrigger]);

  // Process ROI payouts from active investments
  useEffect(() => {
    if (!user || !investments.length) return;

    const updateBalanceFromInvestments = async () => {
      const activeInvestments = investments.filter(inv => inv.status === 'active');
      
      for (const investment of activeInvestments) {
        // Safely convert timestamps to Date objects using our helper function
        const lastPayoutDate = safelyConvertToDate(investment.lastPayout);
        const timestampDate = safelyConvertToDate(investment.timestamp);
        
        // Use lastPayout if available, otherwise fall back to timestamp
        const lastPayout = lastPayoutDate || timestampDate;
        
        // Skip this investment if we couldn't get a valid date
        if (!lastPayout) {
          console.error('No valid timestamp found for investment:', investment.id);
          continue;
        }
        
        const now = new Date();
        const hoursSinceLastPayout = Math.floor((now.getTime() - lastPayout.getTime()) / (1000 * 60 * 60));
        // Skip if we don't have a valid investment start date
        if (!timestampDate) {
          console.error('No valid start timestamp found for investment:', investment.id);
          continue;
        }
        
        const daysSinceInvestmentStart = Math.floor((now.getTime() - timestampDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if investment has completed its 30-day period
        if (daysSinceInvestmentStart >= 30) {
          try {
            // If this is the first time we're detecting the investment is complete, mark it as completed
            if (investment.status === 'active') {
              const investmentRef = doc(db, "Investments", investment.id);
              await updateDoc(investmentRef, {
                status: 'completed',
                lastPayout: Timestamp.now()
              });
              
              console.log(`Investment ${investment.id} completed after 30 days`);
            }
            // Skip ROI processing for completed investments
            continue;
          } catch (error) {
            console.error(`Error completing investment ${investment.id}:`, error);
          }
        }
        
        // Process first payout immediately for new active investments, then follow daily schedule
        if (!investment.lastPayout || hoursSinceLastPayout >= 24) {
          try {
            // Calculate daily ROI based on monthly ROI
            // Ensure we have valid numbers for the calculation
            const investmentAmount = Number(investment.amount) || 0;
            const roiPercentage = Number(investment.roi) || 0;
            
            // Calculate daily return
            const dailyReturn = (investmentAmount * (roiPercentage / 100)) / 30;
            
            // Round to 2 decimal places for currency
            const roundedDailyReturn = Math.round(dailyReturn * 100) / 100;
            
            // Only proceed if the amount is greater than zero
            if (roundedDailyReturn > 0) {
              // Get the latest balance from the database to ensure accuracy
              const userRef = doc(db, "Users", user.uid);
              const userSnap = await getDoc(userRef);
              
              if (userSnap.exists()) {
                const currentBalance = userSnap.data().balance || 0;
                const newBalance = currentBalance + roundedDailyReturn;
                
                // Update user's balance in the database
                await updateDoc(userRef, {
                  balance: newBalance,
                });
                
                // Create transaction record
                await createTransaction({
                  type: 'roi',
                  amount: roundedDailyReturn,
                  description: `Daily ROI from ${investment.planName} plan (Day ${daysSinceInvestmentStart + 1} of 30)`
                });
                
                console.log(`Processed daily ROI payment for investment ${investment.id}: $${roundedDailyReturn}`);
                // No need to update local state as the onSnapshot listener will handle it
              }
            }
            
            // Update investment's last payout regardless of whether we created a transaction
            const investmentRef = doc(db, "Investments", investment.id);
            await updateDoc(investmentRef, {
              lastPayout: Timestamp.now()
            });
          } catch (error) {
            console.error(`Error processing ROI for investment ${investment.id}:`, error);
          }
        }
      }
    };

    // Set up an interval to check for ROI payouts every hour
    updateBalanceFromInvestments();
    const interval = setInterval(updateBalanceFromInvestments, 3600000); // Check every hour
    
    return () => clearInterval(interval);
  }, [user, investments, createTransaction]);

  // Function to update balance directly (for topups, withdrawals, etc.)
  const updateBalance = useCallback(async (amount: number, type: 'add' | 'subtract' = 'add') => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      // Get the latest balance from the database
      const userRef = doc(db, "Users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error("User document not found");
      }
      
      const currentBalance = userSnap.data().balance || 0;
      const newBalance = type === 'add' ? currentBalance + amount : currentBalance - amount;
      
      // Prevent negative balance for withdrawals
      if (type === 'subtract' && newBalance < 0) {
        throw new Error("Insufficient balance");
      }
      
      // Update the balance in the database
      await updateDoc(userRef, {
        balance: newBalance
      });
      
      // The onSnapshot listener will update the local state
      return newBalance;
    } catch (error) {
      console.error("Error updating balance:", error);
      throw error;
    }
  }, [user]);
  
  // Function for topups specifically
  const topup = useCallback(async (amount: number) => {
    return updateBalance(amount, 'add');
  }, [updateBalance]);
  
  // Function for withdrawals specifically
  const withdraw = useCallback(async (amount: number) => {
    return updateBalance(amount, 'subtract');
  }, [updateBalance]);

  return { 
    balance, 
    loading, 
    updateBalance,
    topup,
    withdraw,
    refreshBalance
  };
}
