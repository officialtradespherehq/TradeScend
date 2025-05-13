import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, addDoc, Timestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./use-auth";

export type Transaction = {
  id: string;
  type: 'deposit' | 'withdrawal' | 'roi';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  uid: string;
  description?: string;
}

export type TransactionData = {
  type: 'deposit' | 'withdrawal' | 'roi';
  amount: number;
  description?: string;
}

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch from Transactions collection
      const transactionsQuery = query(
        collection(db, "Transactions"),
        where("uid", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactionsList = transactionsSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            type: data.type,
            amount: Number(data.amount) || 0,
            status: data.status,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
            uid: data.uid,
            description: data.description
          };
        })
        // Filter out transactions with zero amount
        .filter(transaction => transaction.amount > 0);
      
      // Fetch from withdrawals collection
      const withdrawalsQuery = query(
        collection(db, "withdrawals"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
      const withdrawalsList = withdrawalsSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            type: 'withdrawal',
            amount: Number(data.amount) || 0,
            status: data.status,
            timestamp: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            uid: data.userId,
            description: `Withdrawal to ${data.coin || 'crypto'} wallet`
          };
        })
        // Filter out withdrawals with zero amount
        .filter(withdrawal => withdrawal.amount > 0);
      
      // Combine both lists and sort by timestamp
      const combinedTransactions = [...transactionsList, ...withdrawalsList].sort((a, b) => {
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
      
      setTransactions(combinedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh function that can be called from outside the hook
  const refreshTransactions = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, refreshTrigger]);

  const create = async (data: TransactionData) => {
    if (!user) throw new Error("User not authenticated");
    
    // Ensure amount is a valid number and greater than zero
    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) {
      console.warn("Attempted to create transaction with invalid or zero amount");
      throw new Error("Transaction amount must be greater than $0.00"); // Prevent creating transactions with zero or invalid amounts
    }

    const transaction = {
      ...data,
      amount, // Use the validated amount
      uid: user.uid,
      status: 'pending',
      timestamp: Timestamp.now(),
    };

    // Add transaction to Transactions collection
    const docRef = await addDoc(collection(db, "Transactions"), transaction);

    // Update user's balance if it's a deposit
    if (data.type === 'deposit') {
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        balance: user.balance + amount
      });
    }

    const newTransaction = {
      id: docRef.id,
      ...transaction
    };

    setTransactions(prev => [{
      id: newTransaction.id,
      type: newTransaction.type,
      amount: newTransaction.amount,
      status: newTransaction.status as 'pending' | 'completed' | 'failed',
      timestamp: newTransaction.timestamp.toDate(),
      uid: newTransaction.uid,
      description: newTransaction.description
    }, ...prev]);
    return newTransaction;
  };

  return { transactions, loading, create, refreshTransactions };
}
