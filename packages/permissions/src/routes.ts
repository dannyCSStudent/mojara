import { Permission } from "../../types";

export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  adminDashboard: "dashboard.admin",
  vendorDashboard: "dashboard.vendor",
  profilePage: "profile.read",
};
