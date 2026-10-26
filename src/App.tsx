import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "./components/Layout.tsx";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Transfer from "./pages/Transfer.tsx";
import History from "./pages/History.tsx";
import Budget from "./pages/Budget.tsx";
import Bills from "./pages/Bills.tsx";
import Goals from "./pages/Goals.tsx";
import Cards from "./pages/Cards.tsx";
import QrPay from "./pages/QrPay.tsx";
import TopUp from "./pages/TopUp.tsx";
import Exchange from "./pages/Exchange.tsx";
import Settings from "./pages/Settings.tsx";
import Kyc from "./pages/Kyc.tsx";
import { BudgetProvider } from "./lib/budgetStore.tsx";
import { BillsProvider } from "./lib/billStore.tsx";
import { GoalProvider } from "./lib/goalStore.tsx";
import { CardProvider } from "./lib/cardStore.tsx";
import { NotificationProvider } from "./lib/notificationStore.tsx";

function AppLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <BudgetProvider>
      <BillsProvider>
        <GoalProvider>
          <CardProvider>
            <NotificationProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/transfer" element={<Transfer />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/bills" element={<Bills />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/cards" element={<Cards />} />
                  <Route path="/qr-pay" element={<QrPay />} />
                  <Route path="/topup" element={<TopUp />} />
                  <Route path="/exchange" element={<Exchange />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/kyc" element={<Kyc />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
            </NotificationProvider>
          </CardProvider>
        </GoalProvider>
      </BillsProvider>
    </BudgetProvider>
  );
}
