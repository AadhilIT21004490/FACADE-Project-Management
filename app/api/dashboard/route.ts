import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Project, Payment, Deadline, ActivityLog } from "@/models";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    await connectDB();

    const projects = await Project.find({ userId });
    const projectIds = projects.map(p => p._id);

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === "active").length;
    const totalRevenue = projects.reduce((sum, p) => sum + (p.paidAmount || 0), 0);

    // Pending payments - calculated as totalValue minus paidAmount across all projects
    const pendingPayments = projects.reduce((sum, p) => {
      const remaining = Math.max(0, (p.totalValue || 0) - (p.paidAmount || 0));
      return sum + remaining;
    }, 0);

    // Upcoming deadlines in the next 15 days
    const now = new Date();
    const fifteenDays = new Date();
    fifteenDays.setDate(fifteenDays.getDate() + 15);

    const upcomingDeadlines = await Deadline.find({
      projectId: { $in: projectIds },
      isCompleted: false,
      date: { $gte: now, $lte: fifteenDays }
    }).sort({ date: 1 }).limit(10).populate("projectId", "name");

    // Recent activities
    const recentActivities = await ActivityLog.find({
      projectId: { $in: projectIds }
    }).sort({ createdAt: -1 }).limit(10).populate("projectId", "name");

    return NextResponse.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        totalRevenue,
        pendingPayments,
        upcomingDeadlines,
        recentActivities
      }
    });
  } catch (error) {
    console.error("[GET /api/dashboard]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}