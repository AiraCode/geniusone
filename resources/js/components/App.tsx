import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "./layout/AppLayout";
import { PurchaseRequisition } from "../pages/PurchaseRequisition";
import { PurchaseOrder } from "../pages/PurchaseOrder";
import { PurchaseOrderReport } from "../pages/PurchaseOrderReport";
import { Warehouse } from "../pages/Warehouse";
import { PurchaseRequisitionDetail } from "../pages/PurchaseRequisitionDetail";
import { PurchaseOrderDetail } from "../pages/PurchaseOrderDetail";
import { PurchaseOrderReportDetail } from "../pages/PurchaseOrderReportDetail";
import { WarehouseDetail } from "../pages/WarehouseDetail";
import { WarehouseCreate } from "../pages/WarehouseCreate";
import { EditProfile } from "../pages/EditProfile";
import { Login } from "../pages/Login";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { navigation, docToSlug } from "../data/mockData";
import type { PageKey, ViewState, TableRow } from "../types";

interface AppProps {
  initialPage?: string;
  initialCode?: string;
}

function resolveViewStateFromPath(pathname: string, defaultPage: PageKey = "report"): ViewState {
  const cleanPath = pathname.replace(/\/$/, "");

  // Authentication & User Profile routes
  if (cleanPath === "/login") {
    return { type: "login" };
  }
  if (cleanPath === "/profile/edit" || cleanPath === "/edit-profile") {
    return { type: "edit-profile" };
  }

  // Create routes
  if (cleanPath === "/warehouse/create" || cleanPath === "/warehouse/add") {
    return { type: "warehouse-create" };
  }

  // Detail routes
  const prDetailMatch = cleanPath.match(/^\/(?:pr|purchase-requisition|purchase-requisitions)\/details?\/(.+)$/);
  if (prDetailMatch) {
    return { type: "pr-detail", code: decodeURIComponent(prDetailMatch[1]) };
  }

  const poDetailMatch = cleanPath.match(/^\/po\/details?\/(.+)$/);
  if (poDetailMatch) {
    return { type: "po-detail", code: decodeURIComponent(poDetailMatch[1]) };
  }

  const reportDetailMatch = cleanPath.match(/^\/report\/details?\/(.+)$/);
  if (reportDetailMatch) {
    return { type: "report-detail", code: decodeURIComponent(reportDetailMatch[1]) };
  }

  const warehouseDetailMatch = cleanPath.match(/^\/warehouse\/details?\/(.+)$/);
  if (warehouseDetailMatch) {
    return { type: "warehouse-detail", code: decodeURIComponent(warehouseDetailMatch[1]) };
  }

  // List routes
  if (cleanPath === "/pr" || cleanPath === "/purchase-requisitions" || cleanPath === "/purchase-requests") {
    return { type: "list", page: "pr" };
  }
  if (cleanPath === "/po" || cleanPath === "/purchase-orders") {
    return { type: "list", page: "po" };
  }
  if (cleanPath === "/report" || cleanPath === "/pr-po-report" || cleanPath === "") {
    return { type: "list", page: "report" };
  }
  if (cleanPath === "/warehouse" || cleanPath === "/warehouse/bpb") {
    return { type: "list", page: "warehouse" };
  }

  return { type: "list", page: defaultPage };
}

