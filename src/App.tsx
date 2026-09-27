import React, { useEffect } from 'react';
import { HealthProvider, useHealth } from './context/HealthContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { initAndroidNativeFeatures } from './utils/androidInit';
import { DesktopHeader } from './components/layout/DesktopHeader';
import { LineLiffContainer } from './components/layout/LineLiffContainer';
import { GoldenCaseSelector } from './components/ingestion/GoldenCaseSelector';
import { LifeExpectancyClock } from './components/dashboard/LifeExpectancyClock';
import { DynamicLifeTree } from './components/dashboard/DynamicLifeTree';
import { OrganMap3D } from './components/dashboard/OrganMap3D';
import { ChronosRingsCard } from './components/dashboard/ChronosRingsCard';
import { TrendHighlightCards } from './components/dashboard/TrendHighlightCards';
import { FamilyCompanionCard } from './components/dashboard/FamilyCompanionCard';
import { TrendChartModal } from './components/trends/TrendChartModal';
import { EventAnnotationBar } from './components/trends/EventAnnotationBar';
import { FittVpPlanCard } from './components/intervention/FittVpPlanCard';
import { CommunityResourceHub } from './components/intervention/CommunityResourceHub';
import { LineChatView } from './components/chat/LineChatView';
import { PrivacyCompliance } from './components/settings/PrivacyCompliance';

// Modals
import { RedFlagAlertModal } from './components/chat/RedFlagAlertModal';
import { AuditWorkbench } from './components/ingestion/AuditWorkbench';
import { IngestionModal } from './components/ingestion/IngestionModal';
import { SourceTraceModal } from './components/trends/SourceTraceModal';
import { DoctorSummaryModal } from './components/trends/DoctorSummaryModal';
import { WearableSyncModal } from './components/settings/WearableSyncModal';

const MainContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab,
    redFlagModal,
    closeRedFlagModal,
    selectedRecordForTrace,
    setSelectedRecordForTrace,
    isDoctorSummaryOpen,
    setIsDoctorSummaryOpen,
    isAuditWorkbenchOpen,
    setIsAuditWorkbenchOpen,
    isIngestionModalOpen,
    setIsIngestionModalOpen,
    isWearableModalOpen,
    setIsWearableModalOpen,
    isPrivacyModalOpen,
    setIsPrivacyModalOpen
  } = useHealth();

  // Android 原生硬體返回鍵與狀態列適配
  useEffect(() => {
    initAndroidNativeFeatures({
      onBackButton: () => {
        if (redFlagModal.isOpen) {
          closeRedFlagModal();
          return true;
        }
        if (selectedRecordForTrace) {
          setSelectedRecordForTrace(null);
          return true;
        }
        if (isDoctorSummaryOpen) {
          setIsDoctorSummaryOpen(false);
          return true;
        }
        if (isAuditWorkbenchOpen) {
          setIsAuditWorkbenchOpen(false);
          return true;
        }
        if (isIngestionModalOpen) {
          setIsIngestionModalOpen(false);
          return true;
        }
        if (isWearableModalOpen) {
          setIsWearableModalOpen(false);
          return true;
        }
        if (isPrivacyModalOpen) {
          setIsPrivacyModalOpen(false);
          return true;
        }
        if (activeTab !== 'dashboard') {
          setActiveTab('dashboard');
          return true;
        }
        return false;
      }
    });
  }, [
    activeTab,
    setActiveTab,
    redFlagModal.isOpen,
    closeRedFlagModal,
    selectedRecordForTrace,
    setSelectedRecordForTrace,
    isDoctorSummaryOpen,
    setIsDoctorSummaryOpen,
    isAuditWorkbenchOpen,
    setIsAuditWorkbenchOpen,
    isIngestionModalOpen,
    setIsIngestionModalOpen,
    isWearableModalOpen,
    setIsWearableModalOpen,
    isPrivacyModalOpen,
    setIsPrivacyModalOpen
  ]);

  return (
    <>
      <DesktopHeader />

      {/* 頂部常駐：三大黃金驗收案例快捷載入列 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <GoldenCaseSelector />
      </div>

      {/* 主視圖容器 (支援 LINE LIFF 手機框 與 桌面寬螢幕切換) */}
      <LineLiffContainer>
        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            {/* 秒級餘命倒數時鐘 */}
            <LifeExpectancyClock />

            {/* Apple 極簡架構：健康與生命同心三環 (Chronos Rings) */}
            <ChronosRingsCard />

            {/* 雙欄：動態生命樹 + 親情陪診 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6">
                <DynamicLifeTree />
              </div>
              <div className="lg:col-span-6">
                <FamilyCompanionCard />
              </div>
            </div>

            {/* 3D 動態器官地圖 (7大系統與老化倍數) */}
            <OrganMap3D />

            {/* 趨勢亮點卡 (3級優先權) */}
            <TrendHighlightCards />
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-5">
            <TrendChartModal />
            <EventAnnotationBar />
          </div>
        )}

        {activeTab === 'fittvp' && (
          <div className="space-y-5">
            <FittVpPlanCard />
            <CommunityResourceHub />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-5">
            <LineChatView />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-5">
            <PrivacyCompliance />
            <CommunityResourceHub />
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-5">
            <TrendChartModal />
            <TrendHighlightCards />
          </div>
        )}
      </LineLiffContainer>

      {/* 全局互動彈窗 */}
      <RedFlagAlertModal />
      <AuditWorkbench />
      <IngestionModal />
      <SourceTraceModal />
      <DoctorSummaryModal />
      <WearableSyncModal />
    </>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <img src="/icon-192.png" className="w-16 h-16 rounded-2xl animate-pulse" alt="Loading" />
        <span className="text-xs text-slate-400 font-mono">SQLite 後台連線中...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <HealthProvider>
      <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
        <MainContent />
      </div>
    </HealthProvider>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
