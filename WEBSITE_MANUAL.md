# 📘 Mombasa Shisha Bongs - Complete Website Manual

**Version:** 1.0  
**Last Updated:** January 2025

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Client Side Manual](#client-side-manual)
4. [Admin Side Manual](#admin-side-manual)
5. [Authentication & Access](#authentication--access)
6. [Common Tasks Step-by-Step](#common-tasks-step-by-step)
7. [Troubleshooting](#troubleshooting)

---

## Introduction

This manual provides comprehensive instructions for using the Mombasa Shisha Bongs e-commerce platform. The website is divided into two main sections:

- **Client Side**: Public-facing storefront for customers
- **Admin Side**: Management dashboard for administrators

---

## Getting Started

### Accessing the Website

- **Client/Storefront**: Navigate to `https://mombasashishabongs.com` (or your domain)
- **Admin Dashboard**: Navigate to `https://mombasashishabongs.com/admin` (requires admin login)

### Browser Requirements

- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Cookies enabled

---

## Client Side Manual

### 1. Homepage (`/`)

**What you'll see:**
- Featured products (top-selling items)
- Product categories grid
- New arrivals section
- Flash sales countdown (if active)
- Product bundles section
- Customer reviews
- Expert tips/articles
- FAQ section
- Recently viewed products (if logged in)

**How to use:**
- Click on any product card to view details
- Click on category tiles to browse by category
- Use the search bar at the top to find specific products
- Scroll down to see all sections

---

### 2. Products Page (`/products`)

**Access:** Click "Products" in navigation or visit `/products`

**Features:**
- **Search Bar**: Search by product name, description, SKU, brand, or tags
- **Sort Options**:
  - Newest First / Oldest First
  - Price: Low to High / High to Low
  - Name: A to Z / Z to A
  - Most Popular (by order count)
- **Filters**:
  - Category dropdown
  - Brand filter
  - Stock status (In Stock / Out of Stock)
  - Price range (min/max)
  - Minimum rating
- **Pagination**: Navigate through multiple pages of products

**How to use:**
1. Use search bar to find specific products
2. Select filters from the filter panel
3. Choose sort option from dropdown
4. Click on any product card to view details
5. Use pagination at bottom to see more products

---

### 3. Product Details Page (`/products/[id]`)

**Access:** Click on any product card

**What you'll see:**
- Product images (main image + gallery)
- Product name and description
- Price (with currency formatting)
- Stock availability
- Product specifications (if available)
- Color options (if available)
- Size/variant options (if available)
- Add to Cart button
- Add to Wishlist button (if logged in)
- Share product button
- Related products section
- Reviews and ratings (if available)

**How to use:**
1. **Select Options**: Choose color, size, or other variants if available
2. **Quantity**: Use +/- buttons or input field to set quantity
3. **Add to Cart**: Click "Add to Cart" button
4. **Add to Wishlist**: Click heart icon (requires login)
5. **Share**: Click share icon to copy product link
6. **View Reviews**: Scroll down to see customer reviews

---

### 4. Categories Page (`/categories`)

**Access:** Click "Categories" in navigation or visit `/categories`

**What you'll see:**
- Grid of all active product categories
- Category images and names
- Product count per category

**How to use:**
- Click on any category card to view products in that category

---

### 5. Category Products Page (`/categories/[slug]`)

**Access:** Click on a category card

**What you'll see:**
- All products in the selected category
- Same search, filter, and sort options as main products page
- Category name and description

---

### 6. Product Bundles Page (`/bundles`)

**Access:** Click "Bundles" in navigation or visit `/bundles`

**What you'll see:**
- List of available product bundles
- Bundle name, description, and image
- Bundle price (discounted from individual product prices)
- Savings amount and percentage
- Products included in bundle

**How to use:**
1. Browse available bundles
2. Click on a bundle to view details
3. Add bundle to cart (includes all products in bundle)

---

### 7. Bundle Details Page (`/bundles/[id]`)

**Access:** Click on a bundle card

**What you'll see:**
- Bundle name and description
- Bundle image
- List of products included with quantities
- Individual product prices vs bundle price
- Total savings amount and percentage
- Add to Cart button

**How to use:**
- Click "Add to Cart" to add the entire bundle

---

### 8. Shopping Cart (`/cart`)

**Access:** Click cart icon in navigation or visit `/cart`

**What you'll see:**
- List of items in cart
- Product images, names, and prices
- Quantity controls (+/- buttons)
- Item subtotals
- Total amount
- Remove item button
- Continue Shopping button
- Proceed to Checkout button

**How to use:**
1. **Update Quantity**: Use +/- buttons or input field
2. **Remove Item**: Click trash icon
3. **Continue Shopping**: Click to browse more products
4. **Checkout**: Click "Proceed to Checkout" button

**Note:** Cart persists across sessions (stored in browser)

---

### 9. Checkout Page (`/checkout`)

**Access:** Click "Proceed to Checkout" from cart

**What you'll see:**
- Customer information form (Name, Email, Phone)
- Saved addresses (if logged in)
- Delivery location picker (interactive map)
- Additional address details field
- Order notes field
- Scheduled delivery option (optional)
- Payment method selection:
  - **M-Pesa Payment**: Always available
  - **Pay on Delivery**: Only available for Mombasa locations
- Order summary sidebar

**How to use:**

1. **Fill Customer Information**:
   - Enter full name
   - Enter email address
   - Enter phone number (9 digits, e.g., 712345678)

2. **Select Delivery Location**:
   - **If logged in with saved addresses**: Select from saved addresses or use map
   - **If guest or new address**: Click on map to select location
   - Map will show if location is within Mombasa
   - Enter additional address details if needed (building, floor, apartment)

3. **Schedule Delivery** (Optional):
   - Select date and time from datetime picker
   - Can schedule up to 30 days in advance
   - Leave empty for immediate delivery

4. **Choose Payment Method**:
   - **M-Pesa**: Available for all locations
   - **Pay on Delivery**: Only available if location is within Mombasa (auto-selected)

5. **Add Order Notes** (Optional):
   - Enter special delivery instructions

6. **Review Order Summary**:
   - Check items, quantities, and total
   - For Pay on Delivery: Note that delivery fees are collected separately by delivery person

7. **Place Order**:
   - Click "Place Order" button
   - For M-Pesa: You'll be redirected to payment page
   - For Pay on Delivery: Order will be confirmed immediately

**Important Notes:**
- Creating an account is optional but recommended for order tracking
- Pay on Delivery is only available for Mombasa locations
- Delivery fees are not included in order total for Pay on Delivery (collected separately)

---

### 10. Order Details Page (`/orders/[id]`)

**Access:** After placing order or from "My Orders" page

**What you'll see:**
- Order number
- Order status (Pending, Processing, Shipped, Delivered, Cancelled)
- Order date and time
- Customer information
- Delivery address
- Order items with details
- Order summary (subtotal, delivery fee, tax, discount, total)
- Payment information
- Payment button (if M-Pesa payment pending)

**How to use:**

**For M-Pesa Payment:**
1. Click "Pay with M-Pesa" button
2. Enter M-Pesa phone number
3. Confirm payment
4. Enter M-Pesa reference number when prompted
5. Enter sender name
6. Payment will be verified

**For Pay on Delivery:**
- Order is already confirmed
- Payment will be collected on delivery

**Order Status Tracking:**
- Check order status badge at top of page
- Status updates automatically when admin updates order

---

### 11. My Orders Page (`/orders`)

**Access:** Click "My Orders" in navigation (requires login) or visit `/orders`

**What you'll see:**
- List of all your orders
- Order number, date, status, and total
- Quick view of order items

**How to use:**
- Click on any order to view full details
- Filter by status (if available)

---

### 12. Wishlist (`/wishlist`)

**Access:** Click "Wishlist" in navigation (requires login) or visit `/wishlist`

**What you'll see:**
- List of products you've added to wishlist
- Product images, names, and prices
- Remove from wishlist button
- Add to cart button

**How to use:**
1. Add products to wishlist from product detail pages (heart icon)
2. View wishlist items
3. Remove items by clicking trash icon
4. Add items to cart directly from wishlist

---

### 13. User Profile (`/profile`)

**Access:** Click your name/avatar in navigation (requires login) or visit `/profile`

**What you'll see:**
- Profile information (managed by Clerk authentication)
- Account settings
- Order history link
- Delivery addresses link

**How to use:**
- Update profile information through Clerk interface
- Manage account settings

---

### 14. Delivery Addresses (`/profile/addresses`)

**Access:** Click "Delivery Addresses" from profile or visit `/profile/addresses`

**What you'll see:**
- List of saved delivery addresses
- Address labels (Home, Work, Other)
- Full address details
- Default address indicator

**How to use:**

**Add New Address:**
1. Click "Add New Address" button
2. Fill in form:
   - Label (Home, Work, Other)
   - Full Name
   - Phone Number
   - Select location on map
   - Additional address details
   - City
   - Delivery notes (optional)
   - Set as default (optional)
3. Click "Save Address"

**Edit Address:**
1. Click "Edit" button on address card
2. Update information
3. Click "Save Changes"

**Delete Address:**
1. Click "Delete" button on address card
2. Confirm deletion

**Set Default Address:**
1. Click "Set as Default" button
2. Default address will be auto-selected at checkout

---

### 15. Search Functionality

**How to search:**
1. Use search bar in navigation (top of page)
2. Enter product name, brand, SKU, or keywords
3. Press Enter or click search icon
4. Results will show on products page with search term highlighted

**Search Tips:**
- Search is case-insensitive
- Searches product names, descriptions, SKUs, brands, and tags
- Use filters to narrow down results

---

### 16. Flash Sales

**What are Flash Sales:**
- Limited-time discounts on selected products
- Shown on homepage with countdown timer
- Discount percentage displayed

**How to use:**
1. View active flash sales on homepage
2. Click on flash sale banner to see discounted products
3. Add discounted products to cart
4. Discount is automatically applied

---

### 17. Product Reviews

**Viewing Reviews:**
- Reviews appear on product detail pages
- Shows rating (stars) and review text
- Shows reviewer name and date

**Leaving Reviews:**
- Reviews can be left after purchasing a product
- Rate from 1-5 stars
- Write review text
- Submit review

---

## Admin Side Manual

### Accessing Admin Dashboard

1. Navigate to `/admin`
2. Sign in with admin credentials (Clerk authentication)
3. Must have `role: "admin"` in Clerk public metadata

**Note:** If you don't have admin access, see [Authentication & Access](#authentication--access) section.

---

### Admin Dashboard Overview (`/admin`)

**What you'll see:**
- **Statistics Cards**:
  - Total Revenue (with month-over-month %)
  - Total Orders (with growth %)
  - Active Products count
  - Total Customers count
- **Recent Orders**: Last 5 orders with status
- **Top Products**: Best-selling products with sales count

**Navigation:**
- Sidebar menu with all admin sections
- Header with notifications and user menu
- "View Store" button to see public website

---

### 1. Products Management (`/admin/products`)

#### Viewing Products

**Access:** Click "Products" in sidebar or visit `/admin/products`

**What you'll see:**
- List of all products (up to 200 most recent)
- Product images, names, prices, stock
- Category, status (Active/Inactive)
- Sales count
- Edit and Delete buttons

**Mobile View:**
- Card-based layout for easy viewing
- All product information visible
- Action buttons clearly displayed

**Desktop View:**
- Table layout with sortable columns
- More compact view

#### Adding a New Product

1. Click "Add Product" button (top right)
2. Fill in product form:

   **Basic Information:**
   - Product Name* (required)
   - SKU (optional, auto-generated if empty)
   - Description (optional, supports markdown)
   - Brand (optional)
   - Tags (comma-separated, optional)

   **Pricing & Inventory:**
   - Price* (required, in KES)
   - Stock Quantity* (required)
   - Category* (select from dropdown)

   **Images:**
   - Featured Image (main product image)
   - Additional Images (can upload multiple)
   - Drag and drop or click to upload

   **Product Options:**
   - Colors (add color name and hex value)
   - Specifications (add spec type, name, value)
   - Variants (if applicable)

   **Status:**
   - Active/Inactive toggle

3. Click "Save Product" button
4. Product will be created and visible in products list

#### Editing a Product

1. Go to Products page (`/admin/products`)
2. Click "Edit" button (pencil icon) on product card/row
3. Product form will open with existing data
4. Update any fields
5. Click "Save Changes" button

#### Deleting a Product

1. Go to Products page (`/admin/products`)
2. Click "Delete" button (trash icon) on product card/row
3. Confirm deletion in popup
4. Product will be removed (orphaned images can be cleaned up)

#### Product Cleanup

**Access:** Click "Cleanup" button on Products page

**What it does:**
- Removes orphaned product images (images not linked to any product)
- Helps free up storage space

**How to use:**
1. Click "Cleanup" button
2. Confirm cleanup
3. Orphaned images will be deleted

---

### 2. Product Bundles Management (`/admin/bundles`)

#### Viewing Bundles

**Access:** Click "Bundles" in sidebar or visit `/admin/bundles`

**What you'll see:**
- List of all product bundles
- Bundle name, description, image
- Products included in bundle
- Bundle price and savings percentage
- Status (Active/Inactive)
- Edit and Delete buttons

**Mobile View:**
- Card layout showing all bundle details
- Product images visible

**Desktop View:**
- Modern card-based grid layout
- Product images and details clearly displayed

#### Creating a Bundle

1. Click "Create Bundle" button
2. Fill in bundle form:

   **Basic Information:**
   - Bundle Name* (required)
   - Description (optional)
   - Bundle Image (optional)

   **Products:**
   - Click "Add Product" to add products to bundle
   - Select product from dropdown
   - Set quantity for each product
   - Can add multiple products
   - Remove products with trash icon

   **Pricing:**
   - Bundle Price* (required, in KES)
   - Discount (optional, auto-calculated savings)

   **Status:**
   - Active/Inactive toggle

3. Click "Save Bundle" button
4. Bundle will be created and visible on storefront

#### Editing a Bundle

1. Go to Bundles page (`/admin/bundles`)
2. Click "Edit" button on bundle card
3. Update bundle information
4. Add or remove products
5. Update pricing
6. Click "Save Changes"

#### Deleting a Bundle

1. Go to Bundles page (`/admin/bundles`)
2. Click "Delete" button on bundle card
3. Confirm deletion
4. Bundle will be removed

---

### 3. Categories Management (`/admin/categories`)

#### Viewing Categories

**Access:** Click "Categories" in sidebar or visit `/admin/categories`

**What you'll see:**
- List of all categories
- Category name, description, image
- Product count per category
- Status (Active/Inactive)
- Edit and Delete buttons

**Mobile View:**
- Card layout for easy viewing

**Desktop View:**
- Table layout

#### Adding a Category

1. Click "Add Category" button
2. Fill in category form:
   - Category Name* (required)
   - Slug (auto-generated from name, can be edited)
   - Description (optional)
   - Category Image (optional)
   - Active/Inactive toggle
3. Click "Save Category" button

#### Editing a Category

1. Click "Edit" button on category card/row
2. Update category information
3. Click "Save Changes"

#### Deleting a Category

1. Click "Delete" button on category card/row
2. Confirm deletion
3. **Note:** Categories with products cannot be deleted (must reassign products first)

---

### 4. Orders Management (`/admin/orders`)

#### Viewing Orders

**Access:** Click "Orders" in sidebar or visit `/admin/orders`

**What you'll see:**
- List of all orders (up to 200 most recent)
- Order number, customer name, date
- Order status, total amount
- Payment status
- View Order button

**Mobile View:**
- Card layout with all order details visible

**Desktop View:**
- Table layout

**Filtering:**
- Can filter orders by customer (from Customers page)
- Filter by status (if implemented)

#### Viewing Order Details

1. Click "View Order" button or order number
2. Order details page shows:
   - Order information (number, date, status)
   - Customer information (name, email, phone)
   - Delivery address
   - Order items (products, quantities, prices)
   - Order summary (subtotal, delivery fee, tax, discount, total)
   - Payment information
   - Order timeline/history

#### Updating Order Status

1. Go to order details page
2. Find "Update Status" section
3. Select new status from dropdown:
   - **Pending**: Order just placed
   - **Processing**: Order being prepared
   - **Shipped**: Order shipped/delivery in progress
   - **Delivered**: Order delivered to customer
   - **Cancelled**: Order cancelled
4. Click "Update Status" button
5. Status will be updated and customer notified (if notifications enabled)

#### Scheduled Deliveries (`/admin/orders/scheduled`)

**Access:** Click "Scheduled Deliveries" in sidebar

**What you'll see:**
- List of orders with scheduled delivery dates
- Scheduled date and time
- Order details
- Customer information

**How to use:**
- View upcoming scheduled deliveries
- Plan delivery routes
- Contact customers if needed

---

### 5. Payments Management (`/admin/payments`)

#### Viewing Payments

**Access:** Click "Payments" in sidebar or visit `/admin/payments`

**What you'll see:**
- List of all payments
- Payment method (M-Pesa, Cash on Delivery)
- Payment status
- Amount and date
- Associated order

**How to use:**
- Track payment status
- Verify M-Pesa payments
- View payment history

---

### 6. Customers Management (`/admin/customers`)

#### Viewing Customers

**Access:** Click "Customers" in sidebar or visit `/admin/customers`

**What you'll see:**
- List of all customers (top 200 by total spent)
- Customer name, email, phone
- Order count
- Total spent
- First order date
- Last order date
- View Orders button

**Mobile View:**
- Card layout with customer stats

**Desktop View:**
- Table layout

#### Viewing Customer Orders

1. Click "View Orders" button on customer card/row
2. Orders page will filter to show only that customer's orders
3. Click "Clear Filter" to view all orders again

#### Bulk Email to Customers

1. Click "Send Bulk Email" button (top right)
2. Enter email subject and message
3. Select recipients (all customers or specific segment)
4. Click "Send Email"
5. Email will be sent to selected customers

---

### 7. Flash Sales Management (`/admin/flash-sales`)

#### Viewing Flash Sales

**Access:** Click "Flash Sales" in sidebar or visit `/admin/flash-sales`

**What you'll see:**
- List of all flash sales
- Sale title, description
- Discount percentage
- Products included
- Start and end dates
- Status (Active, Upcoming, Ended, Inactive)
- Edit and Delete buttons

**Mobile View:**
- Card layout

**Desktop View:**
- Table layout

#### Creating a Flash Sale

1. Click "Create Flash Sale" button
2. Fill in flash sale form:
   - Title* (required)
   - Description (optional)
   - Discount Percentage* (required, e.g., 20 for 20% off)
   - Select Products* (can select multiple)
   - Start Date* (required)
   - End Date* (required)
   - Active/Inactive toggle
3. Click "Save Flash Sale" button
4. Flash sale will appear on homepage when active

#### Editing a Flash Sale

1. Click "Edit" button on flash sale card/row
2. Update flash sale information
3. Add or remove products
4. Update dates or discount
5. Click "Save Changes"

#### Deleting a Flash Sale

1. Click "Delete" button on flash sale card/row
2. Confirm deletion
3. Flash sale will be removed

**Note:** Active flash sales will show countdown timer on homepage

---

### 8. Notifications Management (`/admin/notifications`)

#### Viewing Notifications

**Access:** Click "Notifications" in sidebar or visit `/admin/notifications`

**What you'll see:**
- List of all notifications (up to 100 most recent)
- Notification type (Order, Payment, System, etc.)
- Channel (Email, SMS, WhatsApp, Push)
- Recipient (email/phone)
- Status (Pending, Sent, Failed, Delivered)
- Associated order (if applicable)
- Error message (if failed)
- Timestamp
- View and Delete buttons

**Mobile View:**
- Card layout

**Desktop View:**
- Card grid layout (rectangular cards)

#### Viewing Notification Details

1. Click "View" button (eye icon) on notification card
2. Notification details page shows:
   - Full notification information
   - Delivery status
   - Error details (if failed)
   - Retry option (if applicable)

#### Deleting Notifications

**Delete Single Notification:**
1. Click "Delete" button (trash icon) on notification card
2. Confirm deletion
3. Notification will be removed

**Delete All Notifications:**
1. Click "Delete All Notifications" button (top right)
2. Confirm deletion
3. All notifications will be removed

#### Marking All as Read

1. Click "Mark All as Read" button (top right)
2. All notifications will be marked as read

#### Notification Dropdown (Top Bar)

**Access:** Click bell icon in admin header

**What you'll see:**
- Recent notifications (last 5-10)
- Unread count badge
- Quick view of notification details
- Link to full notifications page

**Mobile:**
- Dropdown appears below header
- Overlay background
- Scrollable list

---

### 9. Analytics (`/admin/analytics`)

#### Viewing Analytics

**Access:** Click "Analytics" in sidebar or visit `/admin/analytics`

**What you'll see:**
- Revenue overview (last 6 or 12 months)
- Top-selling products (with images)
- Product performance metrics
- Sales trends
- Customer analytics

**How to use:**
- Select time period (6 months or 12 months)
- View revenue breakdown by month
- See top products by sales
- Analyze product performance

---

### 10. Settings (`/admin/settings`)

#### Accessing Settings

**Access:** Click "Settings" in sidebar or visit `/admin/settings`

**What you'll see:**
- Site configuration options
- General settings
- Payment settings
- Notification settings
- Storage management

**How to use:**
- Update site-wide settings
- Configure payment methods
- Manage notification preferences
- Clean up storage

---

## Authentication & Access

### Client Side Authentication

**Signing Up:**
1. Click "Sign Up" in navigation
2. Enter email address
3. Create password
4. Verify email (if required)
5. Account created

**Signing In:**
1. Click "Sign In" in navigation
2. Enter email and password
3. Click "Sign In"
4. Redirected to previous page or homepage

**Signing Out:**
1. Click your name/avatar in navigation
2. Click "Sign Out"
3. Signed out and redirected to homepage

**Note:** Account creation is optional for checkout (guest checkout available)

---

### Admin Access

**Requirements:**
- Must have Clerk account
- Must have `role: "admin"` in Clerk public metadata

**Setting Up Admin Access:**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Users** → Find your user
3. Go to **Metadata** tab
4. In **Public metadata**, add:
   ```json
   {
     "role": "admin"
   }
   ```
5. Save changes
6. Refresh admin page (`/admin`)

**Signing In as Admin:**
1. Navigate to `/admin`
2. Sign in with Clerk credentials
3. If you have admin role, you'll be redirected to dashboard
4. If you don't have admin role, you'll see access denied message

**Note:** Admin access is required for all `/admin/*` routes

---

## Common Tasks Step-by-Step

### For Customers

#### How to Place an Order

1. **Browse Products**:
   - Go to homepage or products page
   - Use search or filters to find products
   - Click on product to view details

2. **Add to Cart**:
   - Select product options (color, size, etc.)
   - Set quantity
   - Click "Add to Cart"

3. **Review Cart**:
   - Click cart icon in navigation
   - Review items and quantities
   - Update if needed
   - Click "Proceed to Checkout"

4. **Checkout**:
   - Fill in customer information
   - Select delivery location on map
   - Choose payment method
   - Review order summary
   - Click "Place Order"

5. **Payment** (if M-Pesa):
   - Click "Pay with M-Pesa" on order page
   - Enter phone number
   - Confirm payment
   - Enter M-Pesa reference number
   - Payment verified

6. **Order Confirmation**:
   - Order number displayed
   - Email/SMS notification sent
   - Track order status

#### How to Track an Order

1. Sign in to your account
2. Click "My Orders" in navigation
3. Find your order in the list
4. Click on order to view details
5. Check order status badge

#### How to Add Products to Wishlist

1. Sign in to your account
2. Browse products
3. Click heart icon on product card or detail page
4. Product added to wishlist
5. View wishlist from navigation menu

#### How to Save Delivery Address

1. Sign in to your account
2. Go to Profile → Delivery Addresses
3. Click "Add New Address"
4. Fill in address form
5. Select location on map
6. Set as default (optional)
7. Click "Save Address"

---

### For Admins

#### How to Add a New Product

1. Go to `/admin/products`
2. Click "Add Product" button
3. Fill in product form:
   - Name, description, brand
   - Price, stock, category
   - Upload images
   - Add colors/specs if needed
4. Set status to Active
5. Click "Save Product"

#### How to Update Order Status

1. Go to `/admin/orders`
2. Click "View Order" on order
3. Find "Update Status" section
4. Select new status from dropdown
5. Click "Update Status"
6. Customer will be notified

#### How to Create a Product Bundle

1. Go to `/admin/bundles`
2. Click "Create Bundle"
3. Enter bundle name and description
4. Add products to bundle:
   - Click "Add Product"
   - Select product from dropdown
   - Set quantity
   - Repeat for each product
5. Set bundle price
6. Set status to Active
7. Click "Save Bundle"

#### How to Create a Flash Sale

1. Go to `/admin/flash-sales`
2. Click "Create Flash Sale"
3. Enter title and description
4. Set discount percentage
5. Select products to include
6. Set start and end dates
7. Set status to Active
8. Click "Save Flash Sale"

#### How to View Customer Orders

1. Go to `/admin/customers`
2. Find customer in list
3. Click "View Orders" button
4. Orders page filters to show customer's orders
5. Click "Clear Filter" to view all orders

#### How to Manage Categories

1. Go to `/admin/categories`
2. **Add**: Click "Add Category", fill form, save
3. **Edit**: Click "Edit" on category, update, save
4. **Delete**: Click "Delete", confirm (only if no products in category)

---

## Troubleshooting

### Common Issues

#### "Admin Access Required" Error

**Problem:** Cannot access admin dashboard

**Solution:**
1. Check Clerk dashboard for admin role
2. Ensure `role: "admin"` is in public metadata
3. Sign out and sign back in
4. Clear browser cache

#### Product Images Not Showing

**Problem:** Product images appear broken

**Solution:**
1. Check image upload was successful
2. Verify image URLs in database
3. Check storage service (Cloudinary/S3) connection
4. Run cleanup to remove orphaned images

#### Order Status Not Updating

**Problem:** Order status doesn't change

**Solution:**
1. Refresh page
2. Check if update was saved
3. Verify database connection
4. Check for error messages in browser console

#### Payment Not Processing

**Problem:** M-Pesa payment fails

**Solution:**
1. Check M-Pesa API credentials
2. Verify phone number format
3. Check payment logs in admin
4. Contact M-Pesa support if needed

#### Cart Items Disappearing

**Problem:** Cart empties unexpectedly

**Solution:**
1. Check browser cookies are enabled
2. Don't use incognito/private mode
3. Sign in to save cart across devices
4. Check browser storage limits

#### Notifications Not Sending

**Problem:** Email/SMS notifications not received

**Solution:**
1. Check notification settings in admin
2. Verify email/SMS service credentials
3. Check notification logs in admin
4. Verify customer email/phone is correct

---

## Additional Resources

### Support

- **Technical Issues**: Contact development team
- **Account Issues**: Use Clerk dashboard
- **Payment Issues**: Contact payment provider support

### Best Practices

**For Customers:**
- Create an account for order tracking
- Save delivery addresses for faster checkout
- Check order status regularly
- Keep order number for reference

**For Admins:**
- Update order status promptly
- Respond to customer inquiries quickly
- Keep product information up to date
- Monitor analytics regularly
- Clean up orphaned images periodically

---

## Version History

- **v1.0** (January 2025): Initial manual release

---

**End of Manual**