export function App({ initialPage = "report", initialCode = "" }: AppProps) {
  const [viewState, setViewState] = useState<ViewState>(() => {
    if (typeof window !== "undefined") {
      return resolveViewStateFromPath(window.location.pathname, (initialPage as PageKey) || "report");
    }
    if (initialPage === "login") return { type: "login" };
    if (initialPage === "edit-profile" || initialPage === "profile.edit") return { type: "edit-profile" };
    if (initialPage === "warehouse-create") return { type: "warehouse-create" };
    if (initialPage === "pr-detail") return { type: "pr-detail", code: initialCode || "0026-PR-IMLI-X-2026" };
    if (initialPage === "po-detail") return { type: "po-detail", code: initialCode || "POL-1026-0040" };
    if (initialPage === "report-detail") return { type: "report-detail", code: initialCode || "POL-1026-0040" };
    if (initialPage === "warehouse-detail") return { type: "warehouse-detail", code: initialCode || "0138-WHIN-IMLI-G-X-2026" };
    return { type: "list", page: (initialPage as PageKey) || "report" };
  });

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Calculate corresponding active sidebar section
  const activeSidebarPage: PageKey | null =
    viewState.type === "list"
      ? viewState.page
      : viewState.type === "pr-detail"
      ? "pr"
      : viewState.type === "po-detail"
      ? "po"
      : viewState.type === "report-detail"
      ? "report"
      : viewState.type === "warehouse-detail" || viewState.type === "warehouse-create"
      ? "warehouse"
      : null;

  const isDetailPage = viewState.type !== "list";

  // Reset scroll position on route transition
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const mainEl = document.querySelector("main");
      if (mainEl) mainEl.scrollTop = 0;
    }
  }, [viewState]);

  // Navigate to list view
  const handleNavigateList = useCallback((targetPage: PageKey) => {
    setViewState({ type: "list", page: targetPage });

    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      const targetNav = navigation.find((item) => item.key === targetPage);
      const path = targetNav ? targetNav.path : `/${targetPage}`;
      window.history.pushState({ type: "list", page: targetPage }, "", path);
    }
  }, []);

  // Navigate to detail view using slugified document identifier
  const handleNavigateDetail = useCallback(
    (module: "pr" | "po" | "report" | "warehouse", identifier: string) => {
      const slug = docToSlug(identifier);
      let targetPath = `/${module}/detail/${slug}`;
      let nextState: ViewState;

      switch (module) {
        case "pr":
          nextState = { type: "pr-detail", code: slug };
          break;
        case "po":
          nextState = { type: "po-detail", code: slug };
          break;
        case "report":
          nextState = { type: "report-detail", code: slug };
          break;
        case "warehouse":
          nextState = { type: "warehouse-detail", code: slug };
          break;
      }

      setViewState(nextState);

      if (typeof window !== "undefined") {
        window.scrollTo(0, 0);
        window.history.pushState(nextState, "", targetPath);
      }
    },
    []
  );

  // Navigate to create new record view
  const handleNavigateCreate = useCallback((module: "warehouse") => {
    const nextState: ViewState = { type: "warehouse-create" };
    setViewState(nextState);

    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      window.history.pushState(nextState, "", "/warehouse/create");
    }
  }, []);

  // Navigate to edit profile view
  const handleNavigateProfile = useCallback(() => {
    setViewState({ type: "edit-profile" });

    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      window.history.pushState({ type: "edit-profile" }, "", "/profile/edit");
    }
  }, []);

  // Logout request from Header dropdown
  const handleRequestLogout = useCallback(() => {
    setShowLogoutDialog(true);
  }, []);

  // Confirm logout -> navigate to /login
  const handleConfirmLogout = useCallback(() => {
    setShowLogoutDialog(false);
    setViewState({ type: "login" });

    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      window.history.pushState({ type: "login" }, "", "/login");
    }
  }, []);

  // Cancel logout -> dismiss dialog, stay on current page
  const handleCancelLogout = useCallback(() => {
    setShowLogoutDialog(false);
  }, []);

  // Confirm save profile -> navigate to homepage (report)
  const handleProfileSaveConfirmed = useCallback(() => {
    handleNavigateList("report");
  }, [handleNavigateList]);

  // Cancel profile -> return to previous page or homepage
  const handleProfileCancel = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      handleNavigateList("report");
    }
  }, [handleNavigateList]);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== "undefined") {
        const detected = resolveViewStateFromPath(window.location.pathname, "report");
        setViewState(detected);
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Standalone Login page view
  if (viewState.type === "login") {
    return (
      <Login onNavigateHome={() => handleNavigateList("report")} />
    );
  }

  return (
    <>
      <AppLayout
        activePage={activeSidebarPage}
        onNavigate={handleNavigateList}
        onNavigateProfile={handleNavigateProfile}
        onRequestLogout={handleRequestLogout}
        hideDefaultHeader={isDetailPage}
      >
        {/* List Page Views */}
        {viewState.type === "list" && viewState.page === "pr" && (
          <PurchaseRequisition
            onDetail={(row: TableRow) =>
              handleNavigateDetail("pr", row._rawNumber || row._rawPr || row._id || "")
            }
          />
        )}

        {viewState.type === "list" && viewState.page === "po" && (
          <PurchaseOrder
            onDetail={(row: TableRow) =>
              handleNavigateDetail("po", row._rawNumber || row._rawPo || row._id || "")
            }
          />
        )}

        {viewState.type === "list" && viewState.page === "report" && (
          <PurchaseOrderReport
            onDetail={(row: TableRow) =>
              handleNavigateDetail("report", row._rawPo || row._rawPr || row._rawNumber || row._id || "")
            }
          />
        )}

        {viewState.type === "list" && viewState.page === "warehouse" && (
          <Warehouse
            onDetail={(row: TableRow) =>
              handleNavigateDetail("warehouse", row._rawNumber || row._rawRn || row._id || "")
            }
            onCreate={() => handleNavigateCreate("warehouse")}
          />
        )}

        {/* Dedicated Full Page Detail Views */}
        {viewState.type === "pr-detail" && (
          <PurchaseRequisitionDetail
            code={viewState.code}
            onBack={() => handleNavigateList("pr")}
            onNavigateDetail={handleNavigateDetail}
          />
        )}

        {viewState.type === "po-detail" && (
          <PurchaseOrderDetail
            code={viewState.code}
            onBack={() => handleNavigateList("po")}
            onNavigateDetail={handleNavigateDetail}
          />
        )}

        {viewState.type === "report-detail" && (
          <PurchaseOrderReportDetail
            code={viewState.code}
            onBack={() => handleNavigateList("report")}
            onNavigateDetail={handleNavigateDetail}
          />
        )}

        {viewState.type === "warehouse-detail" && (
          <WarehouseDetail
            code={viewState.code}
            onBack={() => handleNavigateList("warehouse")}
            onNavigateDetail={handleNavigateDetail}
          />
        )}

        {/* Dedicated Full Page Create View */}
        {viewState.type === "warehouse-create" && (
          <WarehouseCreate
            onBack={() => handleNavigateList("warehouse")}
            onSaved={() => handleNavigateList("warehouse")}
          />
        )}

        {/* Dedicated Edit Profile View */}
        {viewState.type === "edit-profile" && (
          <EditProfile
            onBack={handleProfileCancel}
            onSaveConfirmed={handleProfileSaveConfirmed}
          />
        )}
      </AppLayout>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmLabel="Confirm Logout"
        cancelLabel="Cancel"
        confirmVariant="danger"
        icon="logOut"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </>
  );
}

export default App;
