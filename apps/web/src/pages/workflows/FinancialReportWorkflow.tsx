import React, { useState } from 'react';
import { FileText, Sparkles, TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import { callGeminiWithRetry } from '../../lib/gemini';

// Mock financial data for the last month
const mockFinancialData = null;

export default function FinancialReportWorkflow() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    if (!mockFinancialData) {
      setError("No financial data available to analyze.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const prompt = `
        You are an expert financial analyst AI agent. 
        Analyze the following financial data for ${mockFinancialData.month} and generate a monthly P&L (Profit and Loss) summary report.
        
        Financial Data:
        ${JSON.stringify(mockFinancialData, null, 2)}
        
        Your report MUST be in JSON format with the following structure:
        {
          "summary": {
            "totalRevenue": number,
            "grossProfit": number,
            "grossMarginPercentage": number,
            "operatingIncome": number,
            "netIncome": number,
            "netMarginPercentage": number
          },
          "keyInsights": [
            "insight 1",
            "insight 2",
            ...
          ],
          "recommendations": [
            "recommendation 1",
            "recommendation 2",
            ...
          ]
        }
      `;

      const response = await callGeminiWithRetry('gemini-3.1-pro-preview', {
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const result = JSON.parse(response.text);
      setReport(result);
    } catch (err: any) {
      console.error("Error generating report:", err);
      setError(err.message || "Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-600" />
          AI Financial P&L Report Agent
        </h3>
        <p className="text-text-secondary mt-2 text-base">
          This workflow uses the gemini-3.1-pro-preview model to analyze recent financial data and generate a comprehensive monthly P&L summary with actionable insights.
        </p>
      </div>

      {!report && !isGenerating && (
        <Card className="p-8 text-center border-dashed border-2 border-border-dark bg-surface-ground/50">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
          <h4 className="text-xl font-bold text-text-primary mb-2">Ready to Analyze Financial Data</h4>
          <p className="text-text-secondary mb-6 max-w-md mx-auto text-base">
            {mockFinancialData ? `The AI agent will process revenue, COGS, and operating expenses for ${mockFinancialData.month} to generate a detailed P&L report.` : "No financial data available to analyze."}
          </p>
          {mockFinancialData && (
            <button
              onClick={generateReport}
              className="px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors inline-flex items-center gap-2 font-medium shadow-lg shadow-brand-500/20 text-base"
            >
              <Sparkles className="w-5 h-5" />
              Generate P&L Report
            </button>
          )}
        </Card>
      )}

      {isGenerating && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <h4 className="text-lg font-bold text-text-primary">AI is analyzing financial data...</h4>
            <p className="text-text-muted text-base">Processing revenue streams, calculating margins, and extracting insights using gemini-3.1-pro-preview.</p>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-6 bg-red-500/5 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-900 dark:text-red-300">Analysis Failed</h4>
              <p className="text-base text-red-700 text-red-400 mt-1">{error}</p>
              <button 
                onClick={generateReport}
                className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-base font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </Card>
      )}

      {report && !isGenerating && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-bold text-text-primary">P&L Summary: {mockFinancialData.month}</h4>
            <button 
              onClick={generateReport}
              className="px-4 py-2 bg-surface-ground text-text-primary border border-border-dark rounded-lg hover:bg-surface-ground/80 transition-colors flex items-center gap-2 text-base font-medium"
            >
              <Sparkles className="w-5 h-5" /> Regenerate
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 border-l-4 border-l-blue-500">
              <p className="text-base font-medium text-text-muted mb-1">Total Revenue</p>
              <h5 className="text-2xl font-bold text-text-primary">${report.summary.totalRevenue?.toLocaleString()}</h5>
            </Card>
            <Card className="p-5 border-l-4 border-l-green-500">
              <p className="text-base font-medium text-text-muted mb-1">Gross Profit</p>
              <div className="flex items-end gap-2">
                <h5 className="text-2xl font-bold text-text-primary">${report.summary.grossProfit?.toLocaleString()}</h5>
                <span className="text-base font-medium text-green-500 text-green-400 mb-1">
                  {report.summary.grossMarginPercentage?.toFixed(1)}% Margin
                </span>
              </div>
            </Card>
            <Card className="p-5 border-l-4 border-l-purple-500">
              <p className="text-base font-medium text-text-muted mb-1">Net Income</p>
              <div className="flex items-end gap-2">
                <h5 className="text-2xl font-bold text-text-primary">${report.summary.netIncome?.toLocaleString()}</h5>
                <span className="text-base font-medium text-purple-600 dark:text-purple-400 mb-1">
                  {report.summary.netMarginPercentage?.toFixed(1)}% Margin
                </span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h5 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-500" />
                Key Insights
              </h5>
              <ul className="space-y-3">
                {report.keyInsights?.map((insight: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-base text-text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h5 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-amber-500" />
                Recommendations
              </h5>
              <ul className="space-y-3">
                {report.recommendations?.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-base text-text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
