export const currentUser = { name: "Abdul Wadood", email: "abdul@example.com", initials: "AW" };

export const projects = [
  { id: "atlas", name: "Atlas redesign", client: "Northstar Labs", code: "ATL-24", color: "#6C5CE7", hours: 74.5, budget: 120, members: 8, rate: 95, status: "Active" },
  { id: "mobile", name: "Mobile app", client: "Luma Health", code: "LUMA-08", color: "#0EA5A4", hours: 52.25, budget: 90, members: 5, rate: 110, status: "Active" },
  { id: "brand", name: "Brand system", client: "Form & Field", code: "FNF-12", color: "#F59E0B", hours: 28.75, budget: 40, members: 4, rate: 85, status: "Active" },
  { id: "research", name: "Discovery research", client: "Kanso", code: "KAN-03", color: "#EC4899", hours: 16, budget: 24, members: 3, rate: 90, status: "Archived" },
];

export const entries = [
  { id: 1, project: "Atlas redesign", color: "#6C5CE7", description: "Design review and component refinements", date: "Today", time: "09:12 – 11:48", duration: "2h 36m", billable: true, status: "Approved" },
  { id: 2, project: "Mobile app", color: "#0EA5A4", description: "Authentication flow implementation", date: "Today", time: "12:35 – 14:47", duration: "2h 12m", billable: true, status: "Approved" },
  { id: 3, project: "Brand system", color: "#F59E0B", description: "Typography documentation", date: "Yesterday", time: "10:08 – 12:15", duration: "2h 07m", billable: false, status: "Approved" },
  { id: 4, project: "Atlas redesign", color: "#6C5CE7", description: "Dashboard responsive states", date: "Yesterday", time: "13:30 – 17:05", duration: "3h 35m", billable: true, status: "Submitted" },
  { id: 5, project: "Mobile app", color: "#0EA5A4", description: "Sprint planning", date: "Aug 4", time: "09:30 – 10:45", duration: "1h 15m", billable: false, status: "Approved" },
];

export const team = [
  { name: "Abdul Wadood", email: "abdul@example.com", role: "Owner", initials: "AW", color: "violet", hours: "38h 42m", status: "Active" },
  { name: "Maya Chen", email: "maya@example.com", role: "Admin", initials: "MC", color: "teal", hours: "34h 18m", status: "Active" },
  { name: "Jon Bell", email: "jon@example.com", role: "Member", initials: "JB", color: "amber", hours: "31h 05m", status: "Active" },
  { name: "Nadia Ahmed", email: "nadia@example.com", role: "Member", initials: "NA", color: "rose", hours: "27h 40m", status: "Active" },
];

export const weekData = [
  { day: "Mon", billable: 6.4, nonbillable: 1.2 }, { day: "Tue", billable: 7.2, nonbillable: .5 },
  { day: "Wed", billable: 5.8, nonbillable: 1.5 }, { day: "Thu", billable: 7.6, nonbillable: .8 },
  { day: "Fri", billable: 4.9, nonbillable: 1.1 }, { day: "Sat", billable: 0, nonbillable: 0 }, { day: "Sun", billable: 0, nonbillable: 0 },
];
