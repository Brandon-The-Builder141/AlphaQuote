# Vendor Management System

## Overview
The Vendor Management system allows contractors to manage their local vendors and suppliers, track pricing data, and maintain vendor relationships.

## Features

### 🏪 Vendor Management
- **Create New Vendors**: Add vendors with name, contact info, and notes
- **View All Vendors**: See all vendors with pricing and receipt statistics
- **Edit Vendors**: Update vendor information
- **Delete Vendors**: Remove vendors (with confirmation)

### 📝 Form Validation
- **Required Fields**: Vendor name is required
- **Optional Fields**: Contact information and notes are optional
- **Real-time Validation**: Uses react-hook-form with Zod validation
- **Error Handling**: Clear error messages for validation failures

### 🔗 API Integration
- **RESTful API**: Full CRUD operations for vendor management
- **Database Integration**: Uses Prisma with SQLite database
- **Error Handling**: Comprehensive error handling and user feedback

## Technical Implementation

### Frontend Components
- **`src/pages/VendorNew.jsx`**: Vendor creation form with validation
- **`src/pages/Vendors.jsx`**: Vendor list and management interface
- **Form Validation**: react-hook-form + Zod schema validation
- **Routing**: React Router for navigation

### Backend API
- **`server/api.js`**: Express server with vendor endpoints
- **`src/actions/vendorActions.js`**: Server actions for vendor operations
- **Database**: Prisma ORM with SQLite

### API Endpoints
```
GET    /api/vendors     - List all vendors
POST   /api/vendors     - Create new vendor
PUT    /api/vendors/:id - Update vendor
DELETE /api/vendors/:id - Delete vendor
GET    /api/health      - Health check
```

## Usage

### Starting the System
```bash
# Start all services (React app, scraper, API server)
npm run dev

# Or start individual services
npm start          # React app (port 3000)
npm run scraper    # Price scraper (port 5050)
npm run api        # API server (port 3001)
```

### Creating a Vendor
1. Navigate to `/vendors` from the main menu
2. Click "Add New Vendor" button
3. Fill in the form:
   - **Name**: Required - Vendor name (e.g., "Home Depot")
   - **Contact**: Optional - Phone, email, or contact person
   - **Notes**: Optional - Additional information
4. Click "Create Vendor"
5. You'll be redirected to the vendors list

### Managing Vendors
- **View**: See all vendors with contact info and statistics
- **Edit**: Click the edit icon to modify vendor information
- **Delete**: Click the delete icon to remove a vendor (with confirmation)

## Database Schema

### LocalVendor Model
```prisma
model LocalVendor {
  id         String   @id @default(cuid())
  name       String
  contact    String?   // Phone number or email
  notes      String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  materials  Material[] // Optional future link
  
  // Relations
  prices        LocalVendorPrice[]
  tasks         Task[]
  receipts      Receipt[]
}
```

## Integration with Price System

The vendor management system integrates with the existing price lookup system:

1. **Manual Pricing**: Users can set custom material prices for specific vendors
2. **Receipt Data**: Uploaded receipts automatically create vendor entries
3. **Price Priority**: Manual vendor prices take priority over scraped data
4. **Analytics**: Track pricing trends by vendor

## Future Enhancements

- **Vendor Categories**: Organize vendors by type (lumber, electrical, etc.)
- **Contact Management**: Store multiple contacts per vendor
- **Performance Tracking**: Track vendor reliability and pricing accuracy
- **Integration**: Connect with accounting systems
- **Bulk Import**: Import vendor data from spreadsheets

## Troubleshooting

### API Server Not Running
- Check if port 3001 is available
- Ensure database is properly seeded: `npm run db:seed`
- Check console for error messages

### Database Issues
- Reset database: `npm run db:reset`
- Check Prisma schema: `npx prisma studio`
- Verify database connection

### Form Validation Errors
- Ensure all required fields are filled
- Check browser console for detailed error messages
- Verify network connection to API server


