import express from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { createObjectCsvStringifier } from 'csv-writer';

const router = express.Router();

// Drill-Down Endpoint
router.get('/:module/:metric/drilldown/:dimension', async (req, res) => {
  try {
    const { module, metric, dimension } = req.params;
    const { time_range, department, region, product, campaign } = req.query;

    console.log(`Drilldown request: ${module}/${metric}/${dimension}`);

    const result = await AnalyticsService.getDrillDown(module, metric, dimension, {
      time_range: time_range as string,
      department: department as string,
      region: region as string,
      product: product as string,
      campaign: campaign as string
    });

    res.json(result);
  } catch (error: any) {
    console.error('Drill-Down Error:', error);
    res.status(500).json({ error: 'Failed to fetch drill-down data', details: error.message });
  }
});

// Unified Analytics Endpoint
router.get('/:module/:metric', async (req, res) => {
  try {
    const { module, metric } = req.params;
    const { time_range, department, region, product, campaign } = req.query;

    const result = await AnalyticsService.getAnalytics(module, metric, {
      time_range: time_range as string,
      department: department as string,
      region: region as string,
      product: product as string,
      campaign: campaign as string
    });

    res.json(result);
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Export Endpoint
router.get('/export', async (req, res) => {
  try {
    const { module, metric, format } = req.query;
    
    // Fetch data (reuse getAnalytics logic or create specific export method)
    const result = await AnalyticsService.getAnalytics(module as string, metric as string, {
      time_range: 'all' // Export all data by default or use query params
    });

    if (format === 'csv') {
      const csvStringifier = createObjectCsvStringifier({
        header: [
          { id: 'date', title: 'Date' },
          { id: 'value', title: 'Value' }
        ]
      });
      
      const header = csvStringifier.getHeaderString();
      const records = csvStringifier.stringifyRecords(result.data);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${module}-${metric}.csv"`);
      res.send(header + records);
    } else {
      res.status(400).json({ error: 'Unsupported format' });
    }

  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

export default router;
