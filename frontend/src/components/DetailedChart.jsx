import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useGlobalContext } from "../context/GlobalContext";
import moment from "moment";
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import * as XLSX from "xlsx";
import { Download, FileSpreadsheet } from "lucide-react";
import styled, { keyframes } from "styled-components";

const DetailedChartsContainer = () => {
  const { incomes, expenses, getIncomes, getExpenses } = useGlobalContext();
  const [filter, setFilter] = useState("Monthly");
  const [yearFilter, setYearFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [startMonth, setStartMonth] = useState(moment().startOf("month").format("YYYY-MM"));
  const [endMonth, setEndMonth] = useState(moment().endOf("month").format("YYYY-MM"));
  const [useMonthRange, setUseMonthRange] = useState(false);
  const [visibleMetrics, setVisibleMetrics] = useState({
    income: true,
    expense: true,
    balance: true,
    accountBalance: true,
    cumulativeIncome: true,
    cumulativeExpense: true,
    crossovers: true,
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await getIncomes();
        await getExpenses();
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const isWithinDateRange = useCallback(
    (date) => {
      if (!useMonthRange) return true;
      const transactionDate = moment(date);
      const start = moment(startMonth, "YYYY-MM").startOf("month");
      const end = moment(endMonth, "YYYY-MM").endOf("month");
      return transactionDate.isBetween(start, end, null, "[]");
    },
    [useMonthRange, startMonth, endMonth]
  );

  const formatCategoryLabel = useCallback(
    (category) => {
      switch (filter) {
        case "Daily":
          return moment(category, "YYYY-MM-DD").format("MMM DD, YYYY");
        case "Weekly":
          return `Week ${category.split("-W")[1]}, ${category.split("-W")[0]}`;
        case "Monthly":
          return moment(category, "YYYY-MM").format("MMM YYYY");
        case "Yearly":
          return category;
        default:
          return category;
      }
    },
    [filter]
  );

  const calculateAccountBalance = useCallback(
    (allTransactions) => {
      const sortedTransactions = allTransactions.sort((a, b) =>
        moment(a.date).valueOf() - moment(b.date).valueOf()
      );
      let accountBalances = {};
      let runningBalance = 0;

      sortedTransactions.forEach((transaction) => {
        let category;
        const date = moment(transaction.date);
        switch (filter) {
          case "Daily":
            category = date.format("YYYY-MM-DD");
            break;
          case "Weekly":
            category = `${date.year()}-W${date.week()}`;
            break;
          case "Monthly":
            category = date.format("YYYY-MM");
            break;
          case "Yearly":
            category = date.format("YYYY");
            break;
          default:
            category = date.format("YYYY-MM");
        }

        if (transaction.type === "income") {
          runningBalance += parseFloat(transaction.amount);
        } else {
          runningBalance -= parseFloat(transaction.amount);
        }
        accountBalances[category] = runningBalance;
      });

      return accountBalances;
    },
    [filter]
  );

  const categorizeTransactions = useCallback(
    (allTransactions) => {
      const filteredTransactions = allTransactions.filter((transaction) =>
        isWithinDateRange(transaction.date)
      );
      const accountBalanceMap = calculateAccountBalance(allTransactions);
      const groupedData = {};

      filteredTransactions
        .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf())
        .forEach((transaction) => {
          const date = moment(transaction.date);
          let category;
          switch (filter) {
            case "Daily":
              category = date.format("YYYY-MM-DD");
              break;
            case "Weekly":
              category = `${date.year()}-W${date.week()}`;
              break;
            case "Monthly":
              category = date.format("YYYY-MM");
              break;
            case "Yearly":
              category = date.format("YYYY");
              break;
            default:
              category = date.format("YYYY-MM");
          }

          if (!groupedData[category]) {
            groupedData[category] = {
              category,
              displayCategory: formatCategoryLabel(category),
              income: 0,
              expense: 0,
              periodBalance: 0,
              cumulativeIncome: 0,
              cumulativeExpense: 0,
              cumulativeBalance: 0,
              accountBalance: accountBalanceMap[category] || 0,
            };
          }

          if (transaction.type === "income") {
            groupedData[category].income += parseFloat(transaction.amount);
          } else {
            groupedData[category].expense += parseFloat(transaction.amount);
          }
        });

      let result = Object.values(groupedData).sort((a, b) => a.category.localeCompare(b.category));
      let runningIncome = 0;
      let runningExpense = 0;

      result.forEach((item) => {
        runningIncome += item.income;
        runningExpense += item.expense;
        item.periodBalance = item.income - item.expense;
        item.cumulativeIncome = runningIncome;
        item.cumulativeExpense = runningExpense;
        item.cumulativeBalance = runningIncome - runningExpense;
      });

      setNoData(result.length === 0);
      return result;
    },
    [filter, isWithinDateRange, calculateAccountBalance, formatCategoryLabel]
  );

  const chartData = useMemo(() => {
    const allTransactions = [
      ...incomes.map((inc) => ({ ...inc, type: "income" })),
      ...expenses.map((exp) => ({ ...exp, type: "expense" })),
    ];
    return categorizeTransactions(allTransactions);
  }, [incomes, expenses, filter, yearFilter, useMonthRange, startMonth, endMonth, categorizeTransactions]);

  const handleExportClick = () => {
    if (!chartData || chartData.length === 0) return;

    const exportData = chartData.map((item) => ({
      Category: item.displayCategory,
      Income: item.income || 0,
      Expense: item.expense || 0,
      PeriodBalance: item.periodBalance || 0,
      CumulativeIncome: item.cumulativeIncome || 0,
      CumulativeExpense: item.cumulativeExpense || 0,
      CumulativeBalance: item.cumulativeBalance || 0,
      AccountBalance: item.accountBalance || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Financial Overview");
    XLSX.writeFile(workbook, `Financial_Overview_${moment().format("YYYY-MM-DD")}.xlsx`);
  };

  const getDateRangeTitle = useCallback(() => {
    if (!useMonthRange) return filter;
    const start = moment(startMonth, "YYYY-MM").format("MMM YYYY");
    const end = moment(endMonth, "YYYY-MM").format("MMM YYYY");
    return `${start} - ${end}`;
  }, [filter, useMonthRange, startMonth, endMonth]);

  const toggleMetricVisibility = (metric) => {
    setVisibleMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };
  // Render method would be similar to the previous implementation
  return (
    <Container>
      {/* Filters and Export Button */}
      <HeaderContainer>
        <div>
          <h2 className="chart-title">Financial Overview</h2>
          <p className="chart-subtitle">
            {getDateRangeTitle()} • Track your spending trends
          </p>
        </div>
        <ExportButton onClick={handleExportClick}>
          <FileSpreadsheet size={20} />
          <span>Export to Excel</span>
        </ExportButton>
      </HeaderContainer>

      {/* Filters Container */}
      <FiltersContainer>
        {/* Existing filter dropdowns */}
        {/* ... (same as previous implementation) */}
      </FiltersContainer>

      {/* Legend with Interactive Toggles */}
      <LegendWrapper>
        {Object.entries(visibleMetrics).map(([metric, isVisible]) => (
          <LegendItem 
            key={metric}
            active={isVisible}
            onClick={() => toggleMetricVisibility(metric)}
          >
            <LegendColor color={getMetricColor(metric)} />
            <span>{formatMetricName(metric)}</span>
          </LegendItem>
        ))}
      </LegendWrapper>

      {/* Chart Rendering */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="chart-box"
      >
        {noData ? (
          <NoDataContainer>
            <p>No transactions found for the selected period.</p>
          </NoDataContainer>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart 
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              {/* Chart configuration similar to previous implementation */}
              {/* ... */}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Summary Section */}
      <SummaryContainer>
        {/* Similar to previous implementation */}
      </SummaryContainer>
    </Container>
  );
};

// Helper Functions
const getMetricColor = (metric) => {
  const colors = {
    income: "#3B82F6",
    expense: "#8b5cf6",
    balance: "#64748b",
    accountBalance: "#22c55e",
    cumulativeIncome: "#60a5fa",
    cumulativeExpense: "#a78bfa",
    crossovers: "#f59e0b"
  };
  return colors[metric] || "#000";
};

const formatMetricName = (metric) => {
  const names = {
    income: "Income",
    expense: "Expense",
    balance: "Cumulative Balance",
    accountBalance: "Account Balance",
    cumulativeIncome: "Cumulative Income",
    cumulativeExpense: "Cumulative Expense",
    crossovers: "Zero Crossovers"
  };
  return names[metric] || metric;
};

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

// Container Styles
 const Container = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.05), 
    0 5px 10px rgba(0, 0, 0, 0.03);
  padding: 2rem;
  margin-bottom: 2rem;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
`;

// Header Styles
 const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  .chart-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
    transition: color 0.3s ease;
    
    &:hover {
      color: #3b82f6;
    }
  }
  
  .chart-subtitle {
    font-size: 1rem;
    color: #64748b;
    opacity: 0.8;
  }
`;

// Filters Container
 const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background-color: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
`;

 const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #64748b;
    transition: color 0.3s ease;
  }
  
  select {
    padding: 0.625rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background-color: white;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }
  }
`;

// Legend Styles
 const LegendWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
`;

 const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${(props) => (props.active ? '#1e293b' : '#94a3b8')};
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background-color: ${(props) => (props.active ? 'rgba(59, 130, 246, 0.1)' : 'transparent')};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${(props) => (props.active ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0,0,0,0.05)')};
    transform: translateY(-2px);
  }
`;

 const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

// No Data Styles
 const NoDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background-color: #f8fafc;
  border-radius: 16px;
  text-align: center;
  
  p {
    font-size: 1.25rem;
    color: #64748b;
    margin-bottom: 1rem;
  }
  
  svg {
    width: 64px;
    height: 64px;
    color: #94a3b8;
    margin-bottom: 1rem;
    animation: ${pulse} 2s infinite;
  }
`;

// Export Button Styles
 const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1.25rem;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #e0f2fe;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  
  svg {
    stroke: #0284c7;
  }
  
  span {
    font-size: 0.9rem;
    font-weight: 500;
    color: #0369a1;
  }
`;

// Summary Container Styles
 const SummaryContainer = styled.div`
  margin-top: 2rem;
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1.5rem;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -0.5rem;
      left: 0;
      width: 50px;
      height: 4px;
      background-color: #3b82f6;
      border-radius: 2px;
    }
  }
`;

 const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

 const SummaryCard = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 1.25rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.1);
  }
  
  h4 {
    font-size: 0.9rem;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  p {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    svg {
      stroke: currentColor;
    }
  }
`;

// Loading Styles
 const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background-color: #f8fafc;
  border-radius: 16px;
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  p {
    margin-top: 1rem;
    font-size: 1rem;
    color: #64748b;
  }
`;

// Tooltip Styles
 const CustomTooltipContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  padding: 1rem;
  border: 1px solid #e2e8f0;
  
  .tooltip-label {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 0.5rem;
  }
  
  .tooltip-section {
    margin-bottom: 1rem;
    
    h4 {
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    p {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: #1e293b;
      margin-bottom: 0.25rem;
      
      span {
        font-weight: 600;
      }
    }
  }
`;

// Crossover Alert Styles
 const CrossoverAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1.5rem;
  
  svg {
    stroke: #f59e0b;
  }
  
  p {
    font-size: 0.9rem;
    margin: 0;
  }
`;

export default DetailedChartsContainer;

