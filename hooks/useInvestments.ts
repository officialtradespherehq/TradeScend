import { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, Timestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./use-auth";
import { useMailNotification } from "./useMailNotification";

type Investment = {
  id: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  transactionHash: string;
  uid: string;
  status: string;
  timestamp: Timestamp;
  lastPayout?: Timestamp;
  roi: number;
  max: number;
  completionDate?: Timestamp;
  daysRemaining?: number;
};

export type InvestmentData = {
  planName: string;
  amount: number;
  paymentMethod: string;
  transactionHash: string;
};

export function useInvestments() {
  const { user } = useAuth();
  const { notifyInvestment } = useMailNotification();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchInvestments = async () => {
      const q = query(
        collection(db, "Investments"),
        where("uid", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as Investment[];
      setInvestments(data);
      setLoading(false);
    };

    const fetchUserName = async () => {
      if (user?.uid) {
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
        }
      }
    };

    fetchInvestments();
    fetchUserName();
  }, [user]);

  const create = async (investmentData: InvestmentData) => {
    if (!user) throw new Error("User not authenticated");

    // Get ROI percentage based on plan name
    let roiPercentage = 0;
    switch(investmentData.planName.toLowerCase()) {
      case "starter":
        roiPercentage = 5; // 5% monthly ROI
        break;
      case "standard":
        roiPercentage = 8; // 8% monthly ROI
        break;
      case "premium":
        roiPercentage = 12; // 12% monthly ROI
        break;
      case "platinum":
        roiPercentage = 15; // 15% monthly ROI
        break;
      default:
        roiPercentage = 5; // Default to 5% if plan not recognized
    }

    const newInvestment = {
      ...investmentData,
      uid: user.uid,
      status: "pending",
      timestamp: Timestamp.now(),
      roi: roiPercentage,
      max: 30, // 30 days investment period
      daysRemaining: 30
    };

    const docRef = await addDoc(collection(db, "Investments"), newInvestment);
    const createdInvestment = { 
      id: docRef.id, 
      ...newInvestment,
      timestamp: newInvestment.timestamp
    } as Investment;
    setInvestments((prev) => [createdInvestment, ...prev]);
    
    // Send email notification to admin about new investment
    try {
      await notifyInvestment({
        userName: userName || user.email || 'User',
        userEmail: user.email || undefined,
        userId: user.uid,
        amount: investmentData.amount,
        investmentPlan: investmentData.planName
      });
      console.log("Investment notification sent successfully");
    } catch (notificationError) {
      console.error("Failed to send investment notification:", notificationError);
      // Continue with investment creation even if notification fails
    }
    
    return createdInvestment;
  };

  // Function to activate a pending investment
  const activateInvestment = async (investmentId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const investmentRef = doc(db, "Investments", investmentId);
      await updateDoc(investmentRef, {
        status: "active",
        // Set the activation timestamp
        timestamp: Timestamp.now()
      });
      
      // Update local state
      setInvestments(prev => 
        prev.map(inv => 
          inv.id === investmentId 
            ? { ...inv, status: "active", timestamp: Timestamp.now() } 
            : inv
        )
      );
      
      return true;
    } catch (error) {
      console.error("Error activating investment:", error);
      return false;
    }
  };

  // Function to calculate days remaining for an investment
  const calculateDaysRemaining = (investment: Investment): number => {
    if (investment.status === "completed") return 0;
    
    // Handle both Timestamp and Date objects
    const startDate = investment.timestamp instanceof Date 
      ? investment.timestamp 
      : investment.timestamp.toDate();
    
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 30 - daysPassed);
    
    return daysRemaining;
  };

  // Function to get investments with calculated days remaining
  const getInvestmentsWithDaysRemaining = () => {
    return investments.map(investment => ({
      ...investment,
      daysRemaining: calculateDaysRemaining(investment)
    }));
  };

  return { 
    investments: getInvestmentsWithDaysRemaining(), 
    loading, 
    create, 
    activateInvestment,
    calculateDaysRemaining
  };
}