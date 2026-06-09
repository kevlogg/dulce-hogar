import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nextPaymentDate, currentAmount, planType } = body;

    if (!nextPaymentDate || !currentAmount) {
      return NextResponse.json(
        { error: "nextPaymentDate and currentAmount are required" },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Parse the date to get the month in YYYY-MM format
    const adjustmentDate = new Date(nextPaymentDate);

    // Get the last 6 months before the adjustment date
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(adjustmentDate);
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      months.push(`${year}-${month}`);
    }

    // Fetch IPC records for those months
    const snapshot = await db.collection("ipc_records")
      .where("month", "in", months)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        hasData: false,
        factor: null,
        estimatedAmount: null,
        message: "No IPC data available for the adjustment period"
      });
    }

    // Sort by month to ensure correct order
    const records = snapshot.docs
      .map(doc => ({
        month: doc.data().month,
        factor: doc.data().factor
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Check if we have all 6 months
    if (records.length < 6) {
      return NextResponse.json({
        hasData: false,
        factor: null,
        estimatedAmount: null,
        message: `Only ${records.length} months of IPC data available (need 6)`
      });
    }

    // Calculate cumulative factor by multiplying all factors
    const cumulativeFactor = records.reduce((acc, record) => acc * record.factor, 1);

    // Calculate estimated amount
    const estimatedAmount = Math.round(currentAmount * cumulativeFactor);

    return NextResponse.json({
      hasData: true,
      factor: parseFloat((cumulativeFactor - 1).toFixed(4)), // Return as percentage
      cumulativeFactor: parseFloat(cumulativeFactor.toFixed(6)),
      currentAmount,
      estimatedAmount,
      difference: estimatedAmount - currentAmount,
      monthsUsed: records.map(r => r.month),
      breakdown: records.map(r => ({
        month: r.month,
        factor: r.factor
      }))
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error calculating estimate" }, { status: 500 });
  }
}
