# 🗺️ Map Location Picker & Pay on Delivery Setup

## ✅ What's Been Implemented

### 1. **Location Picker Component**
- Interactive map for selecting delivery location
- Uses Google Maps (if API key available) or Leaflet (free fallback)
- "Use My Location" button to get current GPS coordinates
- Click or drag marker to select location
- Shows if location is within Mombasa boundaries

### 2. **Pay on Delivery Feature**
- Available only for locations within Mombasa
- Automatically enabled when location is within Mombasa
- Payment method selection (Mpesa or Pay on Delivery)
- Order status set to "CONFIRMED" for COD orders

### 3. **Location APIs**
- `/api/location/geocode` - Get address from coordinates
- `/api/location/check` - Check if location is within Mombasa

### 4. **Database Updates**
- Added `deliveryLatitude` and `deliveryLongitude` to Order model
- Updated PaymentMethod enum to include `CASH_ON_DELIVERY`

---

## 🔧 Setup Instructions

### Option 1: Google Maps (Recommended)

1. **Get Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "Maps JavaScript API"
   - Create API key
   - (Optional) Restrict key to your domain

2. **Add to `.env.local`:**
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

### Option 2: Leaflet (Free - No API Key Needed)

If you don't add a Google Maps API key, the system will automatically use Leaflet (OpenStreetMap) which is completely free and doesn't require an API key.

**No setup needed!** It works out of the box.

---

## 📍 Mombasa Boundaries

The system checks if a location is within these approximate boundaries:

```javascript
{
  north: -4.0,
  south: -4.1,
  east: 39.8,
  west: 39.6,
}
```

**You can adjust these in:**
- `src/components/checkout/LocationPicker.tsx` (line ~30)
- `src/app/api/location/geocode/route.ts` (line ~5)
- `src/app/api/location/check/route.ts` (line ~5)

---

## 🎯 How It Works

### For Customers:

1. **Select Location:**
   - Click "Use My Location" to get GPS coordinates
   - OR click/drag on the map to select location
   - Map shows if location is within Mombasa

2. **Payment Method:**
   - If within Mombasa: "Pay on Delivery" option appears
   - If outside Mombasa: Only Mpesa payment available
   - Customer can choose between Mpesa or COD (if available)

3. **Order Placement:**
   - For COD: Order is confirmed immediately, payment pending
   - For Mpesa: Order created, redirects to payment page

### For Admins:

- Orders with COD show payment status as "PENDING"
- Delivery coordinates stored in order record
- Can view location on map in admin panel (future feature)

---

## 🔍 Testing

### Test Location Picker:

1. Go to `/checkout`
2. Click "Use My Location" or select on map
3. Verify location is detected
4. Check if "Pay on Delivery" option appears (if within Mombasa)

### Test Pay on Delivery:

1. Select location within Mombasa
2. Choose "Pay on Delivery"
3. Place order
4. Verify order is created with COD payment method
5. Check order status is "CONFIRMED"

### Test Mombasa Boundary:

1. Select location outside Mombasa (e.g., Nairobi coordinates)
2. Verify "Pay on Delivery" is NOT available
3. Only Mpesa payment should be shown

---

## 📝 Environment Variables

Add to `.env.local`:

```env
# Google Maps API (Optional - Leaflet will be used if not provided)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
GOOGLE_MAPS_API_KEY=your_key_here
```

---

## 🎨 Features

✅ Interactive map with click/drag to select location  
✅ GPS location detection  
✅ Mombasa boundary checking  
✅ Automatic payment method selection  
✅ Address geocoding (if Google Maps API key provided)  
✅ Fallback to Leaflet if no API key  
✅ Visual indicators for location status  
✅ Nightlife aesthetic styling  

---

## 🚀 Next Steps (Optional Enhancements)

1. **Admin Map View:**
   - Show delivery locations on map in admin panel
   - Route optimization for deliveries

2. **Delivery Zones:**
   - Define specific delivery zones within Mombasa
   - Different delivery fees per zone

3. **Address Autocomplete:**
   - Google Places Autocomplete integration
   - Search for addresses

4. **Delivery Time Estimation:**
   - Calculate estimated delivery time based on location
   - Show to customer at checkout

---

## ✅ All Set!

The map location picker and Pay on Delivery feature is now fully implemented! 

**No API key needed** - it works with Leaflet (free) by default. Add Google Maps API key for better features (geocoding, autocomplete).

