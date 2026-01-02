# Admin Errors & Solutions Documentation
## Mombasa Shisha Bongs - Admin Dashboard

**Version:** 1.0  
**Last Updated:** 2024  
**Document Type:** Error Resolution Guide

---

## Table of Contents

1. [Product Management Errors](#1-product-management-errors)
2. [Category Management Errors](#2-category-management-errors)
3. [Order Management Errors](#3-order-management-errors)
4. [Product Specifications Errors](#4-product-specifications-errors)
5. [Product Colors Errors](#5-product-colors-errors)
6. [Bundle Management Errors](#6-bundle-management-errors)
7. [Flash Sale Errors](#7-flash-sale-errors)
8. [Image Upload Errors](#8-image-upload-errors)
9. [Settings Errors](#9-settings-errors)
10. [Authentication & Authorization Errors](#10-authentication--authorization-errors)
11. [Database & Schema Errors](#11-database--schema-errors)
12. [General System Errors](#12-general-system-errors)

---

## 1. Product Management Errors

### 1.1 Error: "Unique constraint failed on the fields: (slug)"

**When it occurs:**
- Creating a new product
- Updating a product slug

**Error Message:**
```
Unique constraint failed on the fields: (slug)
```

**Root Cause:**
- The product slug already exists in the database
- Slugs must be unique across all products

**Solution:**
1. The system automatically generates unique slugs by appending numbers (e.g., `product-name-1`, `product-name-2`)
2. If you see this error, try:
   - Changing the product name slightly
   - Manually editing the slug to be unique
   - The system will auto-generate a unique slug if you leave it blank

**Prevention:**
- Let the system auto-generate slugs from product names
- Avoid manually creating duplicate slugs

---

### 1.2 Error: "Cannot delete product: It has X order item(s) associated with it"

**When it occurs:**
- Attempting to delete a product that has been ordered

**Error Message:**
```
Cannot delete product: It has 2 order item(s) associated with it. 
Please delete the related orders first.
```

**Root Cause:**
- The product has been purchased and appears in order history
- Database foreign key constraints prevent deletion to maintain data integrity

**Solution:**
1. **Option 1: Delete related orders first**
   - Go to Admin → Orders
   - Find and delete orders containing this product
   - Then delete the product

2. **Option 2: Deactivate instead of delete**
   - Set the product status to "Inactive" instead of deleting
   - This preserves order history while hiding the product from customers

**Prevention:**
- Deactivate products instead of deleting them when they're no longer available
- Only delete products that have never been ordered

---

### 1.3 Error: "Name must be at least 3 characters"

**When it occurs:**
- Creating or updating a product with a name shorter than 3 characters

**Error Message:**
```
Name must be at least 3 characters
```

**Root Cause:**
- Product name validation requires minimum 3 characters

**Solution:**
- Enter a product name with at least 3 characters
- Example: "Hookah" instead of "HK"

---

### 1.4 Error: "Price must be positive"

**When it occurs:**
- Entering a negative price or zero price

**Error Message:**
```
Price must be positive
```

**Root Cause:**
- Price validation requires a positive number greater than 0.01

**Solution:**
- Enter a valid price (minimum 0.01)
- Ensure the price field contains only numbers and decimal point

---

### 1.5 Error: "Stock cannot be negative"

**When it occurs:**
- Entering a negative stock value

**Error Message:**
```
Stock cannot be negative
```

**Root Cause:**
- Stock must be a non-negative integer

**Solution:**
- Enter 0 or a positive number for stock
- Use 0 for out-of-stock items

---

### 1.6 Error: "Invalid category ID"

**When it occurs:**
- Selecting an invalid or non-existent category

**Error Message:**
```
Invalid category ID
```

**Root Cause:**
- Category ID format is invalid or category doesn't exist

**Solution:**
1. Refresh the page to reload categories
2. Select a valid category from the dropdown
3. If no categories exist, create one first in Admin → Categories

---

### 1.7 Error: "Please add at least one image"

**When it occurs:**
- Submitting product form without any images

**Error Message:**
```
Please add at least one image (upload a file or enter a URL)
```

**Root Cause:**
- Products require at least one image

**Solution:**
1. Upload an image file, OR
2. Enter a valid image URL (must start with `http://`, `https://`, or `/`)
3. Ensure at least one image is marked as primary

---

### 1.8 Error: "Invalid image URL"

**When it occurs:**
- Entering an invalid image URL format

**Error Message:**
```
Invalid image URL. Must be a full URL (https://...) or a relative path (/uploads/...)
```

**Root Cause:**
- Image URL must start with `http://`, `https://`, or `/`

**Solution:**
- Use full URLs: `https://example.com/image.jpg`
- Use relative paths: `/uploads/products/image.jpg`
- Do not use invalid formats like `image.jpg` without path

---

## 2. Category Management Errors

### 2.1 Error: "Name must be at least 2 characters"

**When it occurs:**
- Creating a category with a name shorter than 2 characters

**Error Message:**
```
Name must be at least 2 characters
```

**Solution:**
- Enter a category name with at least 2 characters

---

### 2.2 Error: "Slug must contain only lowercase letters, numbers, and hyphens"

**When it occurs:**
- Creating/updating a category with invalid slug characters

**Error Message:**
```
Slug must contain only lowercase letters, numbers, and hyphens
```

**Root Cause:**
- Slugs can only contain lowercase letters (a-z), numbers (0-9), and hyphens (-)
- No spaces, uppercase letters, or special characters allowed

**Solution:**
- Use only lowercase letters, numbers, and hyphens
- Example: `shisha-accessories` ✅
- Example: `Shisha Accessories` ❌ (has uppercase and space)

---

### 2.3 Error: "Cannot delete category. It has X product(s)"

**When it occurs:**
- Attempting to delete a category that contains products

**Error Message:**
```
Cannot delete category. It has 5 product(s). 
Please reassign or delete products first.
```

**Root Cause:**
- Category has associated products that must be handled first

**Solution:**
1. **Option 1: Reassign products**
   - Go to Admin → Products
   - Edit each product in this category
   - Assign them to a different category
   - Then delete the category

2. **Option 2: Delete products first**
   - Delete or deactivate all products in this category
   - Then delete the category

3. **Option 3: Deactivate instead**
   - Set category to "Inactive" instead of deleting
   - This hides it from customers while preserving data

---

### 2.4 Error: "Category not found"

**When it occurs:**
- Editing or deleting a category that no longer exists

**Error Message:**
```
Category not found
```

**Root Cause:**
- Category ID is invalid or category was already deleted

**Solution:**
- Refresh the categories page
- Verify the category still exists
- If it was deleted, you'll need to recreate it

---

## 3. Order Management Errors

### 3.1 Error: "Order not found"

**When it occurs:**
- Viewing, editing, or deleting an order that doesn't exist

**Error Message:**
```
Order not found
```

**Root Cause:**
- Order ID is invalid or order was already deleted

**Solution:**
- Refresh the orders page
- Verify the order still exists in the list
- Check if it was already deleted by another admin

---

### 3.2 Error: "orderIds array is required"

**When it occurs:**
- Attempting bulk delete without selecting orders

**Error Message:**
```
orderIds array is required
```

**Root Cause:**
- No orders were selected for bulk deletion

**Solution:**
- Select at least one order using the checkboxes
- Then click the "Bulk Delete" button

---

### 3.3 Error: "Failed to delete order"

**When it occurs:**
- General error during order deletion

**Error Message:**
```
Failed to delete order
```

**Root Cause:**
- Database error or system issue

**Solution:**
1. Refresh the page and try again
2. Check your internet connection
3. Try deleting one order at a time instead of bulk delete
4. If problem persists, contact technical support

**Note:** Deleting orders automatically restores product stock for non-cancelled orders.

---

## 4. Product Specifications Errors

### 4.1 Error: "Database schema error: The price field is not available"

**When it occurs:**
- Adding or updating a specification with a price for Size/Weight/Volume types

**Error Message:**
```
Database schema error: The price field is not available. 
Please run: npx prisma db push && npx prisma generate
```

**Root Cause:**
- Database migration hasn't been applied
- The `price` column doesn't exist in the `product_specifications` table

**Solution:**
1. Open terminal/command prompt in the project root directory
2. Run the following commands:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
3. Wait for both commands to complete successfully
4. Refresh the admin page and try again

**Prevention:**
- Always run migrations after pulling code updates
- Check with developers before adding price fields to specifications

---

### 4.2 Error: "Type and name are required"

**When it occurs:**
- Creating a specification without type or name

**Error Message:**
```
Type and name are required
```

**Root Cause:**
- Specification type and name fields are mandatory

**Solution:**
- Select a specification type (Size, Flavor, Weight, Volume, or Other)
- Enter a name for the specification
- Then save

---

### 4.3 Error: "Product not found"

**When it occurs:**
- Adding specifications to a product that doesn't exist

**Error Message:**
```
Product not found
```

**Root Cause:**
- Product ID is invalid or product was deleted

**Solution:**
- Refresh the product edit page
- Verify the product still exists
- If product was deleted, you'll need to recreate it

---

### 4.4 Error: "Unknown argument 'price'"

**When it occurs:**
- Adding price to a specification when database schema is outdated

**Error Message:**
```
Unknown argument 'price'. Available options are marked with ?
```

**Root Cause:**
- Database schema doesn't include the `price` field yet
- Prisma client needs to be regenerated

**Solution:**
1. Run database migration:
   ```bash
   npx prisma db push
   ```
2. Regenerate Prisma client:
   ```bash
   npx prisma generate
   ```
3. Restart the development server
4. Try again

---

### 4.5 Error: "Specification not found"

**When it occurs:**
- Updating or deleting a specification that doesn't exist

**Error Message:**
```
Specification not found
```

**Root Cause:**
- Specification ID is invalid or was already deleted

**Solution:**
- Refresh the product specifications list
- Verify the specification still exists
- If it was deleted, you'll need to recreate it

---

### 4.6 Error: "Please enter at least one specification name"

**When it occurs:**
- Creating specifications with empty names

**Error Message:**
```
Please enter at least one specification name
```

**Root Cause:**
- Specification name field is empty or contains only whitespace

**Solution:**
- Enter at least one specification name
- If entering multiple names, separate them with commas
- Example: "250g, 500g, 1kg"

---

## 5. Product Colors Errors

### 5.1 Error: "Name and value are required"

**When it occurs:**
- Creating a product color without name or hex value

**Error Message:**
```
Name and value are required
```

**Root Cause:**
- Both color name and hex value are mandatory

**Solution:**
- Enter a color name (e.g., "Red", "Blue")
- Enter or select a hex color value (e.g., "#FF0000")
- Click "Add" to save

---

### 5.2 Error: "Please enter a valid hex color code"

**When it occurs:**
- Entering an invalid hex color code

**Error Message:**
```
Please enter a valid hex color code (e.g., #FF0000)
```

**Root Cause:**
- Hex color must be in format `#RRGGBB` (6 hexadecimal digits)

**Solution:**
- Use format: `#` followed by 6 hexadecimal characters
- Examples: `#FF0000` (red), `#0000FF` (blue), `#00FF00` (green)
- You can use the color picker to select a color automatically

---

## 6. Bundle Management Errors

### 6.1 Error: "Name, price, and at least one item are required"

**When it occurs:**
- Creating a bundle without required fields

**Error Message:**
```
Name, price, and at least one item are required
```

**Root Cause:**
- Bundle name, price, and at least one product item are mandatory

**Solution:**
- Enter a bundle name
- Enter a bundle price
- Add at least one product to the bundle
- Then save

---

### 6.2 Error: "One or more products not found"

**When it occurs:**
- Creating a bundle with invalid product IDs

**Error Message:**
```
One or more products not found
```

**Root Cause:**
- One or more products in the bundle don't exist or were deleted

**Solution:**
- Remove the invalid products from the bundle
- Add only existing, active products
- Refresh the product list if needed

---

### 6.3 Error: "Bundle not found"

**When it occurs:**
- Viewing, editing, or deleting a bundle that doesn't exist

**Error Message:**
```
Bundle not found
```

**Root Cause:**
- Bundle ID is invalid or bundle was already deleted

**Solution:**
- Refresh the bundles page
- Verify the bundle still exists
- If it was deleted, you'll need to recreate it

---

## 7. Flash Sale Errors

### 7.1 Error: "End date must be after start date"

**When it occurs:**
- Creating/updating a flash sale with invalid date range

**Error Message:**
```
End date must be after start date
```

**Root Cause:**
- End date is before or equal to start date

**Solution:**
- Set start date to a date/time before the end date
- Ensure end date is in the future relative to start date
- Example: Start: Jan 1, 2024 10:00 AM | End: Jan 5, 2024 10:00 AM

---

### 7.2 Error: "At least one product is required"

**When it occurs:**
- Creating a flash sale without selecting products

**Error Message:**
```
At least one product is required
```

**Root Cause:**
- Flash sales must include at least one product

**Solution:**
- Select at least one product for the flash sale
- You can select multiple products

---

### 7.3 Error: "One or more products not found"

**When it occurs:**
- Creating a flash sale with invalid product IDs

**Error Message:**
```
One or more products not found
```

**Root Cause:**
- One or more selected products don't exist or were deleted

**Solution:**
- Remove invalid products from the selection
- Select only existing, active products
- Refresh the product list if needed

---

### 7.4 Error: "Validation error" (Flash Sale)

**When it occurs:**
- Creating/updating a flash sale with invalid data

**Error Message:**
```
Validation error
```

**Root Cause:**
- One or more fields don't meet validation requirements:
  - Title: Required, max 255 characters
  - Discount percent: 0-100
  - Dates: Valid date format

**Solution:**
- Check all fields meet requirements:
  - Title: 1-255 characters
  - Discount: 0-100 (percentage)
  - Start/End dates: Valid future dates
  - Products: At least one selected

---

## 8. Image Upload Errors

### 8.1 Error: "No file provided"

**When it occurs:**
- Attempting to upload without selecting a file

**Error Message:**
```
No file provided
```

**Root Cause:**
- No file was selected for upload

**Solution:**
- Click "Upload & Edit" or "Choose File"
- Select an image file from your computer
- Then upload

---

### 8.2 Error: "Invalid file type. Only images are allowed"

**When it occurs:**
- Uploading a non-image file

**Error Message:**
```
Invalid file type. Only images are allowed.
```

**Root Cause:**
- File is not an image format
- Allowed types: JPEG, JPG, PNG, WebP, GIF

**Solution:**
- Use only image files:
  - `.jpg` or `.jpeg`
  - `.png`
  - `.webp`
  - `.gif`
- Convert other file types to images first

---

### 8.3 Error: "File size exceeds 5MB limit"

**When it occurs:**
- Uploading an image larger than 5MB

**Error Message:**
```
File size exceeds 5MB limit
```

**Root Cause:**
- Image file is too large (maximum 5MB)

**Solution:**
1. **Compress the image:**
   - Use image compression tools (TinyPNG, Squoosh, etc.)
   - Reduce image dimensions if needed
   - Save in a more efficient format (WebP)

2. **Resize the image:**
   - Use image editing software
   - Reduce dimensions (e.g., 1200x1200px max)
   - Save with lower quality if needed

---

### 8.4 Error: "Failed to upload image to Cloudinary"

**When it occurs:**
- Cloudinary service is unavailable or misconfigured

**Error Message:**
```
Failed to upload image to Cloudinary
```

**Root Cause:**
- Cloudinary API credentials are missing or invalid
- Cloudinary service is down
- Network connectivity issues

**Solution:**
1. **Check Cloudinary configuration:**
   - Verify `CLOUDINARY_URL` or credentials in environment variables
   - Contact administrator to verify Cloudinary setup

2. **Try again:**
   - Wait a few minutes and retry
   - Check internet connection
   - System will fallback to alternative storage if available

---

### 8.5 Error: "Failed to upload file"

**When it occurs:**
- General upload failure

**Error Message:**
```
Failed to upload file
```

**Root Cause:**
- Server error, storage issue, or network problem

**Solution:**
1. Check internet connection
2. Verify file is not corrupted
3. Try uploading a different image
4. Refresh page and try again
5. If problem persists, contact technical support

---

## 9. Settings Errors

### 9.1 Error: "Key is required"

**When it occurs:**
- Creating/updating a setting without a key

**Error Message:**
```
Key is required
```

**Root Cause:**
- Setting key field is mandatory

**Solution:**
- Enter a unique key for the setting
- Use lowercase with underscores (e.g., `site_name`, `contact_email`)

---

### 9.2 Error: "Setting not found"

**When it occurs:**
- Updating or deleting a setting that doesn't exist

**Error Message:**
```
Setting not found
```

**Root Cause:**
- Setting key is invalid or setting was deleted

**Solution:**
- Verify the setting exists in the settings list
- Create a new setting if it doesn't exist

---

## 10. Authentication & Authorization Errors

### 10.1 Error: "Unauthorized"

**When it occurs:**
- Accessing admin pages without being logged in
- Session expired
- Insufficient permissions

**Error Message:**
```
Unauthorized
```

**Root Cause:**
- Not logged in
- Session expired
- User doesn't have admin role

**Solution:**
1. **Log in:**
   - Go to the sign-in page
   - Enter your admin credentials
   - Complete authentication

2. **Check admin role:**
   - Verify your account has admin permissions
   - Contact administrator to grant admin access

3. **Refresh session:**
   - Log out and log back in
   - Clear browser cache if needed

---

### 10.2 Error: "NEXT_REDIRECT" (Console)

**When it occurs:**
- Redirecting non-admin users from admin pages

**Error Message:**
```
NEXT_REDIRECT
```

**Root Cause:**
- This is **NOT an error** - it's expected Next.js behavior
- Next.js uses this to perform redirects

**Solution:**
- **No action needed** - this is normal
- The redirect is working correctly
- You may see this in browser console during development

---

## 11. Database & Schema Errors

### 11.1 Error: "Foreign key constraint failed"

**When it occurs:**
- Deleting records that are referenced by other records

**Error Message:**
```
Foreign key constraint failed
```

**Root Cause:**
- Record is referenced by other database records
- Database prevents deletion to maintain data integrity

**Solution:**
1. **Identify dependencies:**
   - Check which records reference this item
   - Example: Products reference categories, orders reference products

2. **Remove dependencies first:**
   - Delete or update dependent records
   - Then delete the original record

3. **Use deactivation:**
   - Set status to "Inactive" instead of deleting
   - This preserves data integrity

---

### 11.2 Error: "Prisma Client not generated"

**When it occurs:**
- After pulling code updates or schema changes

**Error Message:**
```
Module not found: Can't resolve '@/generated/prisma'
```

**Root Cause:**
- Prisma client hasn't been generated after schema changes

**Solution:**
1. Run Prisma generate:
   ```bash
   npx prisma generate
   ```
2. Restart the development server
3. Clear Next.js cache if needed:
   ```bash
   rm -rf .next
   ```

---

### 11.3 Error: "Database connection failed"

**When it occurs:**
- Database server is down or unreachable

**Error Message:**
```
Can't reach database server
```

**Root Cause:**
- Database connection string is invalid
- Database server is down
- Network connectivity issues

**Solution:**
1. **Check environment variables:**
   - Verify `DATABASE_URL` is set correctly
   - Check database credentials

2. **Check database status:**
   - Verify database server is running
   - Check network connectivity

3. **Contact administrator:**
   - If database is managed, contact hosting provider
   - Verify database access permissions

---

## 12. General System Errors

### 12.1 Error: "Failed to fetch"

**When it occurs:**
- Network request fails
- API endpoint is unavailable

**Error Message:**
```
Failed to fetch
```

**Root Cause:**
- Network connectivity issue
- Server is down
- API endpoint error

**Solution:**
1. **Check internet connection:**
   - Verify you're connected to the internet
   - Try refreshing the page

2. **Check server status:**
   - Verify the application server is running
   - Check if other admins are experiencing issues

3. **Try again:**
   - Wait a few seconds and retry
   - Refresh the page
   - Clear browser cache

---

### 12.2 Error: "An error occurred while processing your request"

**When it occurs:**
- General server error during request processing

**Error Message:**
```
An error occurred while processing your request
```

**Root Cause:**
- Server-side error
- Database error
- Validation error

**Solution:**
1. **Check the specific error:**
   - Look for more detailed error messages in the console
   - Check the error details in the response

2. **Verify input data:**
   - Ensure all required fields are filled
   - Check data format is correct

3. **Try again:**
   - Refresh and retry the operation
   - If problem persists, contact technical support

---

### 12.3 Error: "Validation error"

**When it occurs:**
- Form data doesn't meet validation requirements

**Error Message:**
```
Validation error
```

**Root Cause:**
- One or more fields don't meet requirements:
  - Required fields are empty
  - Data format is incorrect
  - Values are out of range

**Solution:**
1. **Check field requirements:**
   - Review error messages for specific fields
   - Ensure required fields are filled
   - Verify data formats (email, phone, etc.)

2. **Common validations:**
   - **Email:** Must be valid email format
   - **Phone:** Must match format (e.g., +254712345678)
   - **Numbers:** Must be positive, within range
   - **Text:** Must meet min/max length requirements

---

## Quick Reference: Common Solutions

### Database Migration Issues
```bash
# Run these commands when you see schema-related errors:
npx prisma db push
npx prisma generate
```

### Authentication Issues
1. Log out and log back in
2. Clear browser cache
3. Verify admin role is assigned

### File Upload Issues
1. Check file size (max 5MB)
2. Verify file type (images only)
3. Check internet connection

### Deletion Issues
1. Check for dependent records
2. Delete dependencies first
3. Or deactivate instead of deleting

---

## Prevention Tips

1. **Always run migrations** after pulling code updates
2. **Deactivate instead of delete** when possible to preserve data
3. **Validate data** before submitting forms
4. **Check file sizes** before uploading images
5. **Keep admin session active** to avoid authorization errors
6. **Verify product/category exists** before referencing in other records
7. **Use unique slugs** - let system auto-generate when possible
8. **Test in small batches** when bulk deleting orders

---

## Getting Help

If you encounter an error not listed here:

1. **Note the exact error message**
2. **Record when it occurs** (what action were you performing?)
3. **Check browser console** for additional error details
4. **Take a screenshot** of the error
5. **Contact technical support** with:
   - Error message
   - Steps to reproduce
   - Screenshot
   - Browser and OS information

---

## Appendix: Error Codes Reference

### Prisma Error Codes
- **P2002:** Unique constraint violation
- **P2003:** Foreign key constraint violation
- **P2009:** Invalid argument (schema mismatch)
- **P2025:** Record not found

### HTTP Status Codes
- **400:** Bad Request (validation error)
- **401:** Unauthorized (authentication required)
- **404:** Not Found (resource doesn't exist)
- **500:** Internal Server Error (server issue)

---

**End of Documentation**

