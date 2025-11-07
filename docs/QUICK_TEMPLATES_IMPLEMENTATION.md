# Quick Templates / Favorite Tasks Module

## Overview

The Quick Templates module allows users to save frequently used tasks or groups of tasks and quickly insert them into new quotes. This feature provides a streamlined way to reuse common project templates without having to manually recreate tasks each time.

## Features

### ✅ **Core Functionality**
- **Save Templates**: Create and save task templates with multiple tasks
- **Quick Insertion**: Add entire templates to current quotes with one click
- **Drag & Drop**: Drag templates directly into the quote area
- **Template Management**: Edit, delete, and organize saved templates
- **Category Organization**: Organize templates by category (Kitchen, Bathroom, etc.)
- **Public/Private**: Mark templates as public (shared) or private

### ✅ **User Interface**
- **Consistent Styling**: Matches current quote page design system
- **Search & Filter**: Find templates by name, description, or category
- **Expandable Cards**: View template details and individual tasks
- **Form Builder**: Easy template creation with task management
- **Real-time Pricing**: See template costs and individual task pricing

## Database Schema

### TaskTemplate Model
```sql
model TaskTemplate {
  id          String   @id @default(cuid())
  name        String   // Template name
  description String?  // Template description
  category    String?  // Category (Kitchen, Bathroom, etc.)
  isPublic    Boolean  @default(false)
  userId      String?  // User identification
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  tasks       TaskTemplateItem[]
}
```

### TaskTemplateItem Model
```sql
model TaskTemplateItem {
  id           String       @id @default(cuid())
  template     TaskTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  templateId   String
  name         String       // Task name
  description  String?      // Task description
  category     String?      // Task category
  unit         String?      // Measurement unit
  quantity     Decimal?     @default(1)
  unitPrice    Decimal?     // Price per unit
  totalPrice   Decimal?     // Calculated total
  sortOrder    Int          @default(0)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}
```

## API Endpoints

### Task Templates API
- `GET /api/task-templates` - List all templates (public + user's private)
- `GET /api/task-templates/:id` - Get specific template with tasks
- `POST /api/task-templates` - Create new template
- `PUT /api/task-templates/:id` - Update existing template
- `DELETE /api/task-templates/:id` - Delete template

### Query Parameters
- `category` - Filter by template category
- `userId` - Filter by user (defaults to 'default')

## Frontend Components

### TaskTemplates Component
**Location**: `frontend/src/components/TaskTemplates.jsx`

**Features**:
- Modal overlay with backdrop blur
- Search and category filtering
- Template cards with expandable details
- Create/Edit form with task management
- Drag and drop functionality
- Real-time cost calculations

**Props**:
- `onAddTasks` - Callback when template tasks are added to quote
- `onClose` - Callback to close the modal

### Integration with EstimateForm
**Location**: `frontend/src/EstimateForm.js`

**Integration Points**:
- "Quick Templates" button in header
- `showTemplates` state management
- `handleAddTasksFromTemplate` function
- Template tasks converted to room format

## Demo Templates

The system comes pre-loaded with 6 professional templates:

### 1. Kitchen Remodel - Basic
- Remove Old Cabinets
- Install New Cabinets
- Countertop Installation
- Backsplash Tile
- Paint Kitchen Walls

### 2. Bathroom Renovation - Standard
- Bathroom Demo
- Plumbing Rough-in
- Tile Floor Installation
- Shower Tile
- Vanity Installation
- Toilet Installation

### 3. Flooring Installation - LVP
- Subfloor Preparation
- LVP Installation
- Baseboard Installation
- Transition Strips

### 4. Interior Paint - Full House
- Wall Preparation
- Wall Painting
- Ceiling Painting
- Trim Painting

### 5. Electrical Upgrade - Panel
- Panel Upgrade
- GFCI Outlets
- Additional Outlets
- Light Fixtures

### 6. Deck Construction - Composite
- Foundation Posts
- Deck Framing
- Composite Decking
- Deck Railings
- Stairs

## Usage Instructions

### Adding Templates to Quotes
1. **Click "Quick Templates"** button in Estimate Form header
2. **Browse Templates** by category or search
3. **Click "Add to Quote"** on desired template
4. **Tasks Automatically Added** as new rooms/tasks

### Creating New Templates
1. **Click "New Template"** button
2. **Fill Template Details** (name, description, category)
3. **Add Tasks** with quantities and pricing
4. **Save Template** for future use

### Managing Templates
1. **Edit Templates** by clicking edit icon
2. **Delete Templates** by clicking trash icon
3. **Mark as Public** to share with all users
4. **Organize by Category** for easy browsing

## Technical Implementation

### Data Flow
1. **Template Selection** → API fetch template with tasks
2. **Task Conversion** → Template tasks converted to room format
3. **Quote Integration** → Tasks added as new rooms in estimate
4. **Cost Calculation** → Automatic pricing and totals update

### State Management
- Templates loaded from API on component mount
- Search and filter state for UI responsiveness
- Form state for create/edit operations
- Drag and drop state for visual feedback

### Error Handling
- API error handling with user-friendly messages
- Form validation for required fields
- Confirmation dialogs for destructive actions
- Loading states for better UX

## Benefits

### For Users
- **Time Savings**: No need to recreate common tasks
- **Consistency**: Standardized task lists for similar projects
- **Organization**: Categorized templates for easy access
- **Flexibility**: Edit templates as needed for specific projects

### For Business
- **Standardization**: Consistent pricing across similar projects
- **Efficiency**: Faster quote generation
- **Scalability**: Easy to add new templates as business grows
- **Knowledge Sharing**: Public templates benefit entire team

## Future Enhancements

### Planned Features
- **Template Sharing**: Import/export templates between users
- **Template Analytics**: Track most-used templates
- **Smart Suggestions**: AI-powered template recommendations
- **Template Versioning**: Track template changes over time
- **Bulk Operations**: Select and manage multiple templates
- **Template Libraries**: Industry-specific template collections

### Integration Opportunities
- **Regional Pricing**: Integrate with regional price packs
- **Vendor Management**: Link templates to preferred vendors
- **Project History**: Suggest templates based on past projects
- **Mobile Support**: Touch-friendly drag and drop

## Conclusion

The Quick Templates module significantly enhances the AlphaQuote experience by providing a professional, efficient way to manage and reuse common project tasks. The modular design ensures it integrates seamlessly with existing functionality while providing room for future enhancements.

The feature is production-ready and provides immediate value to users by streamlining the quote creation process and ensuring consistency across similar projects.
