import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StockDataProvider } from './hooks/useStockData';
import HeroPage from './components/pages/HeroPage';
import DashboardPage from './components/pages/DashboardPage';

import ScrollToTop from './components/ui/ScrollToTop';

function App() {
  return (
    <StockDataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HeroPage />} />
          <Route path="/analysis" element={<DashboardPage />} />
        </Routes>
        <ScrollToTop />
      </Router>
    </StockDataProvider>
  );
}

export default App;
