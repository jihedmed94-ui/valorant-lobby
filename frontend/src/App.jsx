import { HashRouter, Route, Routes } from 'react-router-dom';
import AnalyticsTracker from './components/common/AnalyticsTracker';
import BackgroundLayers from './components/layout/BackgroundLayers';
import SiteHeader from './components/layout/SiteHeader';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import useSiteState from './store/useSiteState';

export default function App() {
  const { state, setState, stats, viewerId } = useSiteState();

  return (
    <HashRouter>
      <AnalyticsTracker />
      <BackgroundLayers />
      <SiteHeader pendingRequests={stats.pendingRequests} />
      <Routes>
        <Route path="/" element={<HomePage state={state} setState={setState} stats={stats} viewerId={viewerId} />} />
        <Route path="/admin" element={<AdminPage state={state} setState={setState} />} />
      </Routes>
    </HashRouter>
  );
}
