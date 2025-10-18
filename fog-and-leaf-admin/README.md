# Fog & Leaf - Admin Panel

A modern, responsive admin dashboard for managing the Fog & Leaf e-commerce platform. Built with React, Vite, and Tailwind CSS.

## ✨ Key Features

- 📊 **Dashboard**: Revenue, orders, and inventory overview with real-time statistics
- 🛍️ **Order Management**: Complete order lifecycle management with status tracking
- 📦 **Product Management**: Full CRUD operations with image uploads and inventory tracking
- 📱 **Mobile Responsive**: Optimized for all devices with touch-friendly interfaces
- 📤 **Export Functionality**: CSV and Excel export for orders and products
- 🔍 **Advanced Filtering**: Search and filter across all data entities

## �️ Tech Stack

- **React 18** + **Vite** - Fast development and builds
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - API communication
- **Lucide React** - Modern icons
- **XLSX** - File export functionality

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Backend API running on port 5000

### Installation

```bash
# Clone and install
git clone <repository-url>
cd fog-and-leaf-admin
npm install

# Create environment file
echo "VITE_API_BASE_URL=http://localhost:5000" > .env

# Start development server
npm run dev
```

Navigate to `http://localhost:5173` and login with your admin credentials.

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/     # Dashboard widgets
│   ├── orders/        # Order management
│   ├── products/      # Product management
│   └── ui/           # Shared UI components
├── contexts/         # React contexts
├── pages/           # Main page components
├── utils/           # Helper functions
└── App.jsx         # Root component
```

## 🎨 Design System

**Color Coding:**

- 🔵 **Blue**: Primary actions (Edit, Refresh, Manage)
- 🟢 **Green**: Success actions (Export, Save, Create)
- 🔴 **Red**: Destructive actions (Delete, Remove)
- 🟠 **Orange**: Warning states (Low Stock, Pending)

**Responsive Breakpoints:**

- Mobile: `< 768px` - Card layouts
- Tablet: `768px - 1024px` - Adapted layouts
- Desktop: `> 1024px` - Full interface

## 📱 Mobile Experience

The admin panel is fully optimized for mobile devices:

- **Touch-friendly buttons** and interactions
- **Card-based layouts** for easy scrolling
- **Collapsible sidebar** with overlay
- **Simplified navigation** for small screens
- **Auto-close** sidebar on route changes

## 🔧 Main Components

**Dashboard:**

- `DashboardPage` - Overview with key metrics
- `RecentOrdersTable` - Latest order activity
- `AlertsSection` - System notifications

**Orders:**

- `OrdersPage` - Complete order management
- `OrdersTable` - Responsive order listing
- `OrderManagementModal` - Order details & updates

**Products:**

- `ProductsPage` - Product management interface
- `ProductTable` - Product listing with filters
- `ProductManagementModal` - Product CRUD operations

## 🚀 Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🐛 Common Issues

**Build Issues:**

```bash
rm -rf node_modules package-lock.json
npm install
```

**API Connection:**

- Verify backend server is running on port 5000
- Check CORS settings in backend
- Confirm network connectivity

**Image Uploads:**

- Backend handles all image processing
- Check backend configuration and file size limits

## � Development

**Component Guidelines:**

- Use functional components with hooks
- Follow React best practices
- Implement proper error boundaries
- Add proper prop validation

**File Naming:**

- Components: `PascalCase.jsx`
- Utilities: `camelCase.js`
- Constants: `UPPER_SNAKE_CASE.js`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ by the Fog & Leaf Team** • _Updated October 2025_
