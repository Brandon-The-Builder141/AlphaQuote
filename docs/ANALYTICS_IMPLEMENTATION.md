# Analytics & Insights Dashboard

## Overview

The Analytics & Insights dashboard provides comprehensive reporting and analytics for AlphaQuote, offering deep insights into project profitability, vendor performance, material usage trends, and business metrics. This read-only dashboard integrates seamlessly with existing data structures without modifying core quote logic.

## Features

### ✅ **Core Analytics**
- **Project Profitability**: Track estimated vs actual costs with profit margins
- **Vendor Performance**: Analyze which vendors provide best prices over time
- **Material Usage Trends**: Monitor material consumption and costs by category
- **Revenue Analytics**: Track revenue trends and growth patterns
- **Cost Breakdown**: Analyze spending by material categories
- **Summary Statistics**: Key performance indicators at a glance

### ✅ **Interactive Features**
- **Time Period Filtering**: 7 days, 30 days, 90 days, 1 year, or all time
- **Vendor Filtering**: Filter analytics by specific vendors
- **Category Filtering**: Focus on specific material categories
- **Real-time Updates**: Refresh data with current information
- **Export Functionality**: Export analytics data (placeholder)

### ✅ **Data Visualization**
- **Summary Cards**: Key metrics with trend indicators
- **Project Profitability Table**: Detailed project performance analysis
- **Vendor Performance Rankings**: Best performing vendors by spend
- **Material Usage Charts**: Top materials by cost and quantity
- **Revenue Trends**: Monthly revenue progression with growth rates
- **Cost Breakdown**: Spending distribution by category

## API Endpoints

### Analytics Data Endpoint
- `GET /api/analytics` - Get comprehensive analytics data

### Query Parameters
- `period` - Time period filter (7days, 30days, 90days, 1year, all)
- `vendor` - Vendor filter (all, Home Depot, Lowe's, Menards)
- `category` - Material category filter (all, Flooring, Paint, Electrical, etc.)

### Response Structure
```json
{
  "success": true,
  "analytics": {
    "summaryStats": {
      "totalRevenue": 493.4,
      "totalProjects": 3,
      "activeVendors": 3,
      "materialsUsed": 9,
      "revenueGrowth": "4.5",
      "projectGrowth": "-9.2",
      "topVendor": "Home Depot",
      "topMaterial": "Luxury Vinyl Plank Flooring"
    },
    "projectProfitability": [...],
    "vendorPerformance": [...],
    "materialTrends": [...],
    "revenueData": [...],
    "costBreakdown": [...]
  }
}
```

## Frontend Components

### Analytics Page
**Location**: `frontend/src/pages/Analytics.jsx`

**Features**:
- Modern dashboard with gradient background and animations
- Interactive filters for time period, vendor, and category
- Summary statistics cards with trend indicators
- Detailed analytics sections with charts and tables
- Responsive design with mobile-friendly layout
- Loading states and error handling

**Navigation Integration**:
- Added to main navigation in `StartEstimate.js`
- Accessible via "Analytics & Reports" button
- Route: `/analytics`

## Data Analysis Logic

### Project Profitability
- Compares estimated costs from quotes vs actual costs from receipts
- Calculates profit margins and revenue projections
- Assumes 30% markup for revenue calculations
- Filters out projects with no actual costs

### Vendor Performance
- Tracks total spending per vendor
- Calculates average price per item
- Orders vendors by total spend
- Shows order count and last order date

### Material Usage Trends
- Aggregates material usage by name and category
- Tracks quantities and total costs
- Sorts by total cost to show most expensive materials
- Supports category filtering

### Revenue Trends
- Groups receipts by month
- Calculates monthly revenue totals
- Computes period-over-period growth rates
- Shows project count per period

### Cost Breakdown
- Categorizes spending by material category
- Calculates percentage of total spending
- Provides spending distribution analysis
- Sorts by amount spent

## Database Integration

### Existing Data Sources
- **Receipts**: Primary data source for actual costs and material usage
- **Projects**: Links receipts to specific projects for profitability analysis
- **Vendors**: Vendor performance and spending analysis
- **Estimates**: Estimated costs for profitability comparison
- **Receipt Items**: Detailed material usage and pricing data

### Data Relationships
- Receipts → Vendors (vendor performance)
- Receipts → Projects (project profitability)
- Receipt Items → Categories (material trends)
- Estimates → Projects (profitability comparison)

## UI/UX Design

### Design System
- **Consistent Styling**: Matches existing AlphaQuote design language
- **Color Scheme**: Slate backgrounds with primary/accent accents
- **Typography**: Clear hierarchy with proper contrast
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Works on desktop, tablet, and mobile

### User Experience
- **Intuitive Navigation**: Clear filter controls and data organization
- **Visual Hierarchy**: Important metrics prominently displayed
- **Interactive Elements**: Hover states and click feedback
- **Loading States**: Smooth loading indicators
- **Error Handling**: Graceful error messages

## Performance Considerations

### Data Processing
- **Efficient Queries**: Optimized database queries with proper indexing
- **Data Aggregation**: Server-side calculations to reduce client processing
- **Caching**: Potential for implementing data caching in future
- **Pagination**: Large datasets handled efficiently

### Frontend Optimization
- **Lazy Loading**: Components load as needed
- **Memoization**: React.memo for expensive calculations
- **Debounced Filters**: Prevents excessive API calls
- **Responsive Images**: Optimized for different screen sizes

## Security & Privacy

### Data Access
- **Read-Only**: Dashboard only displays data, never modifies it
- **No Sensitive Data**: No personal information exposed
- **Aggregated Data**: Individual transaction details not shown
- **Secure API**: Same authentication as other endpoints

## Future Enhancements

### Planned Features
- **Export Functionality**: PDF and Excel export capabilities
- **Advanced Filtering**: Date range picker and custom filters
- **Real-time Updates**: WebSocket integration for live data
- **Custom Dashboards**: User-configurable dashboard layouts
- **Alert System**: Notifications for significant trends
- **Comparative Analysis**: Year-over-year and period comparisons

### Integration Opportunities
- **Regional Pricing**: Integrate with regional price pack data
- **Template Analytics**: Track usage of quick templates
- **Client Analytics**: Customer satisfaction and repeat business metrics
- **Seasonal Trends**: Identify seasonal patterns in business
- **Predictive Analytics**: AI-powered forecasting and recommendations

## Technical Implementation

### Backend Architecture
- **Express.js**: RESTful API endpoints
- **Prisma ORM**: Database queries and data modeling
- **SQLite**: Local database for development
- **Error Handling**: Comprehensive error management

### Frontend Architecture
- **React**: Component-based UI framework
- **Framer Motion**: Smooth animations and transitions
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing

### Data Flow
1. **User Interaction** → Filter selection or page load
2. **API Request** → Analytics endpoint with query parameters
3. **Data Processing** → Server aggregates and calculates metrics
4. **Response** → Structured analytics data returned
5. **UI Update** → Components re-render with new data

## Conclusion

The Analytics & Insights dashboard significantly enhances AlphaQuote by providing valuable business intelligence without compromising the core quote generation functionality. The modular design ensures easy maintenance and future enhancements while delivering immediate value to users through comprehensive reporting and trend analysis.

The feature is production-ready and provides contractors with the insights they need to make data-driven business decisions, optimize vendor relationships, and improve project profitability.
