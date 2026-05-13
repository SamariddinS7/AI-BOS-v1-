import React, { createContext, useContext, useState } from 'react';

interface FilterContextType {
  dateRange: string;
  setDateRange: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  region: string;
  setRegion: (value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [department, setDepartment] = useState('All Departments');
  const [region, setRegion] = useState('All Regions');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = () => {
    setIsRefreshing(true);
    console.log('Refreshing data with filters:', { dateRange, department, region });
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <FilterContext.Provider value={{ 
      dateRange, setDateRange, 
      department, setDepartment, 
      region, setRegion, 
      onRefresh,
      isRefreshing
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
