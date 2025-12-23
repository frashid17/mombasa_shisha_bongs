--
-- PostgreSQL database dump
--

\restrict 7iLohWa8tDg3XCgnBmHQPUKjnlihnhAdcBxgB9AykThoe884Wz0U6IdwNtnqbPj

-- Dumped from database version 17.7 (bdc8956)
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: NotificationChannel; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."NotificationChannel" AS ENUM (
    'EMAIL',
    'SMS',
    'WHATSAPP',
    'PUSH'
);


ALTER TYPE public."NotificationChannel" OWNER TO neondb_owner;

--
-- Name: NotificationStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."NotificationStatus" AS ENUM (
    'PENDING',
    'SENT',
    'FAILED',
    'DELIVERED'
);


ALTER TYPE public."NotificationStatus" OWNER TO neondb_owner;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."NotificationType" AS ENUM (
    'ORDER_CONFIRMATION',
    'ORDER_SHIPPED',
    'ORDER_DELIVERED',
    'ORDER_CANCELLED',
    'PAYMENT_RECEIVED',
    'PAYMENT_FAILED',
    'LOW_STOCK_ALERT',
    'ADMIN_ALERT'
);


ALTER TYPE public."NotificationType" OWNER TO neondb_owner;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."OrderStatus" OWNER TO neondb_owner;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'MPESA',
    'PAYSTACK',
    'CARD',
    'BANK_TRANSFER',
    'CASH_ON_DELIVERY'
);


ALTER TYPE public."PaymentMethod" OWNER TO neondb_owner;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'PAID',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_logs (
    id text NOT NULL,
    "adminId" text NOT NULL,
    "adminEmail" text NOT NULL,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    description text NOT NULL,
    metadata text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.admin_logs OWNER TO neondb_owner;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    image text,
    "parentId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- Name: delivery_addresses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.delivery_addresses (
    id text NOT NULL,
    "userId" text NOT NULL,
    label text NOT NULL,
    "fullName" text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    latitude double precision,
    longitude double precision,
    "isDefault" boolean DEFAULT false NOT NULL,
    "deliveryNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.delivery_addresses OWNER TO neondb_owner;

--
-- Name: flash_sales; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.flash_sales (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "productIds" text NOT NULL,
    "discountPercent" numeric(5,2) NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.flash_sales OWNER TO neondb_owner;

--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.newsletter_subscribers (
    id text NOT NULL,
    email text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.newsletter_subscribers OWNER TO neondb_owner;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "orderId" text,
    "recipientEmail" text NOT NULL,
    "recipientPhone" text,
    type public."NotificationType" NOT NULL,
    channel public."NotificationChannel" NOT NULL,
    subject text,
    message text NOT NULL,
    status public."NotificationStatus" DEFAULT 'PENDING'::public."NotificationStatus" NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "errorMessage" text,
    metadata text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    "productName" text NOT NULL,
    "productSku" text,
    "productImage" text,
    price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "colorId" text,
    "colorName" text,
    "colorValue" text,
    "specId" text,
    "specName" text,
    "specType" text,
    "specValue" text
);


ALTER TABLE public.order_items OWNER TO neondb_owner;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "userId" text NOT NULL,
    "userEmail" text NOT NULL,
    "userName" text NOT NULL,
    "userPhone" text NOT NULL,
    "deliveryAddress" text NOT NULL,
    "deliveryCity" text NOT NULL,
    "deliveryNotes" text,
    "deliveryLatitude" double precision,
    "deliveryLongitude" double precision,
    subtotal numeric(10,2) NOT NULL,
    "deliveryFee" numeric(10,2) DEFAULT 0.00 NOT NULL,
    tax numeric(10,2) DEFAULT 0.00 NOT NULL,
    discount numeric(10,2) DEFAULT 0.00 NOT NULL,
    total numeric(10,2) NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "trackingNumber" text,
    "estimatedDelivery" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "adminNotes" text,
    "cancellationReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "cancelledAt" timestamp(3) without time zone,
    "scheduledDelivery" timestamp(3) without time zone,
    "deliveryAddressId" text
);


ALTER TABLE public.orders OWNER TO neondb_owner;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "orderId" text NOT NULL,
    method public."PaymentMethod" NOT NULL,
    "mpesaPhone" text,
    "mpesaReceiptNumber" text,
    "mpesaTransactionId" text,
    "mpesaCheckoutRequestId" text,
    "paystackReference" text,
    "paystackAuthorizationCode" text,
    "paystackCustomerCode" text,
    "paystackChannel" text,
    "cardLast4" text,
    "cardBrand" text,
    "bankReference" text,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'KES'::text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "providerResponse" text,
    "errorMessage" text,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO neondb_owner;

--
-- Name: product_bundle_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_bundle_items (
    id text NOT NULL,
    "bundleId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.product_bundle_items OWNER TO neondb_owner;

--
-- Name: product_bundles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_bundles (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    discount numeric(10,2),
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_bundles OWNER TO neondb_owner;

--
-- Name: product_colors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_colors (
    id text NOT NULL,
    "productId" text NOT NULL,
    name text NOT NULL,
    value text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_colors OWNER TO neondb_owner;

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_images (
    id text NOT NULL,
    "productId" text NOT NULL,
    url text NOT NULL,
    "altText" text,
    "position" integer DEFAULT 0 NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_images OWNER TO neondb_owner;

--
-- Name: product_specifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_specifications (
    id text NOT NULL,
    "productId" text NOT NULL,
    type text NOT NULL,
    name text NOT NULL,
    value text,
    "isActive" boolean DEFAULT true NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_specifications OWNER TO neondb_owner;

--
-- Name: products; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "shortDescription" character varying(500),
    sku text,
    price numeric(10,2) NOT NULL,
    "compareAtPrice" numeric(10,2),
    "costPrice" numeric(10,2),
    stock integer DEFAULT 0 NOT NULL,
    "lowStockThreshold" integer DEFAULT 10 NOT NULL,
    "trackInventory" boolean DEFAULT true NOT NULL,
    "allowBackorder" boolean DEFAULT false NOT NULL,
    "categoryId" text,
    brand text,
    tags character varying(1000),
    "featuredImage" text,
    weight numeric(10,2),
    length numeric(10,2),
    width numeric(10,2),
    height numeric(10,2),
    "metaTitle" character varying(255),
    "metaDescription" character varying(500),
    "isActive" boolean DEFAULT true NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isNewArrival" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "publishedAt" timestamp(3) without time zone
);


ALTER TABLE public.products OWNER TO neondb_owner;

--
-- Name: recently_viewed; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.recently_viewed (
    id text NOT NULL,
    "userId" text,
    "sessionId" text,
    "productId" text NOT NULL,
    "viewedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.recently_viewed OWNER TO neondb_owner;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    "productId" text NOT NULL,
    "userId" text NOT NULL,
    "userName" text NOT NULL,
    "userEmail" text NOT NULL,
    rating integer NOT NULL,
    title text,
    comment text NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "isApproved" boolean DEFAULT false NOT NULL,
    "helpfulCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reviews OWNER TO neondb_owner;

--
-- Name: saved_cart_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.saved_cart_items (
    id text NOT NULL,
    "userId" text,
    "sessionId" text,
    "productId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.saved_cart_items OWNER TO neondb_owner;

--
-- Name: saved_searches; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.saved_searches (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text,
    "searchQuery" text NOT NULL,
    filters text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.saved_searches OWNER TO neondb_owner;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.settings (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    category text DEFAULT 'general'::text NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.settings OWNER TO neondb_owner;

--
-- Name: stock_notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stock_notifications (
    id text NOT NULL,
    "productId" text NOT NULL,
    "userId" text,
    email text NOT NULL,
    phone text,
    notified boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "notifiedAt" timestamp(3) without time zone
);


ALTER TABLE public.stock_notifications OWNER TO neondb_owner;

--
-- Name: wishlist_shares; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.wishlist_shares (
    id text NOT NULL,
    "wishlistId" text NOT NULL,
    "shareToken" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "wishlistData" text NOT NULL
);


ALTER TABLE public.wishlist_shares OWNER TO neondb_owner;

--
-- Data for Name: admin_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.categories (id, name, slug, description, image, "parentId", "isActive", "createdAt", "updatedAt") VALUES ('cmjeh3d6s0001jzjuhmp9tlsq', 'Disposable Vapes', 'disposable-vapes', 'Convenient disposable vape devices', '/uploads/categories/1766247141803-oby5mpu8ey.jpg', NULL, true, '2025-12-20 15:48:31.492', '2025-12-20 16:12:23.448');
INSERT INTO public.categories (id, name, slug, description, image, "parentId", "isActive", "createdAt", "updatedAt") VALUES ('cmjeh3ehn0006jzju6090swbf', 'E-Liquids', 'e-liquids', 'Premium e-liquids and vape juices', '/uploads/categories/1766247173186-4f9a8pngueb.jpg', NULL, true, '2025-12-20 15:48:33.18', '2025-12-20 16:12:54.869');
INSERT INTO public.categories (id, name, slug, description, image, "parentId", "isActive", "createdAt", "updatedAt") VALUES ('cmjeh3dz90004jzju4freregr', 'Coals', 'coals', 'Premium shisha coals and charcoal', '/uploads/categories/1766247603868-hmsmfj5m69l.jpg', NULL, true, '2025-12-20 15:48:32.517', '2025-12-20 16:20:05.707');
INSERT INTO public.categories (id, name, slug, description, image, "parentId", "isActive", "createdAt", "updatedAt") VALUES ('cmjeh3e8j0005jzjuoogt0a85', 'Refillable Vapes', 'refillable-vapes', 'Refillable vape kits and devices', '/uploads/categories/1766247735917-eqs17bl30zn.jpg', NULL, true, '2025-12-20 15:48:32.852', '2025-12-20 16:22:17.802');
INSERT INTO public.categories (id, name, slug, description, image, "parentId", "isActive", "createdAt", "updatedAt") VALUES ('cmjeh3dpc0003jzjumywah42d', 'Shisha Accessories', 'shisha-accessories', 'Essential shisha accessories and parts', '/uploads/categories/1766247919513-4nwj9qxbcwh.jpg', NULL, true, '2025-12-20 15:48:32.16', '2025-12-20 16:25:23.853');
INSERT INTO public.categories (id, name, slug, description, image, "parentId", "isActive", "createdAt", "updatedAt") VALUES ('cmjeh3dfs0002jzjume11dpfg', 'Shisha & Hookah', 'shisha-hookah', 'Premium shisha pipes and hookahs', '/uploads/categories/1766248002556-ymgm4yvlz5.jpg', NULL, true, '2025-12-20 15:48:31.816', '2025-12-20 16:26:43.93');
INSERT INTO public.categories (id, name, slug, description, image, "parentId", "isActive", "createdAt", "updatedAt") VALUES ('cmjeh3csa0000jzjupw7oeukl', 'Shisha Flavor', 'shisha-flavor', 'Premium shisha flavors and tobacco', '/uploads/categories/1766248067351-851u5bh1azb.jpg', NULL, true, '2025-12-20 15:48:30.97', '2025-12-20 16:27:49.628');


--
-- Data for Name: delivery_addresses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.delivery_addresses (id, "userId", label, "fullName", phone, address, city, latitude, longitude, "isDefault", "deliveryNotes", "createdAt", "updatedAt") VALUES ('cmjbsxba1000yjzivo1u7i8p2', 'user_36jy68pKDWUHjWGziUI4Hywiter', 'Home', 'Patrick Mwangi', '0708786000', 'Lat: -4.050848, Lng: 39.687353', 'Mombasa', -4.050847500144487, 39.68735258442381, true, '', '2025-12-18 18:56:25.945', '2025-12-18 18:56:25.945');
INSERT INTO public.delivery_addresses (id, "userId", label, "fullName", phone, address, city, latitude, longitude, "isDefault", "deliveryNotes", "createdAt", "updatedAt") VALUES ('cmjhhn32u0000jr04bw4tk7rb', 'user_374Ns8tWvlOnLVSjKeu5hzFt1Nm', 'Home', 'Patrick Mwangi', '708786000', 'Lat: -4.050799, Lng: 39.687267', 'Mombasa', -4.050799017475636, 39.6872673558377, true, '', '2025-12-22 18:27:10.039', '2025-12-22 18:27:10.039');
INSERT INTO public.delivery_addresses (id, "userId", label, "fullName", phone, address, city, latitude, longitude, "isDefault", "deliveryNotes", "createdAt", "updatedAt") VALUES ('cmjhho7t90001jr04bmhjnip1', 'user_374Ns8tWvlOnLVSjKeu5hzFt1Nm', 'Work', 'Patrick Mwangi', '708786001', 'Lat: -4.046727, Lng: 39.667822', 'Mombasa', -4.046727471892321, 39.66782212257386, false, '', '2025-12-22 18:28:02.735', '2025-12-22 18:28:02.735');


--
-- Data for Name: flash_sales; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjhfz55s000wjzipw0w6vdqh', 'cmjhfyguz000qjzip34l8pcrg', 'frashid274@gmail.com', NULL, 'PAYMENT_RECEIVED', 'EMAIL', 'Payment Received - Order #ORD-1766425201871-3', 'Payment Received - Order #ORD-1766425201871-3

Amount: KES 300
Mpesa Receipt: ORD-ORD-1766425201871-3-1766425213081
Transaction ID: 5662606122

Your payment has been successfully received. We''re now processing your order.

View order: http://localhost:3000/orders/ORD-1766425201871-3', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766425201871-3","receiptNumber":"ORD-ORD-1766425201871-3-1766425213081","transactionId":"5662606122","messageId":"<3a224374-79b2-9dd2-e411-7ce92f76bc0c@gmail.com>"}', '2025-12-22 17:40:33.374', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjhfz6jk000yjzip4x841jii', 'cmjhfyguz000qjzip34l8pcrg', 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766425201871-3', 'Order Confirmation - Order #ORD-1766425201871-3

Thank you for your purchase, Patrick Mwangi!

Order Items:
- Khaleej Shisha Flavor x1 - KES 300

Total: KES 300

Delivery Information:
Address: Lat: -4.050848, Lng: 39.687353
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: http://localhost:3000/orders/ORD-1766425201871-3', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766425201871-3","messageId":"<8c2a1e81-e472-0702-c086-cf778f6aa731@gmail.com>"}', '2025-12-22 17:40:35.168', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjhfz8f30010jzipg16of7dc', 'cmjhfyguz000qjzip34l8pcrg', 'mombasashishabongs@gmail.com', NULL, 'PAYMENT_RECEIVED', 'EMAIL', 'Payment Received - Order #ORD-1766425201871-3', 'Payment received for Order #ORD-1766425201871-3. Amount: KES 300. Receipt: ORD-ORD-1766425201871-3-1766425213081

Customer: Patrick Mwangi
Email: frashid274@gmail.com
Phone: +254708786000

Delivery Location:
Lat: -4.050848, Lng: 39.687353, Mombasa
Coordinates: -4.0508475, 39.6873526
View on Google Maps: https://www.google.com/maps?q=-4.0508475,39.6873526', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766425201871-3","receiptNumber":"ORD-ORD-1766425201871-3-1766425213081","recipient":"admin","messageId":"<f7548359-10ea-5b41-c6b3-c7cbd7e7b7cc@gmail.com>"}', '2025-12-22 17:40:37.599', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjhfz8t90012jzipu0puoyai', 'cmjhfyguz000qjzip34l8pcrg', 'mombasashishabongs@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', '🛒 New Order Received - #ORD-1766425201871-3', 'New Order Received

Order Number: #ORD-1766425201871-3

Customer Information:
- Name: Patrick Mwangi
- Email: frashid274@gmail.com
- Phone: +254708786000

Delivery Location:
- Address: Lat: -4.050848, Lng: 39.687353
- City: Mombasa

Payment Information:
- Payment Method: M-Pesa / Paystack
- Payment Status: Paid

Order Items:
- Khaleej Shisha Flavor x1 (Flavor: Love 66) - KES 300 each = KES 300

Total: KES 300

View order: http://localhost:3000/admin/orders/cmjhfyguz000qjzip34l8pcrg', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766425201871-3","recipient":"admin","messageId":"<510c87da-7d87-fcb9-eea7-87d84233a617@gmail.com>"}', '2025-12-22 17:40:38.11', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjhh4cxx001qjzipfstth9qz', 'cmjhh3n84001jjzipbvfkxma3', 'frashid274@gmail.com', NULL, 'PAYMENT_RECEIVED', 'EMAIL', 'Payment Received - Order #ORD-1766427123022-4', 'Payment Received - Order #ORD-1766427123022-4

Amount: KES 600
Mpesa Receipt: ORD-ORD-1766427123022-4-1766427133926
Transaction ID: 5662681517

Your payment has been successfully received. We''re now processing your order.

View order: http://localhost:3000/orders/ORD-1766427123022-4', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766427123022-4","receiptNumber":"ORD-ORD-1766427123022-4-1766427133926","transactionId":"5662681517","messageId":"<e10c14e3-0328-67cc-a6ec-4bbdf4033d33@gmail.com>"}', '2025-12-22 18:12:36.356', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd7h386001wjzsbh8n4b6my', NULL, 'frashid274@gmail.com', NULL, 'PAYMENT_RECEIVED', 'EMAIL', 'Payment Received - Order #ORD-1766169060190-2', 'Payment Received - Order #ORD-1766169060190-2

Amount: KES 1
Mpesa Receipt: ORD-ORD-1766169060190-2-1766169069997
Transaction ID: 5653212143

Your payment has been successfully received. We''re now processing your order.

View order: http://localhost:3000/orders/ORD-1766169060190-2', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766169060190-2","receiptNumber":"ORD-ORD-1766169060190-2-1766169069997","transactionId":"5653212143","messageId":"<f15c4b2b-7616-ed3e-1385-fd1effdd7107@gmail.com>"}', '2025-12-19 18:31:29.429', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjbow5bo000bjziv9vmhwo0y', NULL, 'ali@mail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766077410491-2', 'Order Confirmation - Order #ORD-1766077410491-2

Thank you for your purchase, ali!

Order Items:
- Charcoal Pack (50 pieces) x1 - KES 800

Total: KES 800

Delivery Information:
Address: Lat: -4.050766, Lng: 39.687275
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: https://ab2d648e112f.ngrok-free.app/orders/ORD-1766077410491-2', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766077410491-2"}', '2025-12-18 17:03:33.108', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjbp06mu0006la04egaoi5kf', NULL, 'mombasashishabongs@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'New Order Received - #ORD-1766077592290-3', 'New Order #ORD-1766077592290-3 from ali. Total: KES 800. View in admin panel.', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766077592290-3","recipient":"admin"}', '2025-12-18 17:06:41.43', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjhh4dd3001sjzip2mnb71jp', 'cmjhh3n84001jjzipbvfkxma3', 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766427123022-4', 'Order Confirmation - Order #ORD-1766427123022-4

Thank you for your purchase, Patrick Mwangi!

Order Items:
- Khaleej Shisha Flavor x1 - KES 300
- Khaleej Shisha Flavor x1 - KES 300

Total: KES 600

Delivery Information:
Address: Lat: -4.050848, Lng: 39.687353
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: http://localhost:3000/orders/ORD-1766427123022-4', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766427123022-4","messageId":"<7f89114e-7efe-a0ce-3ef1-4a544a7db23e@gmail.com>"}', '2025-12-22 18:12:36.903', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd75pt9000fi904tz3td46h', NULL, 'frashid274@gmail.com', NULL, 'PAYMENT_RECEIVED', 'EMAIL', 'Payment Received - Order #ORD-1766168483530-1', 'Payment Received - Order #ORD-1766168483530-1

Amount: KES 1
Mpesa Receipt: ORD-ORD-1766168483530-1-1766168495620
Transaction ID: 5653188561

Your payment has been successfully received. We''re now processing your order.

View order: https://mombasashishabongs.com/orders/ORD-1766168483530-1', 'SENT', '2025-12-22 18:31:31.654', 'Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.', '{"orderNumber":"ORD-1766168483530-1","receiptNumber":"ORD-ORD-1766168483530-1-1766168495620","transactionId":"5653188561"}', '2025-12-19 18:22:38.731', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd75q3n000hi9045otj7y1a', NULL, 'mombasashishabongs@gmail.com', NULL, 'PAYMENT_RECEIVED', 'EMAIL', 'Payment Received - Order #ORD-1766168483530-1', 'Payment received for Order #ORD-1766168483530-1. Amount: KES 1. Receipt: ORD-ORD-1766168483530-1-1766168495620', 'SENT', '2025-12-22 18:31:31.654', 'Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.', '{"orderNumber":"ORD-1766168483530-1","receiptNumber":"ORD-ORD-1766168483530-1-1766168495620","recipient":"admin"}', '2025-12-19 18:22:39.203', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd7453p0009i904a7ywixha', NULL, 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766168483530-1', 'Order Confirmation - Order #ORD-1766168483530-1

Thank you for your purchase, Patrick Mwangi!

Order Items:
- test001 x1 - KES 1

Total: KES 1

Delivery Information:
Address: Lat: -4.050769, Lng: 39.687179
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: https://mombasashishabongs.com/orders/ORD-1766168483530-1', 'SENT', '2025-12-22 18:31:31.654', 'Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.', '{"orderNumber":"ORD-1766168483530-1"}', '2025-12-19 18:21:25.333', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjhh4flo001ujzipmkjuzp52', 'cmjhh3n84001jjzipbvfkxma3', 'mombasashishabongs@gmail.com', NULL, 'PAYMENT_RECEIVED', 'EMAIL', 'Payment Received - Order #ORD-1766427123022-4', 'Payment received for Order #ORD-1766427123022-4. Amount: KES 600. Receipt: ORD-ORD-1766427123022-4-1766427133926

Customer: Patrick Mwangi
Email: frashid274@gmail.com
Phone: +254708786000

Delivery Location:
Lat: -4.050848, Lng: 39.687353, Mombasa
Coordinates: -4.0508475, 39.6873526
View on Google Maps: https://www.google.com/maps?q=-4.0508475,39.6873526', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766427123022-4","receiptNumber":"ORD-ORD-1766427123022-4-1766427133926","recipient":"admin","messageId":"<a5b834b1-f24c-2bf2-b49a-35523622124b@gmail.com>"}', '2025-12-22 18:12:39.804', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjhh4g3z001wjziplca7m128', 'cmjhh3n84001jjzipbvfkxma3', 'mombasashishabongs@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', '🛒 New Order Received - #ORD-1766427123022-4', 'New Order Received

Order Number: #ORD-1766427123022-4

Customer Information:
- Name: Patrick Mwangi
- Email: frashid274@gmail.com
- Phone: +254708786000

Delivery Location:
- Coordinates: -4.0508475, 39.6873526
- Google Maps: https://www.google.com/maps?q=-4.0508475,39.6873526
- Apple Maps: https://maps.apple.com/?q=-4.0508475,39.6873526
- City: Mombasa

Payment Information:
- Payment Method: M-Pesa / Paystack
- Payment Status: Paid

Order Items:
- Khaleej Shisha Flavor x1 (Flavor: Love 66) - KES 300 each = KES 300
- Khaleej Shisha Flavor x1 (Flavor: Blueberry) - KES 300 each = KES 300

Total: KES 600

View order: http://localhost:3000/admin/orders/cmjhh3n84001jjzipbvfkxma3', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766427123022-4","recipient":"admin","messageId":"<e67b42ce-8090-7d42-8d43-d61ccaea9f2a@gmail.com>"}', '2025-12-22 18:12:40.463', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjcknks9000ajz0vmtm7415b', NULL, 'admin@mombasashishabongs.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'New Order Received - #ORD-1766130756519-8', 'New Order #ORD-1766130756519-8 from Patrick Mwangi. Total: KES 183.6. View in admin panel.', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766130756519-8","recipient":"admin"}', '2025-12-19 07:52:40.953', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjbsyt7b0017jziv3nfympzt', NULL, 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766084251270-7', 'Order Confirmation - Order #ORD-1766084251270-7

Thank you for your purchase, Patrick Mwangi!

Order Items:
- test001 x2 - KES 102

Total: KES 204

Delivery Information:
Address: Lat: -4.050848, Lng: 39.687353
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: https://ab2d648e112f.ngrok-free.app/orders/ORD-1766084251270-7', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766084251270-7"}', '2025-12-18 18:57:35.831', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjbsytuo0019jziv381xsqra', NULL, 'admin@mombasashishabongs.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'New Order Received - #ORD-1766084251270-7', 'New Order #ORD-1766084251270-7 from Patrick Mwangi. Total: KES 204. View in admin panel.', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766084251270-7","recipient":"admin"}', '2025-12-18 18:57:36.673', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd1p9fq0003js0425zbfejl', NULL, '', '+254708786001', 'ORDER_DELIVERED', 'SMS', NULL, 'Order #ORD-1766141392894-10 delivered! Thank you for shopping with Mombasa Shisha Bongs.', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766141392894-10"}', '2025-12-19 15:49:53.031', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjcp2xve000mjz0vrs8eolnn', NULL, 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766138192727-9', 'Order Confirmation - Order #ORD-1766138192727-9

Thank you for your purchase, Patrick Mwangi!

Order Items:
- test001 x6 - KES 96.9
- Charcoal Pack (50 pieces) x1 - KES 800

Total: KES 1,350.8

Delivery Information:
Address: Lat: -4.050848, Lng: 39.687353
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: https://ab2d648e112f.ngrok-free.app/orders/ORD-1766138192727-9', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766138192727-9"}', '2025-12-19 09:56:36.049', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjcp2yf1000ojz0vyg7rwd49', NULL, 'admin@mombasashishabongs.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'New Order Received - #ORD-1766138192727-9', 'New Order #ORD-1766138192727-9 from Patrick Mwangi. Total: KES 1,350.8. View in admin panel.', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766138192727-9","recipient":"admin"}', '2025-12-19 09:56:36.926', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd1pdpq0005js0402x61nmm', NULL, 'frashid274@gmail.com', NULL, 'ORDER_DELIVERED', 'EMAIL', 'Order Delivered - #ORD-1766138192727-9', 'Order #ORD-1766138192727-9 has been delivered. Thank you for shopping with us!', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766138192727-9"}', '2025-12-19 15:49:58.574', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd1pxfw0007js04knpalm72', NULL, '', '+254708786000', 'ORDER_DELIVERED', 'SMS', NULL, 'Order #ORD-1766138192727-9 delivered! Thank you for shopping with Mombasa Shisha Bongs.', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766138192727-9"}', '2025-12-19 15:50:24.14', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd74c68000bi904kg6070dl', NULL, 'mombasashishabongs@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', '🛒 New Order Received - #ORD-1766168483530-1', 'New Order Received

Order Number: #ORD-1766168483530-1

Customer Information:
- Name: Patrick Mwangi
- Email: frashid274@gmail.com
- Phone: +254708786000

Delivery Location:
- Address: Lat: -4.050769, Lng: 39.687179
- City: Mombasa

Payment Information:
- Payment Method: M-Pesa / Paystack
- Payment Status: Pending

Order Items:
- test001 x1 - KES 1 each = KES 1

Total: KES 1

View order: https://mombasashishabongs.com/admin/orders/cmjd743pq0005i904521qh5q6', 'SENT', '2025-12-22 18:31:31.654', 'Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.', '{"orderNumber":"ORD-1766168483530-1","recipient":"admin"}', '2025-12-19 18:21:34.497', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd7gjpe001qjzsbmsscxemb', NULL, 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766169060190-2', 'Order Confirmation - Order #ORD-1766169060190-2

Thank you for your purchase, Patrick Mwangi!

Order Items:
- test001 x1 - KES 1

Total: KES 1

Delivery Information:
Address: Lat: -4.050848, Lng: 39.687353
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: http://localhost:3000/orders/ORD-1766169060190-2', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766169060190-2","messageId":"<f994ec9d-9d80-179e-6f62-cfd9a22d0b2a@gmail.com>"}', '2025-12-19 18:31:04.131', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd7gmju001sjzsblpzbn5ei', NULL, 'mombasashishabongs@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', '🛒 New Order Received - #ORD-1766169060190-2', 'New Order Received

Order Number: #ORD-1766169060190-2

Customer Information:
- Name: Patrick Mwangi
- Email: frashid274@gmail.com
- Phone: +254708786000

Delivery Location:
- Address: Lat: -4.050848, Lng: 39.687353
- City: Mombasa

Payment Information:
- Payment Method: M-Pesa / Paystack
- Payment Status: Pending

Order Items:
- test001 x1 - KES 1 each = KES 1

Total: KES 1

View order: http://localhost:3000/admin/orders/cmjd7ggom001mjzsbkn5s0p50', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766169060190-2","recipient":"admin","messageId":"<8c085f66-f427-b219-9869-532cc0ec6c72@gmail.com>"}', '2025-12-19 18:31:07.818', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjbp00r40004la04hqgliwxb', NULL, 'ali@mail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766077592290-3', 'Order Confirmation - Order #ORD-1766077592290-3

Thank you for your purchase, ali!

Order Items:
- Charcoal Pack (50 pieces) x1 - KES 800

Total: KES 800

Delivery Information:
Address: Lat: -4.050851, Lng: 39.687207
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: undefined/orders/ORD-1766077592290-3', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766077592290-3"}', '2025-12-18 17:06:33.808', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjbrite90009jm0414p5v898', NULL, 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766081828148-4', 'Order Confirmation - Order #ORD-1766081828148-4

Thank you for your purchase, tttt!

Order Items:
- test001 x1 - KES 1

Total: KES 1

Delivery Information:
Address: Lat: -1.292066, Lng: 36.821946
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: undefined/orders/ORD-1766081828148-4', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766081828148-4"}', '2025-12-18 18:17:09.97', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjbrzal1000tjzivbi7sco5d', NULL, 'test@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766082595212-5', 'Order Confirmation - Order #ORD-1766082595212-5

Thank you for your purchase, test!

Order Items:
- Charcoal Pack (50 pieces) x1 - KES 800
- test001 x1 - KES 102

Total: KES 902

Delivery Information:
Address: Lat: -4.050825, Lng: 39.687231
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: https://ab2d648e112f.ngrok-free.app/orders/ORD-1766082595212-5', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766082595212-5"}', '2025-12-18 18:29:58.741', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjbrzb4j000vjziv1g3xsg3s', NULL, 'admin@mombasashishabongs.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'New Order Received - #ORD-1766082595212-5', 'New Order #ORD-1766082595212-5 from test. Total: KES 902. View in admin panel.', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766082595212-5","recipient":"admin"}', '2025-12-18 18:29:59.444', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd7h6p0001yjzsbhiqxpbf4', NULL, 'mombasashishabongs@gmail.com', NULL, 'PAYMENT_RECEIVED', 'EMAIL', 'Payment Received - Order #ORD-1766169060190-2', 'Payment received for Order #ORD-1766169060190-2. Amount: KES 1. Receipt: ORD-ORD-1766169060190-2-1766169069997', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766169060190-2","receiptNumber":"ORD-ORD-1766169060190-2-1766169069997","recipient":"admin","messageId":"<eac51bfa-574c-bce8-2496-dfabb56ac47c@gmail.com>"}', '2025-12-19 18:31:33.924', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjewn2vk0004ju048zsxbpha', 'cmjewn1qf0000ju04w7m6ujsr', 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766271824005-1', 'Order Confirmation - Order #ORD-1766271824005-1

Thank you for your purchase, guy!

Order Items:
- SMOK RPM5 x1 - KES 8,000

Total: KES 8,000

Delivery Information:
Address: Lat: -4.036707, Lng: 39.682102
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: https://mombasashishabongs.com/orders/ORD-1766271824005-1', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766271824005-1"}', '2025-12-20 23:03:45.488', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjbow5uw000djzivydkrbjrw', NULL, 'admin@mombasashishabongs.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'New Order Received - #ORD-1766077410491-2', 'New Order #ORD-1766077410491-2 from ali. Total: KES 800. View in admin panel.', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766077410491-2","recipient":"admin"}', '2025-12-18 17:03:33.801', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjfrm3440004jo04wgjw5d6q', 'cmjfrm1yt0000jo04cjh1ecfn', 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766323845747-2', 'Order Confirmation - Order #ORD-1766323845747-2

Thank you for your purchase, Patrick Mwangi!

Order Items:
- ELFBAR BC10000 x1 - KES 2,000

Total: KES 2,000

Delivery Information:
Address: Lat: -4.050916, Lng: 39.687120
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: https://mombasashishabongs.com/orders/ORD-1766323845747-2', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766323845747-2"}', '2025-12-21 13:30:47.236', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjbs133t0006l7045ii8ulkg', NULL, 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766082680558-6', 'Order Confirmation - Order #ORD-1766082680558-6

Thank you for your purchase, Patrick Mwangi!

Order Items:
- test001 x1 - KES 102

Total: KES 102

Delivery Information:
Address: Lat: -4.050834, Lng: 39.687245
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: undefined/orders/ORD-1766082680558-6', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766082680558-6"}', '2025-12-18 18:31:22.362', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjbs18gp0008l704k8dvg79a', NULL, 'mombasashishabongs@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'New Order Received - #ORD-1766082680558-6', 'New Order #ORD-1766082680558-6 from Patrick Mwangi. Total: KES 102. View in admin panel.', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766082680558-6","recipient":"admin"}', '2025-12-18 18:31:29.306', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjcknk7g0008jz0vl17mnuof', NULL, 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766130756519-8', 'Order Confirmation - Order #ORD-1766130756519-8

Thank you for your purchase, Patrick Mwangi!

Order Items:
- test001 x2 - KES 96.9

Total: KES 183.6

Delivery Information:
Address: Lat: -4.050848, Lng: 39.687353
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: https://ab2d648e112f.ngrok-free.app/orders/ORD-1766130756519-8', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766130756519-8"}', '2025-12-19 07:52:40.022', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjcqzhug0004jt046unzh692', NULL, 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766141392894-10', 'Order Confirmation - Order #ORD-1766141392894-10

Thank you for your purchase, Patrick Mwangi!

Order Items:
- test001 x1 - KES 1

Total: KES 1

Delivery Information:
Address: Lat: -4.050860, Lng: 39.687355
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: undefined/orders/ORD-1766141392894-10', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766141392894-10"}', '2025-12-19 10:49:54.712', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjcqzk3e0006jt04zfj448yz', NULL, 'mombasashishabongs@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'New Order Received - #ORD-1766141392894-10', 'New Order #ORD-1766141392894-10 from Patrick Mwangi. Total: KES 1. View in admin panel.', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766141392894-10","recipient":"admin"}', '2025-12-19 10:49:57.626', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd1otkj0001js042funpmgk', NULL, 'frashid274@gmail.com', NULL, 'ORDER_DELIVERED', 'EMAIL', 'Order Delivered - #ORD-1766141392894-10', 'Order #ORD-1766141392894-10 has been delivered. Thank you for shopping with us!', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766141392894-10"}', '2025-12-19 15:49:32.467', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd7rhvz0004ie04uohchijp', NULL, 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766169573176-3', 'Order Confirmation - Order #ORD-1766169573176-3

Thank you for your purchase, Patrick Mwangi!

Order Items:
- test001 x1 - KES 1

Total: KES 1

Delivery Information:
Address: Lat: -4.050638, Lng: 39.687174
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: https://mombasashishabongs.com/orders/ORD-1766169573176-3', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766169573176-3","messageId":"<f1f62963-c58d-34c3-8cde-4e4b5d523350@gmail.com>"}', '2025-12-19 18:39:34.992', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd4veqi0004jzsbbvm4k4k3', NULL, 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766164715133-1', 'Order Confirmation - Order #ORD-1766164715133-1

Thank you for your purchase, Patrick Mwangi!

Order Items:
- ELFBAR BC10000 x1 - KES 2,000

Total: KES 2,000

Delivery Information:
Address: Lat: -4.050848, Lng: 39.687353
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: https://ab2d648e112f.ngrok-free.app/orders/ORD-1766164715133-1', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766164715133-1"}', '2025-12-19 17:18:38.682', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjbriywf000bjm04bzjeklc3', NULL, 'mombasashishabongs@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'New Order Received - #ORD-1766081828148-4', 'New Order #ORD-1766081828148-4 from tttt. Total: KES 1. View in admin panel.', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766081828148-4","recipient":"admin"}', '2025-12-18 18:17:17.103', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd4vfap0006jzsbcj4c0szu', NULL, 'admin@mombasashishabongs.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', '🛒 New Order Received - #ORD-1766164715133-1', 'New Order Received

Order Number: #ORD-1766164715133-1

Customer Information:
- Name: Patrick Mwangi
- Email: frashid274@gmail.com
- Phone: +254708786000

Delivery Location:
- Address: Lat: -4.050848, Lng: 39.687353
- City: Mombasa

Payment Information:
- Payment Method: M-Pesa / Paystack
- Payment Status: Pending

Order Items:
- ELFBAR BC10000 x1 - KES 2,000 each = KES 2,000

Total: KES 2,000

View order: https://ab2d648e112f.ngrok-free.app/admin/orders/cmjd4vc0r0000jzsbkw65az02', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766164715133-1","recipient":"admin"}', '2025-12-19 17:18:39.409', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd7rlh70006ie04x3h557tw', NULL, 'mombasashishabongs@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', '🛒 New Order Received - #ORD-1766169573176-3', 'New Order Received

Order Number: #ORD-1766169573176-3

Customer Information:
- Name: Patrick Mwangi
- Email: frashid274@gmail.com
- Phone: +254708786001

Delivery Location:
- Address: Lat: -4.050638, Lng: 39.687174
- City: Mombasa

Payment Information:
- Payment Method: M-Pesa / Paystack
- Payment Status: Pending

Order Items:
- test001 x1 - KES 1 each = KES 1

Total: KES 1

View order: https://mombasashishabongs.com/admin/orders/cmjd7rghp0000ie04c5l67e52', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766169573176-3","recipient":"admin","messageId":"<cc937c3e-bbce-14cf-0170-dae81dd08e6f@gmail.com>"}', '2025-12-19 18:39:39.644', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd7tpnk0023jzsb0ctlr9oc', NULL, 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766169675072-4', 'Order Confirmation - Order #ORD-1766169675072-4

Thank you for your purchase, Patrick Mwangi!

Order Items:
- test001 x1 - KES 1

Total: KES 1

Delivery Information:
Address: Lat: -4.050848, Lng: 39.687353
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: http://localhost:3000/orders/ORD-1766169675072-4', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766169675072-4","messageId":"<38ac9139-efed-392d-9942-60551d8d0a1f@gmail.com>"}', '2025-12-19 18:41:18.368', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd7tsap0025jzsbtuct3rld', NULL, 'mombasashishabongs@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', '🛒 New Order Received - #ORD-1766169675072-4', 'New Order Received

Order Number: #ORD-1766169675072-4

Customer Information:
- Name: Patrick Mwangi
- Email: frashid274@gmail.com
- Phone: +254708786000

Delivery Location:
- Address: Lat: -4.050848, Lng: 39.687353
- City: Mombasa

Payment Information:
- Payment Method: M-Pesa / Paystack
- Payment Status: Pending

Order Items:
- test001 x1 - KES 1 each = KES 1

Total: KES 1

View order: http://localhost:3000/admin/orders/cmjd7tn4n001zjzsbtho06913', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766169675072-4","recipient":"admin","messageId":"<35b9a3e8-fff2-d90b-9842-d36e0992dd1a@gmail.com>"}', '2025-12-19 18:41:21.793', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd7ug4s0029jzsbkpoait5v', NULL, 'frashid274@gmail.com', NULL, 'PAYMENT_RECEIVED', 'EMAIL', 'Payment Received - Order #ORD-1766169675072-4', 'Payment Received - Order #ORD-1766169675072-4

Amount: KES 1
Mpesa Receipt: ORD-ORD-1766169675072-4-1766169693733
Transaction ID: 5653237964

Your payment has been successfully received. We''re now processing your order.

View order: http://localhost:3000/orders/ORD-1766169675072-4', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766169675072-4","receiptNumber":"ORD-ORD-1766169675072-4-1766169693733","transactionId":"5653237964","messageId":"<fda32fdf-345f-cead-f5b8-747120790599@gmail.com>"}', '2025-12-19 18:41:52.683', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd7uig3002bjzsb23ys12hy', NULL, 'mombasashishabongs@gmail.com', NULL, 'PAYMENT_RECEIVED', 'EMAIL', 'Payment Received - Order #ORD-1766169675072-4', 'Payment received for Order #ORD-1766169675072-4. Amount: KES 1. Receipt: ORD-ORD-1766169675072-4-1766169693733

Customer: Patrick Mwangi
Email: frashid274@gmail.com
Phone: +254708786000

Delivery Location:
Lat: -4.050848, Lng: 39.687353, Mombasa
Coordinates: -4.0508475, 39.6873526
View on Google Maps: https://www.google.com/maps?q=-4.0508475,39.6873526', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766169675072-4","receiptNumber":"ORD-ORD-1766169675072-4-1766169693733","recipient":"admin","messageId":"<18b8d5ae-4ae2-751d-68b5-ad7c8ef86156@gmail.com>"}', '2025-12-19 18:41:55.683', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd55p3n000djzsbgcyzhrul', NULL, 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766165195176-2', 'Order Confirmation - Order #ORD-1766165195176-2

Thank you for your purchase, Patrick Mwangi!

Order Items:
- ELFBAR BC10000 x1 - KES 2,000

Total: KES 2,000

Delivery Information:
Address: Lat: -4.050848, Lng: 39.687353
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: https://ab2d648e112f.ngrok-free.app/orders/ORD-1766165195176-2', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766165195176-2"}', '2025-12-19 17:26:38.675', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd6up2z001hjzsb7ok95ehn', NULL, 'mombasashishabongs@gmail.com', NULL, 'PAYMENT_RECEIVED', 'EMAIL', 'Payment Received - Order #ORD-1766167900348-6', 'Payment received for Order #ORD-1766167900348-6. Amount: KES 2,000. Receipt: ORD-ORD-1766167900348-6-1766168019533', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766167900348-6","receiptNumber":"ORD-ORD-1766167900348-6-1766168019533","recipient":"admin"}', '2025-12-19 18:14:04.492', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd55pv4000fjzsb6ybqaa07', NULL, 'admin@mombasashishabongs.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', '🛒 New Order Received - #ORD-1766165195176-2', 'New Order Received

Order Number: #ORD-1766165195176-2

Customer Information:
- Name: Patrick Mwangi
- Email: frashid274@gmail.com
- Phone: +254708786000

Delivery Location:
- Address: Lat: -4.050848, Lng: 39.687353
- City: Mombasa

Payment Information:
- Payment Method: M-Pesa / Paystack
- Payment Status: Pending

Order Items:
- ELFBAR BC10000 x1 - KES 2,000 each = KES 2,000

Total: KES 2,000

View order: https://ab2d648e112f.ngrok-free.app/admin/orders/cmjd55mk20009jzsb49kykj1x', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766165195176-2","recipient":"admin"}', '2025-12-19 17:26:39.665', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd5ogr9000mjzsbqrv5dwx6', NULL, 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766166070535-3', 'Order Confirmation - Order #ORD-1766166070535-3

Thank you for your purchase, Patrick Mwangi!

Order Items:
- ELFBAR BC10000 x1 - KES 2,000

Total: KES 2,000

Delivery Information:
Address: Lat: -4.050848, Lng: 39.687353
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: https://ab2d648e112f.ngrok-free.app/orders/ORD-1766166070535-3', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766166070535-3"}', '2025-12-19 17:41:14.325', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd5ohcx000ojzsbetfp95om', NULL, 'admin@mombasashishabongs.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', '🛒 New Order Received - #ORD-1766166070535-3', 'New Order Received

Order Number: #ORD-1766166070535-3

Customer Information:
- Name: Patrick Mwangi
- Email: frashid274@gmail.com
- Phone: +254708786000

Delivery Location:
- Address: Lat: -4.050848, Lng: 39.687353
- City: Mombasa

Payment Information:
- Payment Method: M-Pesa / Paystack
- Payment Status: Pending

Order Items:
- ELFBAR BC10000 x1 - KES 2,000 each = KES 2,000

Total: KES 2,000

View order: https://ab2d648e112f.ngrok-free.app/admin/orders/cmjd5oduy000ijzsb2m3ye1ig', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766166070535-3","recipient":"admin"}', '2025-12-19 17:41:15.105', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd6lmdt000vjzsb8lh9wwq1', NULL, 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766167616718-4', 'Order Confirmation - Order #ORD-1766167616718-4

Thank you for your purchase, Patrick Mwangi!

Order Items:
- ELFBAR BC10000 x1 - KES 2,000

Total: KES 2,000

Delivery Information:
Address: Lat: -4.050848, Lng: 39.687353
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: http://localhost:3000/orders/ORD-1766167616718-4', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766167616718-4"}', '2025-12-19 18:07:01.264', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd6ln0w000xjzsbe80pyd7z', NULL, 'mombasashishabongs@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', '🛒 New Order Received - #ORD-1766167616718-4', 'New Order Received

Order Number: #ORD-1766167616718-4

Customer Information:
- Name: Patrick Mwangi
- Email: frashid274@gmail.com
- Phone: +254708786000

Delivery Location:
- Address: Lat: -4.050848, Lng: 39.687353
- City: Mombasa

Payment Information:
- Payment Method: M-Pesa / Paystack
- Payment Status: Pending

Order Items:
- ELFBAR BC10000 x1 - KES 2,000 each = KES 2,000

Total: KES 2,000

View order: http://localhost:3000/admin/orders/cmjd6liw8000rjzsbot5tnsj3', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766167616718-4","recipient":"admin"}', '2025-12-19 18:07:02.096', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd6m4rz0012jzsb2i0efggp', NULL, 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766167643077-5', 'Order Confirmation - Order #ORD-1766167643077-5

Thank you for your purchase, Patrick Mwangi!

Order Items:
- ELFBAR BC10000 x1 - KES 2,000

Total: KES 2,000

Delivery Information:
Address: Lat: -4.050848, Lng: 39.687353
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: http://localhost:3000/orders/ORD-1766167643077-5', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766167643077-5"}', '2025-12-19 18:07:25.103', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd6m57s0014jzsb4mtcoes2', NULL, 'mombasashishabongs@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', '🛒 New Order Received - #ORD-1766167643077-5', 'New Order Received

Order Number: #ORD-1766167643077-5

Customer Information:
- Name: Patrick Mwangi
- Email: frashid274@gmail.com
- Phone: +254708786000

Delivery Location:
- Address: Lat: -4.050848, Lng: 39.687353
- City: Mombasa

Payment Information:
- Payment Method: M-Pesa / Paystack
- Payment Status: Pending

Order Items:
- ELFBAR BC10000 x1 - KES 2,000 each = KES 2,000

Total: KES 2,000

View order: http://localhost:3000/admin/orders/cmjd6m384000yjzsbyt4jn2tv', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766167643077-5","recipient":"admin"}', '2025-12-19 18:07:25.673', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd6rp0e0019jzsbua895the', NULL, 'frashid274@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', 'Order Confirmation - #ORD-1766167900348-6', 'Order Confirmation - Order #ORD-1766167900348-6

Thank you for your purchase, Patrick Mwangi!

Order Items:
- ELFBAR BC10000 x1 - KES 2,000

Total: KES 2,000

Delivery Information:
Address: Lat: -4.050848, Lng: 39.687353
City: Mombasa

We''re processing your order and will notify you once it''s shipped.

View your order: http://localhost:3000/orders/ORD-1766167900348-6', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766167900348-6"}', '2025-12-19 18:11:44.607', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd6rpkn001bjzsbjq8rcwud', NULL, 'mombasashishabongs@gmail.com', NULL, 'ORDER_CONFIRMATION', 'EMAIL', '🛒 New Order Received - #ORD-1766167900348-6', 'New Order Received

Order Number: #ORD-1766167900348-6

Customer Information:
- Name: Patrick Mwangi
- Email: frashid274@gmail.com
- Phone: +254708786000

Delivery Location:
- Address: Lat: -4.050848, Lng: 39.687353
- City: Mombasa

Payment Information:
- Payment Method: M-Pesa / Paystack
- Payment Status: Pending

Order Items:
- ELFBAR BC10000 x1 - KES 2,000 each = KES 2,000

Total: KES 2,000

View order: http://localhost:3000/admin/orders/cmjd6rlqs0015jzsbdciyu6mk', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766167900348-6","recipient":"admin"}', '2025-12-19 18:11:45.335', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmjd6uo83001fjzsb83yvhnd9', NULL, 'frashid274@gmail.com', NULL, 'PAYMENT_RECEIVED', 'EMAIL', 'Payment Received - Order #ORD-1766167900348-6', 'Payment Received - Order #ORD-1766167900348-6

Amount: KES 2,000
Mpesa Receipt: ORD-ORD-1766167900348-6-1766168019533
Transaction ID: 5653167922

Your payment has been successfully received. We''re now processing your order.

View order: http://localhost:3000/orders/ORD-1766167900348-6', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"orderNumber":"ORD-1766167900348-6","receiptNumber":"ORD-ORD-1766167900348-6-1766168019533","transactionId":"5653167922"}', '2025-12-19 18:14:03.547', '2025-12-22 18:31:31.655');
INSERT INTO public.notifications (id, "orderId", "recipientEmail", "recipientPhone", type, channel, subject, message, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") VALUES ('cmje1twas0001l504hrg2wa8y', NULL, 'frashid274@gmail.com', NULL, 'ADMIN_ALERT', 'EMAIL', '🆕 New Products Just Arrived!', 'Exciting New Products Just Arrived!

We''re thrilled to announce our latest collection:

- ELFBAR BC10000: KES 2,000

Shop now: https://mombasashishabongs.com/products', 'SENT', '2025-12-22 18:31:31.654', NULL, '{"bulkEmail":true,"topic":"NEW_ITEMS","customerCount":1,"productCount":1,"messageId":"<26229b8d-2e9b-d230-5617-7525fbbe06ff@gmail.com>"}', '2025-12-20 08:41:15.46', '2025-12-22 18:31:31.655');


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.order_items (id, "orderId", "productId", "productName", "productSku", "productImage", price, quantity, subtotal, "createdAt", "colorId", "colorName", "colorValue", "specId", "specName", "specType", "specValue") VALUES ('cmjewn1qf0002ju04s66fvcfl', 'cmjewn1qf0000ju04w7m6ujsr', 'cmjerf8c9001bjzrf2h153g2w', 'SMOK RPM5', 'SMOK', '/uploads/products/1766263032245-q8bwnzw1u.jpg', 8000.00, 1, 8000.00, '2025-12-20 23:03:44.007', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.order_items (id, "orderId", "productId", "productName", "productSku", "productImage", price, quantity, subtotal, "createdAt", "colorId", "colorName", "colorValue", "specId", "specName", "specType", "specValue") VALUES ('cmjfrm1yt0002jo045pz61g8c', 'cmjfrm1yt0000jo04cjh1ecfn', 'cmjei1j7w0001jzos6pjqyo10', 'ELFBAR BC10000', 'Elfbar strawberry', '/uploads/products/1766247285606-bddx2kr5hq.jpg', 2000.00, 1, 2000.00, '2025-12-21 13:30:45.749', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.order_items (id, "orderId", "productId", "productName", "productSku", "productImage", price, quantity, subtotal, "createdAt", "colorId", "colorName", "colorValue", "specId", "specName", "specType", "specValue") VALUES ('cmjhfygv0000sjzipaf1yxtjq', 'cmjhfyguz000qjzip34l8pcrg', 'cmjhe62iu000njzro8rb2ucaq', 'Khaleej Shisha Flavor', 'Khaleej', '/uploads/products/1766422179454-4t7rv2s7v6f.jpg', 300.00, 1, 300.00, '2025-12-22 17:40:01.882', NULL, NULL, NULL, 'cmjhf8yam000bjzipjh7tx2sp', 'Love 66', 'Flavor', NULL);
INSERT INTO public.order_items (id, "orderId", "productId", "productName", "productSku", "productImage", price, quantity, subtotal, "createdAt", "colorId", "colorName", "colorValue", "specId", "specName", "specType", "specValue") VALUES ('cmjhh3n84001ljzip3aetwtbl', 'cmjhh3n84001jjzipbvfkxma3', 'cmjhe62iu000njzro8rb2ucaq', 'Khaleej Shisha Flavor', 'Khaleej', '/uploads/products/1766422179454-4t7rv2s7v6f.jpg', 300.00, 1, 300.00, '2025-12-22 18:12:03.026', NULL, NULL, NULL, 'cmjhf8yam000bjzipjh7tx2sp', 'Love 66', 'Flavor', NULL);
INSERT INTO public.order_items (id, "orderId", "productId", "productName", "productSku", "productImage", price, quantity, subtotal, "createdAt", "colorId", "colorName", "colorValue", "specId", "specName", "specType", "specValue") VALUES ('cmjhh3n84001mjzipmpjszi5o', 'cmjhh3n84001jjzipbvfkxma3', 'cmjhe62iu000njzro8rb2ucaq', 'Khaleej Shisha Flavor', 'Khaleej', '/uploads/products/1766422179454-4t7rv2s7v6f.jpg', 300.00, 1, 300.00, '2025-12-22 18:12:03.026', NULL, NULL, NULL, 'cmjheemo2000djzxgvuydbq8x', 'Blueberry', 'Flavor', NULL);
INSERT INTO public.order_items (id, "orderId", "productId", "productName", "productSku", "productImage", price, quantity, subtotal, "createdAt", "colorId", "colorName", "colorValue", "specId", "specName", "specType", "specValue") VALUES ('cmjijpdjk000iie04wfpt24pz', 'cmjijpdjk000gie04ula4777t', 'cmjigt1x0002kjzipolmaodfl', 'ELFBAR 30K Ice King 30000 Puffs ', 'ELFBAR 30k', 'https://res.cloudinary.com/dchyccifp/image/upload/v1766489500/uploads/products/z9ucijfplf2oegntermo.jpg', 3000.00, 1, 3000.00, '2025-12-23 12:12:42.32', NULL, NULL, NULL, 'cmjigup84002sjzip7cr8gco1', 'Watermelon Bubble Gum', 'Flavor', NULL);


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.orders (id, "orderNumber", "userId", "userEmail", "userName", "userPhone", "deliveryAddress", "deliveryCity", "deliveryNotes", "deliveryLatitude", "deliveryLongitude", subtotal, "deliveryFee", tax, discount, total, status, "paymentStatus", "trackingNumber", "estimatedDelivery", "deliveredAt", "adminNotes", "cancellationReason", "createdAt", "updatedAt", "cancelledAt", "scheduledDelivery", "deliveryAddressId") VALUES ('cmjhfyguz000qjzip34l8pcrg', 'ORD-1766425201871-3', 'user_36jy68pKDWUHjWGziUI4Hywiter', 'frashid274@gmail.com', 'Patrick Mwangi', '+254708786000', 'Lat: -4.050848, Lng: 39.687353', 'Mombasa', NULL, -4.0508475, 39.6873526, 300.00, 0.00, 0.00, 0.00, 300.00, 'CONFIRMED', 'PAID', NULL, NULL, NULL, NULL, NULL, '2025-12-22 17:40:01.882', '2025-12-22 17:40:32.688', NULL, NULL, 'cmjbsxba1000yjzivo1u7i8p2');
INSERT INTO public.orders (id, "orderNumber", "userId", "userEmail", "userName", "userPhone", "deliveryAddress", "deliveryCity", "deliveryNotes", "deliveryLatitude", "deliveryLongitude", subtotal, "deliveryFee", tax, discount, total, status, "paymentStatus", "trackingNumber", "estimatedDelivery", "deliveredAt", "adminNotes", "cancellationReason", "createdAt", "updatedAt", "cancelledAt", "scheduledDelivery", "deliveryAddressId") VALUES ('cmjhh3n84001jjzipbvfkxma3', 'ORD-1766427123022-4', 'user_36jy68pKDWUHjWGziUI4Hywiter', 'frashid274@gmail.com', 'Patrick Mwangi', '+254708786000', 'Lat: -4.050848, Lng: 39.687353', 'Mombasa', NULL, -4.0508475, 39.6873526, 600.00, 0.00, 0.00, 0.00, 600.00, 'CONFIRMED', 'PAID', NULL, NULL, NULL, NULL, NULL, '2025-12-22 18:12:03.026', '2025-12-22 18:12:35.672', NULL, NULL, 'cmjbsxba1000yjzivo1u7i8p2');
INSERT INTO public.orders (id, "orderNumber", "userId", "userEmail", "userName", "userPhone", "deliveryAddress", "deliveryCity", "deliveryNotes", "deliveryLatitude", "deliveryLongitude", subtotal, "deliveryFee", tax, discount, total, status, "paymentStatus", "trackingNumber", "estimatedDelivery", "deliveredAt", "adminNotes", "cancellationReason", "createdAt", "updatedAt", "cancelledAt", "scheduledDelivery", "deliveryAddressId") VALUES ('cmjfrm1yt0000jo04cjh1ecfn', 'ORD-1766323845747-2', 'user_374Ns8tWvlOnLVSjKeu5hzFt1Nm', 'frashid274@gmail.com', 'Patrick Mwangi', '+254708786000', 'Lat: -4.050916, Lng: 39.687120', 'Mombasa', NULL, -4.0509162, 39.6871203, 2000.00, 0.00, 0.00, 0.00, 2000.00, 'CANCELLED', 'PROCESSING', NULL, NULL, NULL, NULL, NULL, '2025-12-21 13:30:45.749', '2025-12-22 18:30:15.193', '2025-12-22 18:30:15.192', NULL, NULL);
INSERT INTO public.orders (id, "orderNumber", "userId", "userEmail", "userName", "userPhone", "deliveryAddress", "deliveryCity", "deliveryNotes", "deliveryLatitude", "deliveryLongitude", subtotal, "deliveryFee", tax, discount, total, status, "paymentStatus", "trackingNumber", "estimatedDelivery", "deliveredAt", "adminNotes", "cancellationReason", "createdAt", "updatedAt", "cancelledAt", "scheduledDelivery", "deliveryAddressId") VALUES ('cmjijpdjk000gie04ula4777t', 'ORD-1766491962319-5', 'user_37FHOENZyCWH3HaRLpxzGnv0hPZ', 'piusgko@gmail.com', 'Pius Pius', '+254742522252', 'Lat: -4.000781, Lng: 39.675922', 'Mombasa', NULL, -4.0007814, 39.6759224, 3000.00, 0.00, 0.00, 0.00, 3000.00, 'PENDING', 'PROCESSING', NULL, NULL, NULL, NULL, NULL, '2025-12-23 12:12:42.32', '2025-12-23 12:12:59.42', NULL, NULL, NULL);
INSERT INTO public.orders (id, "orderNumber", "userId", "userEmail", "userName", "userPhone", "deliveryAddress", "deliveryCity", "deliveryNotes", "deliveryLatitude", "deliveryLongitude", subtotal, "deliveryFee", tax, discount, total, status, "paymentStatus", "trackingNumber", "estimatedDelivery", "deliveredAt", "adminNotes", "cancellationReason", "createdAt", "updatedAt", "cancelledAt", "scheduledDelivery", "deliveryAddressId") VALUES ('cmjewn1qf0000ju04w7m6ujsr', 'ORD-1766271824005-1', 'guest', 'frashid274@gmail.com', 'guy', '+254708786000', 'Lat: -4.036707, Lng: 39.682102', 'Mombasa', NULL, -4.0367068, 39.6821022, 8000.00, 0.00, 0.00, 0.00, 8000.00, 'PENDING', 'PROCESSING', NULL, NULL, NULL, NULL, NULL, '2025-12-20 23:03:44.007', '2025-12-20 23:03:53.473', NULL, NULL, NULL);


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.payments (id, "orderId", method, "mpesaPhone", "mpesaReceiptNumber", "mpesaTransactionId", "mpesaCheckoutRequestId", "paystackReference", "paystackAuthorizationCode", "paystackCustomerCode", "paystackChannel", "cardLast4", "cardBrand", "bankReference", amount, currency, status, "providerResponse", "errorMessage", "paidAt", "createdAt", "updatedAt") VALUES ('cmjewn8vv0006ju04ls8zsgaw', 'cmjewn1qf0000ju04w7m6ujsr', 'PAYSTACK', NULL, NULL, NULL, NULL, 'ORD-ORD-1766271824005-1-1766271832826', NULL, NULL, NULL, NULL, NULL, NULL, 8000.00, 'KES', 'PROCESSING', '{"status":true,"message":"Authorization URL created","data":{"authorization_url":"https://checkout.paystack.com/c2zbe9c8em7wql2","access_code":"c2zbe9c8em7wql2","reference":"ORD-ORD-1766271824005-1-1766271832826"}}', NULL, NULL, '2025-12-20 23:03:53.275', '2025-12-20 23:03:53.275');
INSERT INTO public.payments (id, "orderId", method, "mpesaPhone", "mpesaReceiptNumber", "mpesaTransactionId", "mpesaCheckoutRequestId", "paystackReference", "paystackAuthorizationCode", "paystackCustomerCode", "paystackChannel", "cardLast4", "cardBrand", "bankReference", amount, currency, status, "providerResponse", "errorMessage", "paidAt", "createdAt", "updatedAt") VALUES ('cmjfrmipc0001l504n2r0qwgc', 'cmjfrm1yt0000jo04cjh1ecfn', 'PAYSTACK', NULL, NULL, NULL, NULL, 'ORD-ORD-1766323845747-2-1766323866943', NULL, NULL, NULL, NULL, NULL, NULL, 2000.00, 'KES', 'PROCESSING', '{"status":true,"message":"Authorization URL created","data":{"authorization_url":"https://checkout.paystack.com/cxpr672xxvcchx8","access_code":"cxpr672xxvcchx8","reference":"ORD-ORD-1766323845747-2-1766323866943"}}', NULL, NULL, '2025-12-21 13:31:07.44', '2025-12-21 13:31:07.44');
INSERT INTO public.payments (id, "orderId", method, "mpesaPhone", "mpesaReceiptNumber", "mpesaTransactionId", "mpesaCheckoutRequestId", "paystackReference", "paystackAuthorizationCode", "paystackCustomerCode", "paystackChannel", "cardLast4", "cardBrand", "bankReference", amount, currency, status, "providerResponse", "errorMessage", "paidAt", "createdAt", "updatedAt") VALUES ('cmjhfyqcc000ujzipr9qomu63', 'cmjhfyguz000qjzip34l8pcrg', 'PAYSTACK', NULL, NULL, NULL, NULL, 'ORD-ORD-1766425201871-3-1766425213081', 'AUTH_rlar0evg51', 'CUS_cdtvoj0djebjj9a', 'mobile_money', 'X000', 'M-pesa', NULL, 300.00, 'KES', 'PAID', '{"status":true,"message":"Verification successful","data":{"id":5662606122,"domain":"test","status":"success","reference":"ORD-ORD-1766425201871-3-1766425213081","receipt_number":"10101","amount":30000,"message":null,"gateway_response":"Approved","paid_at":"2025-12-22T17:40:21.000Z","created_at":"2025-12-22T17:40:13.000Z","channel":"mobile_money","currency":"KES","ip_address":"129.222.147.223","metadata":{"orderId":"cmjhfyguz000qjzip34l8pcrg","orderNumber":"ORD-1766425201871-3","customerName":"Patrick Mwangi","customerPhone":"+254708786000","referrer":"http://localhost:3000/"},"log":{"start_time":1766425219,"time_spent":1,"attempts":1,"errors":0,"success":false,"mobile":false,"input":[],"history":[{"type":"action","message":"Attempted to pay with mobile money","time":1}]},"fees":450,"fees_split":null,"authorization":{"authorization_code":"AUTH_rlar0evg51","bin":"071XXX","last4":"X000","exp_month":"12","exp_year":"9999","channel":"mobile_money","card_type":"","bank":"M-PESA","country_code":"KE","brand":"M-pesa","reusable":false,"signature":null,"account_name":null,"mobile_money_number":"0710000000","receiver_bank_account_number":null,"receiver_bank":null},"customer":{"id":325676608,"first_name":null,"last_name":null,"email":"frashid274@gmail.com","customer_code":"CUS_cdtvoj0djebjj9a","phone":null,"metadata":null,"risk_action":"default","international_format_phone":null},"plan":null,"split":{},"order_id":null,"paidAt":"2025-12-22T17:40:21.000Z","createdAt":"2025-12-22T17:40:13.000Z","requested_amount":30000,"pos_transaction_data":null,"source":null,"fees_breakdown":null,"connect":null,"transaction_date":"2025-12-22T17:40:13.000Z","plan_object":{},"subaccount":{}}}', NULL, '2025-12-22 17:40:21', '2025-12-22 17:40:14.006', '2025-12-22 17:40:32.34');
INSERT INTO public.payments (id, "orderId", method, "mpesaPhone", "mpesaReceiptNumber", "mpesaTransactionId", "mpesaCheckoutRequestId", "paystackReference", "paystackAuthorizationCode", "paystackCustomerCode", "paystackChannel", "cardLast4", "cardBrand", "bankReference", amount, currency, status, "providerResponse", "errorMessage", "paidAt", "createdAt", "updatedAt") VALUES ('cmjhh3w7h001ojzipds30pteb', 'cmjhh3n84001jjzipbvfkxma3', 'PAYSTACK', NULL, NULL, NULL, NULL, 'ORD-ORD-1766427123022-4-1766427133926', 'AUTH_zlwa4jp3pz', 'CUS_cdtvoj0djebjj9a', 'mobile_money', 'X000', 'M-pesa', NULL, 600.00, 'KES', 'PAID', '{"status":true,"message":"Verification successful","data":{"id":5662681517,"domain":"test","status":"success","reference":"ORD-ORD-1766427123022-4-1766427133926","receipt_number":"10101","amount":60000,"message":null,"gateway_response":"Approved","paid_at":"2025-12-22T18:12:20.000Z","created_at":"2025-12-22T18:12:14.000Z","channel":"mobile_money","currency":"KES","ip_address":"129.222.147.223","metadata":{"orderId":"cmjhh3n84001jjzipbvfkxma3","orderNumber":"ORD-1766427123022-4","customerName":"Patrick Mwangi","customerPhone":"+254708786000","referrer":"http://localhost:3000/"},"log":{"start_time":1766427138,"time_spent":1,"attempts":1,"errors":0,"success":false,"mobile":false,"input":[],"history":[{"type":"action","message":"Attempted to pay with mobile money","time":1}]},"fees":900,"fees_split":null,"authorization":{"authorization_code":"AUTH_zlwa4jp3pz","bin":"071XXX","last4":"X000","exp_month":"12","exp_year":"9999","channel":"mobile_money","card_type":"","bank":"M-PESA","country_code":"KE","brand":"M-pesa","reusable":false,"signature":null,"account_name":null,"mobile_money_number":"0710000000","receiver_bank_account_number":null,"receiver_bank":null},"customer":{"id":325676608,"first_name":null,"last_name":null,"email":"frashid274@gmail.com","customer_code":"CUS_cdtvoj0djebjj9a","phone":null,"metadata":null,"risk_action":"default","international_format_phone":null},"plan":null,"split":{},"order_id":null,"paidAt":"2025-12-22T18:12:20.000Z","createdAt":"2025-12-22T18:12:14.000Z","requested_amount":60000,"pos_transaction_data":null,"source":null,"fees_breakdown":null,"connect":null,"transaction_date":"2025-12-22T18:12:14.000Z","plan_object":{},"subaccount":{}}}', NULL, '2025-12-22 18:12:20', '2025-12-22 18:12:14.668', '2025-12-22 18:12:35.335');
INSERT INTO public.payments (id, "orderId", method, "mpesaPhone", "mpesaReceiptNumber", "mpesaTransactionId", "mpesaCheckoutRequestId", "paystackReference", "paystackAuthorizationCode", "paystackCustomerCode", "paystackChannel", "cardLast4", "cardBrand", "bankReference", amount, currency, status, "providerResponse", "errorMessage", "paidAt", "createdAt", "updatedAt") VALUES ('cmjijpql7000kie04bnuxrsg8', 'cmjijpdjk000gie04ula4777t', 'PAYSTACK', NULL, NULL, NULL, NULL, 'ORD-ORD-1766491962319-5-1766491978648', NULL, NULL, NULL, NULL, NULL, NULL, 3000.00, 'KES', 'PROCESSING', '{"status":true,"message":"Authorization URL created","data":{"authorization_url":"https://checkout.paystack.com/kbal08feir0fv4z","access_code":"kbal08feir0fv4z","reference":"ORD-ORD-1766491962319-5-1766491978648"}}', NULL, NULL, '2025-12-23 12:12:59.227', '2025-12-23 12:12:59.227');


--
-- Data for Name: product_bundle_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Data for Name: product_bundles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Data for Name: product_colors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.product_colors (id, "productId", name, value, "isActive", "createdAt", "updatedAt") VALUES ('cmjerg0bd001hjzrfpqpkvyuz', 'cmjerf8c9001bjzrf2h153g2w', 'Black', '#000000', true, '2025-12-20 20:38:17.328', '2025-12-20 20:38:17.328');
INSERT INTO public.product_colors (id, "productId", name, value, "isActive", "createdAt", "updatedAt") VALUES ('cmjerxghl001vjzrfl2f8ypwz', 'cmjerf8c9001bjzrf2h153g2w', 'Grey', '#808080', true, '2025-12-20 20:51:51.607', '2025-12-20 20:51:51.607');
INSERT INTO public.product_colors (id, "productId", name, value, "isActive", "createdAt", "updatedAt") VALUES ('cmjerxzlw001xjzrfe9xmcab4', 'cmjerf8c9001bjzrf2h153g2w', 'White', '#FFFFFF', true, '2025-12-20 20:52:16.208', '2025-12-20 20:52:16.208');
INSERT INTO public.product_colors (id, "productId", name, value, "isActive", "createdAt", "updatedAt") VALUES ('cmjij8kn5000bju04yd3ihewv', 'cmjij8jcu0007ju049nvouc99', 'Red', '#FF0000', true, '2025-12-23 11:59:38.369', '2025-12-23 11:59:38.369');
INSERT INTO public.product_colors (id, "productId", name, value, "isActive", "createdAt", "updatedAt") VALUES ('cmjij8l37000dju04bt0ncloo', 'cmjij8jcu0007ju049nvouc99', 'Silver', '#E6DBDB', true, '2025-12-23 11:59:38.384', '2025-12-23 11:59:38.384');
INSERT INTO public.product_colors (id, "productId", name, value, "isActive", "createdAt", "updatedAt") VALUES ('cmjij8l4l000fju04scd2m0hg', 'cmjij8jcu0007ju049nvouc99', 'Blue', '#0000FF', true, '2025-12-23 11:59:38.424', '2025-12-23 11:59:38.424');
INSERT INTO public.product_colors (id, "productId", name, value, "isActive", "createdAt", "updatedAt") VALUES ('cmjij8l6e000hju04tjh2lre6', 'cmjij8jcu0007ju049nvouc99', 'PURPLE', '#800080', true, '2025-12-23 11:59:38.494', '2025-12-23 11:59:38.494');
INSERT INTO public.product_colors (id, "productId", name, value, "isActive", "createdAt", "updatedAt") VALUES ('cmjij8l7u000jju04txh6u9l6', 'cmjij8jcu0007ju049nvouc99', 'Rose Gold', '#ECC5C0', true, '2025-12-23 11:59:38.55', '2025-12-23 11:59:38.55');
INSERT INTO public.product_colors (id, "productId", name, value, "isActive", "createdAt", "updatedAt") VALUES ('cmjij8m1g0001ie049g5xixg0', 'cmjij8jcu0007ju049nvouc99', 'Black', '#000000', true, '2025-12-23 11:59:40.177', '2025-12-23 11:59:40.177');
INSERT INTO public.product_colors (id, "productId", name, value, "isActive", "createdAt", "updatedAt") VALUES ('cmjijjruo0009ie04jhuagkqo', 'cmjijjqkd0005ie04b6dxqkug', 'Gold', '#F2BE02', true, '2025-12-23 12:08:20.928', '2025-12-23 12:08:20.928');
INSERT INTO public.product_colors (id, "productId", name, value, "isActive", "createdAt", "updatedAt") VALUES ('cmjijjsaw000lju040m7dvsnj', 'cmjijjqkd0005ie04b6dxqkug', 'Red', '#FF0000', true, '2025-12-23 12:08:20.933', '2025-12-23 12:08:20.933');
INSERT INTO public.product_colors (id, "productId", name, value, "isActive", "createdAt", "updatedAt") VALUES ('cmjijjses000bie04iaxwm9i9', 'cmjijjqkd0005ie04b6dxqkug', 'Blue', '#0000FF', true, '2025-12-23 12:08:21.069', '2025-12-23 12:08:21.069');
INSERT INTO public.product_colors (id, "productId", name, value, "isActive", "createdAt", "updatedAt") VALUES ('cmjijjsfg000die04j9n11q8s', 'cmjijjqkd0005ie04b6dxqkug', 'Black', '#000000', true, '2025-12-23 12:08:21.109', '2025-12-23 12:08:21.109');
INSERT INTO public.product_colors (id, "productId", name, value, "isActive", "createdAt", "updatedAt") VALUES ('cmjijjtau0001l7043yvvnww9', 'cmjijjqkd0005ie04b6dxqkug', 'Green', '#00FF00', true, '2025-12-23 12:08:22.802', '2025-12-23 12:08:22.802');
INSERT INTO public.product_colors (id, "productId", name, value, "isActive", "createdAt", "updatedAt") VALUES ('cmjikdtxp000al704u23w0vxk', 'cmjikdskp0007l704r4stfbeh', 'Red', '#FF0000', true, '2025-12-23 12:31:43.217', '2025-12-23 12:31:43.217');
INSERT INTO public.product_colors (id, "productId", name, value, "isActive", "createdAt", "updatedAt") VALUES ('cmjikduc5000cl704oetn6d40', 'cmjikdskp0007l704r4stfbeh', 'Black', '#000000', true, '2025-12-23 12:31:43.263', '2025-12-23 12:31:43.263');


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.product_images (id, "productId", url, "altText", "position", "isPrimary", "createdAt") VALUES ('cmjii8zsx0004jz55szwb2pu2', 'cmjigt1x0002kjzipolmaodfl', 'https://res.cloudinary.com/dchyccifp/image/upload/v1766489500/uploads/products/z9ucijfplf2oegntermo.jpg', '', 0, true, '2025-12-23 11:31:58.399');
INSERT INTO public.product_images (id, "productId", url, "altText", "position", "isPrimary", "createdAt") VALUES ('cmjii8zsx0005jz55v6nayy88', 'cmjigt1x0002kjzipolmaodfl', 'https://res.cloudinary.com/dchyccifp/image/upload/v1766489513/uploads/products/kunagq28ft1yfy6ykbga.jpg', '', 1, false, '2025-12-23 11:31:58.399');
INSERT INTO public.product_images (id, "productId", url, "altText", "position", "isPrimary", "createdAt") VALUES ('cmjiicjnt0006jz558dekn7oe', 'cmjhe62iu000njzro8rb2ucaq', 'https://res.cloudinary.com/dchyccifp/image/upload/v1766489545/uploads/products/emfpsgyoym01vkj0eszt.jpg', '', 0, true, '2025-12-23 11:34:43.929');
INSERT INTO public.product_images (id, "productId", url, "altText", "position", "isPrimary", "createdAt") VALUES ('cmjiicjnu0007jz55t3081o5p', 'cmjhe62iu000njzro8rb2ucaq', 'https://res.cloudinary.com/dchyccifp/image/upload/v1766489557/uploads/products/ldv5xhv6oahlxktyyth2.jpg', '', 1, false, '2025-12-23 11:34:43.929');
INSERT INTO public.product_images (id, "productId", url, "altText", "position", "isPrimary", "createdAt") VALUES ('cmjiifxvq0008jz5557k76z0o', 'cmjerf8c9001bjzrf2h153g2w', 'https://res.cloudinary.com/dchyccifp/image/upload/v1766489803/uploads/products/qthl9bmmiwzcsrgpotlu.jpg', '', 0, false, '2025-12-23 11:37:22.323');
INSERT INTO public.product_images (id, "productId", url, "altText", "position", "isPrimary", "createdAt") VALUES ('cmjiifxvq0009jz55e4c5dds1', 'cmjerf8c9001bjzrf2h153g2w', 'https://res.cloudinary.com/dchyccifp/image/upload/v1766489816/uploads/products/dcdxkfor5qqx7wbuzgws.jpg', '', 1, true, '2025-12-23 11:37:22.323');
INSERT INTO public.product_images (id, "productId", url, "altText", "position", "isPrimary", "createdAt") VALUES ('cmjiikbkp000ajz553hns4pey', 'cmjei1j7w0001jzos6pjqyo10', 'https://res.cloudinary.com/dchyccifp/image/upload/v1766489946/uploads/products/gchfjywzwt9npe2xai1n.jpg', '', 0, true, '2025-12-23 11:40:46.697');
INSERT INTO public.product_images (id, "productId", url, "altText", "position", "isPrimary", "createdAt") VALUES ('cmjij2q310005ju04gz5w1kvk', 'cmjiitnoi0001ju040uvu2zlk', 'https://res.cloudinary.com/dchyccifp/image/upload/v1766490461/uploads/products/tunzbn8v5uhkqz1xdwt3.jpg', '', 0, true, '2025-12-23 11:55:05.485');
INSERT INTO public.product_images (id, "productId", url, "altText", "position", "isPrimary", "createdAt") VALUES ('cmjij8u710002ie049q4iz0rg', 'cmjij8jcu0007ju049nvouc99', 'https://res.cloudinary.com/dchyccifp/image/upload/v1766490995/uploads/products/wwxdysnxwjuvl7i0e9ew.jpg', '', 0, true, '2025-12-23 11:59:50.749');
INSERT INTO public.product_images (id, "productId", url, "altText", "position", "isPrimary", "createdAt") VALUES ('cmjij8u710003ie04wvs1oknw', 'cmjij8jcu0007ju049nvouc99', 'https://res.cloudinary.com/dchyccifp/image/upload/v1766491004/uploads/products/a6be6ezqvtdzkzgyaqok.jpg', '', 1, false, '2025-12-23 11:59:50.749');
INSERT INTO public.product_images (id, "productId", url, "altText", "position", "isPrimary", "createdAt") VALUES ('cmjijk1io0002l70439bsun89', 'cmjijjqkd0005ie04b6dxqkug', 'https://res.cloudinary.com/dchyccifp/image/upload/v1766491604/uploads/products/bysxv5ahlyzpw30oaac8.jpg', '', 0, true, '2025-12-23 12:08:33.456');
INSERT INTO public.product_images (id, "productId", url, "altText", "position", "isPrimary", "createdAt") VALUES ('cmjijk1io0003l704np4p5q9x', 'cmjijjqkd0005ie04b6dxqkug', 'https://res.cloudinary.com/dchyccifp/image/upload/v1766491621/uploads/products/muluyf8bah2dpfpxe5t4.jpg', '', 1, false, '2025-12-23 12:08:33.456');
INSERT INTO public.product_images (id, "productId", url, "altText", "position", "isPrimary", "createdAt") VALUES ('cmjike1fz0001l504d06ytrcv', 'cmjikdskp0007l704r4stfbeh', 'https://res.cloudinary.com/dchyccifp/image/upload/v1766493043/uploads/products/oi2erxddmtftd8qidztv.jpg', '', 0, true, '2025-12-23 12:31:53.039');


--
-- Data for Name: product_specifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjheb1lx0001jzxg37yhnss3', 'cmjhe62iu000njzro8rb2ucaq', 'Flavor', 'Mint', NULL, true, 0, '2025-12-22 16:53:49.413', '2025-12-22 16:53:49.413');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjhed04k0003jzxgse46g6iz', 'cmjhe62iu000njzro8rb2ucaq', 'Flavor', 'Watermelon', NULL, true, 0, '2025-12-22 16:55:20.804', '2025-12-22 16:55:20.804');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjhedf5t0005jzxg36poyeuu', 'cmjhe62iu000njzro8rb2ucaq', 'Flavor', 'icemint', NULL, true, 0, '2025-12-22 16:55:40.289', '2025-12-22 16:55:40.289');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjhedo9t0007jzxgomarl0f8', 'cmjhe62iu000njzro8rb2ucaq', 'Flavor', 'Grape', NULL, true, 0, '2025-12-22 16:55:52.098', '2025-12-22 16:55:52.098');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjhedx0d0009jzxgkeouzc71', 'cmjhe62iu000njzro8rb2ucaq', 'Flavor', 'Hawaai', NULL, true, 0, '2025-12-22 16:56:03.421', '2025-12-22 16:56:03.421');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjhee9jf000bjzxg156v4ycl', 'cmjhe62iu000njzro8rb2ucaq', 'Flavor', 'Bubblegum', NULL, true, 0, '2025-12-22 16:56:19.659', '2025-12-22 16:56:19.659');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjheemo2000djzxgvuydbq8x', 'cmjhe62iu000njzro8rb2ucaq', 'Flavor', 'Blueberry', NULL, true, 0, '2025-12-22 16:56:36.674', '2025-12-22 16:56:36.674');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjheexog000fjzxg4i1pisgj', 'cmjhe62iu000njzro8rb2ucaq', 'Flavor', 'Lady Killer', NULL, true, 0, '2025-12-22 16:56:50.945', '2025-12-22 16:56:50.945');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjhefafh000hjzxgxes31f2l', 'cmjhe62iu000njzro8rb2ucaq', 'Flavor', 'Bluemix', NULL, true, 0, '2025-12-22 16:57:07.468', '2025-12-22 16:57:07.468');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjhf8wxu0005jziphc8dlr2w', 'cmjhe62iu000njzro8rb2ucaq', 'Flavor', 'Orange Mint', NULL, true, 2, '2025-12-22 17:20:09.664', '2025-12-22 17:20:09.664');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjhf8xw90007jzipze5lndun', 'cmjhe62iu000njzro8rb2ucaq', 'Flavor', 'Kiwi', NULL, true, 3, '2025-12-22 17:20:10.905', '2025-12-22 17:20:10.905');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjhf8y1r0009jzipjjt4ezu2', 'cmjhe62iu000njzro8rb2ucaq', 'Flavor', 'Greenmint', NULL, true, 1, '2025-12-22 17:20:11.104', '2025-12-22 17:20:11.104');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjhf8yam000bjzipjh7tx2sp', 'cmjhe62iu000njzro8rb2ucaq', 'Flavor', 'Love 66', NULL, true, 0, '2025-12-22 17:20:11.422', '2025-12-22 17:20:11.422');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjiguooz002pjzipkagob4gk', 'cmjigt1x0002kjzipolmaodfl', 'Flavor', 'Miami Night', NULL, true, 0, '2025-12-23 10:52:51.202', '2025-12-23 10:52:51.202');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjiguooz002qjzipxd7qu19q', 'cmjigt1x0002kjzipolmaodfl', 'Flavor', 'Blue Razz Ice', NULL, true, 1, '2025-12-23 10:52:51.203', '2025-12-23 10:52:51.203');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjigup84002sjzip7cr8gco1', 'cmjigt1x0002kjzipolmaodfl', 'Flavor', 'Watermelon Bubble Gum', NULL, true, 3, '2025-12-23 10:52:51.892', '2025-12-23 10:52:51.892');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjiguppd002ujzip87dm7cdw', 'cmjigt1x0002kjzipolmaodfl', 'Flavor', 'Cherry Watermelon', NULL, true, 4, '2025-12-23 10:52:52.513', '2025-12-23 10:52:52.513');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjiguqg3002wjzipxk7n355y', 'cmjigt1x0002kjzipolmaodfl', 'Flavor', 'Strawberry', NULL, true, 2, '2025-12-23 10:52:53.476', '2025-12-23 10:52:53.476');
INSERT INTO public.product_specifications (id, "productId", type, name, value, "isActive", "position", "createdAt", "updatedAt") VALUES ('cmjiitpm40004ju04eefpwiqv', 'cmjiitnoi0001ju040uvu2zlk', 'Flavor', 'Spearmint Menthol', NULL, true, 0, '2025-12-23 11:48:04.973', '2025-12-23 11:48:04.973');


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.products (id, name, slug, description, "shortDescription", sku, price, "compareAtPrice", "costPrice", stock, "lowStockThreshold", "trackInventory", "allowBackorder", "categoryId", brand, tags, "featuredImage", weight, length, width, height, "metaTitle", "metaDescription", "isActive", "isFeatured", "isNewArrival", "createdAt", "updatedAt", "publishedAt") VALUES ('cmjei1j7w0001jzos6pjqyo10', 'ELFBAR BC10000', 'elfbar-bc10000', 'The ELFBAR BC10000 sets a new standard in the vaping world, delivering an astonishing 10,000 puffs powered by an 18ml e-liquid reservoir and a 620mAh rechargeable battery. Designed for adult smokers seeking a convenient and flavorful alternative to traditional cigarettes, this cutting-edge device combines innovation, style, and performance in a sleek, pocket-friendly package.', NULL, 'Elfbar', 2000.00, NULL, NULL, 100, 10, true, false, 'cmjeh3d6s0001jzjuhmp9tlsq', 'ELFBAR', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, false, false, '2025-12-20 16:15:05.438', '2025-12-23 11:40:46.697', NULL);
INSERT INTO public.products (id, name, slug, description, "shortDescription", sku, price, "compareAtPrice", "costPrice", stock, "lowStockThreshold", "trackInventory", "allowBackorder", "categoryId", brand, tags, "featuredImage", weight, length, width, height, "metaTitle", "metaDescription", "isActive", "isFeatured", "isNewArrival", "createdAt", "updatedAt", "publishedAt") VALUES ('cmjhe62iu000njzro8rb2ucaq', 'Khaleej Shisha Flavor', 'khaleej-shisha-flavor', 'Khaleej is a rich and smooth shisha flavor inspired by classic Middle Eastern taste. It blends warm spices with a light sweetness, giving a deep and relaxing smoke. The flavor is well-balanced, not too strong and not too light, making it perfect for long sessions. It leaves a pleasant aroma and a smooth finish that many shisha lovers enjoy.', NULL, 'Khaleej', 300.00, NULL, NULL, 996, 10, true, false, 'cmjeh3csa0000jzjupw7oeukl', 'Khaleej', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, false, false, '2025-12-22 16:49:57.153', '2025-12-23 11:34:43.929', NULL);
INSERT INTO public.products (id, name, slug, description, "shortDescription", sku, price, "compareAtPrice", "costPrice", stock, "lowStockThreshold", "trackInventory", "allowBackorder", "categoryId", brand, tags, "featuredImage", weight, length, width, height, "metaTitle", "metaDescription", "isActive", "isFeatured", "isNewArrival", "createdAt", "updatedAt", "publishedAt") VALUES ('cmjerf8c9001bjzrf2h153g2w', 'SMOK RPM5', 'smok-rpm5', 'Introducing the SMOK RPM 5 Pro 80W Pod System – a compact and stylish device that combines the convenience of a pod system with the power of a mod. The sleek zinc-alloy chassis delivers a slim and portable form factor, perfect for those on the go. Powered by a single high-amp 18650 battery (not included), the device outputs up to 80W of pure vaping power, and the wattage, voltage, and other device data can be viewed on the 0.96” TFT display screen.

The SMOK RPM 5 Pro pod system features an adjustable airflow control system and utilizes coils from the SMOK RPM 3 Coil Series to deliver dense vapor clouds and delicious flavor from your favorite e-juice or nicotine salts. The 6.5mL refillable pod has a top-fill system that is silicone stoppered for easy and mess-free refilling. The device is also equipped with multiple protections, including short-circuit protection and an 8-second cut-off to ensure a safe and enjoyable vaping experience.

The kit includes the RPM 5 Pro device, an RPM 5 pod, two RPM 3 mesh coils (0.15ohm and 0.23ohm), a Type-C cable, and a user manual. Available in a range of stylish colors, including Brown Leather, Grey Leather, Black Leather, Matte Gunmetal, White, Black, Beige White Leather, and Prism Rainbow.

Compatible with Smok RPM 3 coils, the RPM 5 Pro is recommended for high VG e-liquids with a VG:PG ratio of 70:30 and above. Suited to users with some experience, the RPM 5 Pro is perfect for those who want a compact and stylish device that delivers both portability and power.', NULL, 'SMOK', 8000.00, NULL, NULL, 97, 10, true, false, 'cmjeh3e8j0005jzjuoogt0a85', 'SMOK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, false, false, '2025-12-20 20:37:41.077', '2025-12-23 11:37:22.323', NULL);
INSERT INTO public.products (id, name, slug, description, "shortDescription", sku, price, "compareAtPrice", "costPrice", stock, "lowStockThreshold", "trackInventory", "allowBackorder", "categoryId", brand, tags, "featuredImage", weight, length, width, height, "metaTitle", "metaDescription", "isActive", "isFeatured", "isNewArrival", "createdAt", "updatedAt", "publishedAt") VALUES ('cmjij8jcu0007ju049nvouc99', 'Spider Portable Hookah', 'spider-portable-hookah', 'The 12" Mini Spider Hookah is a compact and stylish hookah designed for easy handling and portability. Its spider-style stem gives it a modern, eye-catching look while maintaining solid build quality.

This hookah comes neatly packed in an Amira carrying bag, making it convenient for storage and transport. Despite its small size, the Mini Spider is built to deliver a smooth and steady smoke experience when properly set up.

The compact height makes it ideal for personal use or small spaces, while the durable materials ensure long-lasting performance. Its simple design allows for easy cleaning and maintenance.

Key features:

12-inch compact size

Modern spider-style design

Strong and durable build

Includes Amira carrying bag for easy transport

Ideal for personal or travel use
', NULL, 'Spider', 5000.00, NULL, NULL, 98, 10, true, false, 'cmjeh3dfs0002jzjume11dpfg', 'Amira', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, false, false, '2025-12-23 11:59:36.702', '2025-12-23 11:59:50.749', NULL);
INSERT INTO public.products (id, name, slug, description, "shortDescription", sku, price, "compareAtPrice", "costPrice", stock, "lowStockThreshold", "trackInventory", "allowBackorder", "categoryId", brand, tags, "featuredImage", weight, length, width, height, "metaTitle", "metaDescription", "isActive", "isFeatured", "isNewArrival", "createdAt", "updatedAt", "publishedAt") VALUES ('cmjiitnoi0001ju040uvu2zlk', 'Bl Vk original Eliquid', 'bl-vk-original-eliquid', 'BLVK E-Liquid is a premium vape liquid brand known for its bold fruit blends and clean, consistent flavor profiles. The brand focuses on smooth taste, balanced sweetness, and a refined finish, making its flavors stand out in the global e-liquid market.

Each BLVK flavor is crafted to deliver a rich aroma and a clear, well-defined taste without being harsh. Popular profiles include fruit mixes, menthol blends, and dessert-inspired options, designed for users who prefer strong but smooth flavors.

BLVK E-Liquid is produced with high-quality ingredients and follows strict manufacturing standards to ensure consistency across batches. The brand is widely recognized for its sleek packaging, modern branding, and reliable flavor quality.', NULL, 'BLVK', 1700.00, NULL, NULL, 997, 10, true, false, 'cmjeh3ehn0006jzju6090swbf', 'BL VK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, false, false, '2025-12-23 11:48:02.466', '2025-12-23 11:55:05.485', NULL);
INSERT INTO public.products (id, name, slug, description, "shortDescription", sku, price, "compareAtPrice", "costPrice", stock, "lowStockThreshold", "trackInventory", "allowBackorder", "categoryId", brand, tags, "featuredImage", weight, length, width, height, "metaTitle", "metaDescription", "isActive", "isFeatured", "isNewArrival", "createdAt", "updatedAt", "publishedAt") VALUES ('cmjigt1x0002kjzipolmaodfl', 'ELFBAR 30K Ice King 30000 Puffs ', 'elfbar-30k-ice-king-30000-puffs', 'The ELFBAR 30K Ice King 30000 Puffs isn’t just about longevity; it’s about delivering a compelling and rich taste journey. Packed with 20ml of premium e-liquid, it guarantees a consistent and refreshing vaping experience. Each puff releases a chilling wave of flavor that cools and refreshes, designing a unique taste profile that is both invigorating and satisfying. For those hot summer days or just a crisp morning vibe, this is your ideal choice.', NULL, 'ELFBAR 30k', 3000.00, NULL, NULL, 1000, 10, true, false, 'cmjeh3d6s0001jzjuhmp9tlsq', 'ElfBar', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, false, false, '2025-12-23 10:51:34.857', '2025-12-23 12:12:43.545', NULL);
INSERT INTO public.products (id, name, slug, description, "shortDescription", sku, price, "compareAtPrice", "costPrice", stock, "lowStockThreshold", "trackInventory", "allowBackorder", "categoryId", brand, tags, "featuredImage", weight, length, width, height, "metaTitle", "metaDescription", "isActive", "isFeatured", "isNewArrival", "createdAt", "updatedAt", "publishedAt") VALUES ('cmjijjqkd0005ie04b6dxqkug', 'Medium Hookah', 'medium-hookah', 'The Medium Size Hookah is designed to offer a balanced smoking experience with both style and stability. It provides better smoke flow than small hookahs while remaining easy to set up and handle.

Built with durable materials, this hookah delivers smooth draws and consistent performance. Its medium height makes it suitable for home use, lounges, or small gatherings, offering a good balance between portability and presence.

The classic design fits well in any setting and is easy to clean and maintain, making it a dependable choice for regular use.

Key features:

Medium size for balanced performance

Smooth and steady smoke flow

Strong and durable construction

Easy to clean and maintain

Suitable for home or lounge use', NULL, 'HH', 4500.00, NULL, NULL, 98, 10, true, false, 'cmjeh3dfs0002jzjume11dpfg', 'Hookah', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, false, false, '2025-12-23 12:08:19.168', '2025-12-23 12:08:33.456', NULL);
INSERT INTO public.products (id, name, slug, description, "shortDescription", sku, price, "compareAtPrice", "costPrice", stock, "lowStockThreshold", "trackInventory", "allowBackorder", "categoryId", brand, tags, "featuredImage", weight, length, width, height, "metaTitle", "metaDescription", "isActive", "isFeatured", "isNewArrival", "createdAt", "updatedAt", "publishedAt") VALUES ('cmjikdskp0007l704r4stfbeh', 'Mini Hookah', 'mini-hookah', 'The Mini Hookah is a small and portable hookah designed for personal use and small spaces. Its compact size makes it easy to carry, store, and set up, while still delivering a smooth and enjoyable smoking experience.

Built with durable materials, the Mini Hookah offers steady performance and is easy to clean and maintain. It is ideal for beginners or anyone looking for a convenient hookah for home, travel, or casual use.', NULL, 'MH', 5000.00, NULL, NULL, 99, 10, true, false, 'cmjeh3dfs0002jzjume11dpfg', 'Hookah', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, false, false, '2025-12-23 12:31:41.545', '2025-12-23 12:31:53.039', NULL);


--
-- Data for Name: recently_viewed; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjijl8ub000fie04vppq1rrx', NULL, 'guest-1766491716173', 'cmjigt1x0002kjzipolmaodfl', '2025-12-23 12:09:29.51');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjesapi90001l804duy372oa', 'user_374Ns8tWvlOnLVSjKeu5hzFt1Nm', NULL, 'cmjerf8c9001bjzrf2h153g2w', '2025-12-23 12:20:59.793');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjhehe88000njzxgf3jcible', 'user_36jy68pKDWUHjWGziUI4Hywiter', NULL, 'cmjhe62iu000njzro8rb2ucaq', '2025-12-23 13:06:08.504');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjex15dc0001jv04o99hw7x0', NULL, 'guest-1766272481074', 'cmjerf8c9001bjzrf2h153g2w', '2025-12-20 23:14:41.904');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjfsui3u0001la04vumyr5nc', NULL, 'guest-1766154586487', 'cmjerf8c9001bjzrf2h153g2w', '2025-12-21 14:05:18.813');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjg1j3jt0001l504hqd6j76n', NULL, 'guest-1766330314877', 'cmjei1j7w0001jzos6pjqyo10', '2025-12-21 18:08:23.239');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjg1jyw10003l50469kttgkp', NULL, 'guest-1766330314877', 'cmjerf8c9001bjzrf2h153g2w', '2025-12-21 18:09:04.515');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjgekmpn0001jl04etndf2ik', NULL, 'guest-1766362236902', 'cmjei1j7w0001jzos6pjqyo10', '2025-12-22 00:13:29.754');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjgeoakw0001k304fzaf32hv', NULL, 'guest-1766362244915', 'cmjerf8c9001bjzrf2h153g2w', '2025-12-22 00:16:21.298');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjgepfq40003jl046b6kjt2i', NULL, 'guest-1766362236902', 'cmjerf8c9001bjzrf2h153g2w', '2025-12-22 00:17:14.62');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjgexiq10005jl04pa6nux02', NULL, 'guest-1766362244915', 'cmjei1j7w0001jzos6pjqyo10', '2025-12-22 00:23:31.28');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjemec7i0001l704tqkp6avf', NULL, 'guest-1766253981081', 'cmjei1j7w0001jzos6pjqyo10', '2025-12-20 18:17:00.943');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjemvvjl0001js04jir4t2v0', NULL, 'guest-1766255311736', 'cmjei1j7w0001jzos6pjqyo10', '2025-12-20 18:34:01.549');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjep4uhi0001jo04naac86z8', NULL, 'guest-1766183877215', 'cmjei1j7w0001jzos6pjqyo10', '2025-12-20 19:33:36.921');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjes79ks0023jzrfyx7ptg2b', 'user_36jy68pKDWUHjWGziUI4Hywiter', NULL, 'cmjei1j7w0001jzos6pjqyo10', '2025-12-22 18:02:31.636');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjerso34001rjzrftlptktg7', 'user_36jy68pKDWUHjWGziUI4Hywiter', NULL, 'cmjerf8c9001bjzrf2h153g2w', '2025-12-22 18:04:00.741');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjeqhvj70001jz37t0p4darh', 'user_36nbZLxkNRmIaHIwjHvp5gtDMZK', NULL, 'cmjei1j7w0001jzos6pjqyo10', '2025-12-20 20:27:50.413');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjepo6370003jzs30ddwl4sx', NULL, 'guest-1766081009447', 'cmjei1j7w0001jzos6pjqyo10', '2025-12-20 20:27:53.666');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjhis3oj001yjzip071hq34o', NULL, 'guest-1766426312330', 'cmjhe62iu000njzro8rb2ucaq', '2025-12-22 18:59:10.768');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjhis8e30022jzipce1f6w50', NULL, 'guest-1766426312330', 'cmjerf8c9001bjzrf2h153g2w', '2025-12-22 18:59:55.534');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjhwxeob0001l504e93c8iiw', NULL, 'guest-1766453703631', 'cmjerf8c9001bjzrf2h153g2w', '2025-12-23 01:35:05.133');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjhx2yga0001l804xfsu7t0f', NULL, 'guest-1766453964541', 'cmjhe62iu000njzro8rb2ucaq', '2025-12-23 01:39:24.684');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjhyppzz0001l204rjcj5yz8', NULL, 'guest-1766456704795', 'cmjei1j7w0001jzos6pjqyo10', '2025-12-23 02:25:05.793');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjigvk4z0001ju04ym9unhcc', 'user_374Ns8tWvlOnLVSjKeu5hzFt1Nm', NULL, 'cmjigt1x0002kjzipolmaodfl', '2025-12-23 10:54:07.42');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjep5h9r0001jx04l3fcqf9n', 'user_374Ns8tWvlOnLVSjKeu5hzFt1Nm', NULL, 'cmjei1j7w0001jzos6pjqyo10', '2025-12-23 10:54:36.538');
INSERT INTO public.recently_viewed (id, "userId", "sessionId", "productId", "viewedAt") VALUES ('cmjii6scl0001jz553tggjdp3', 'user_36k0lhEVptsv6RfILDN9sFZimaq', NULL, 'cmjigt1x0002kjzipolmaodfl', '2025-12-23 11:30:15.432');


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Data for Name: saved_cart_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Data for Name: saved_searches; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.settings (id, key, value, description, category, "isPublic", "createdAt", "updatedAt") VALUES ('cmj4q6n2t000mjzjphip9y98i', 'site_name', 'Mombasa Shisha Bongs', 'Website name', 'general', true, '2025-12-13 20:05:19.062', '2025-12-13 20:05:19.062');
INSERT INTO public.settings (id, key, value, description, category, "isPublic", "createdAt", "updatedAt") VALUES ('cmj4q6n2t000njzjpw3abcqk7', 'delivery_fee_mombasa', '0', 'Free delivery in Mombasa', 'shipping', true, '2025-12-13 20:05:19.062', '2025-12-13 20:05:19.062');
INSERT INTO public.settings (id, key, value, description, category, "isPublic", "createdAt", "updatedAt") VALUES ('cmj4q6n2t000ojzjpdn0tyej1', 'delivery_fee_other', '500', 'Delivery fee outside Mombasa', 'shipping', true, '2025-12-13 20:05:19.062', '2025-12-13 20:05:19.062');
INSERT INTO public.settings (id, key, value, description, category, "isPublic", "createdAt", "updatedAt") VALUES ('cmj4q6n2t000pjzjpba06n2o3', 'low_stock_alert_threshold', '10', 'Alert when stock falls below this number', 'inventory', false, '2025-12-13 20:05:19.062', '2025-12-13 20:05:19.062');


--
-- Data for Name: stock_notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Data for Name: wishlist_shares; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: delivery_addresses delivery_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.delivery_addresses
    ADD CONSTRAINT delivery_addresses_pkey PRIMARY KEY (id);


--
-- Name: flash_sales flash_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.flash_sales
    ADD CONSTRAINT flash_sales_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: product_bundle_items product_bundle_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_bundle_items
    ADD CONSTRAINT product_bundle_items_pkey PRIMARY KEY (id);


--
-- Name: product_bundles product_bundles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_bundles
    ADD CONSTRAINT product_bundles_pkey PRIMARY KEY (id);


--
-- Name: product_colors product_colors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_colors
    ADD CONSTRAINT product_colors_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_specifications product_specifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_specifications
    ADD CONSTRAINT product_specifications_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: recently_viewed recently_viewed_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recently_viewed
    ADD CONSTRAINT recently_viewed_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: saved_cart_items saved_cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.saved_cart_items
    ADD CONSTRAINT saved_cart_items_pkey PRIMARY KEY (id);


--
-- Name: saved_searches saved_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.saved_searches
    ADD CONSTRAINT saved_searches_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: stock_notifications stock_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_notifications
    ADD CONSTRAINT stock_notifications_pkey PRIMARY KEY (id);


--
-- Name: wishlist_shares wishlist_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wishlist_shares
    ADD CONSTRAINT wishlist_shares_pkey PRIMARY KEY (id);


--
-- Name: admin_logs_action_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX admin_logs_action_idx ON public.admin_logs USING btree (action);


--
-- Name: admin_logs_adminId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "admin_logs_adminId_idx" ON public.admin_logs USING btree ("adminId");


--
-- Name: admin_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "admin_logs_createdAt_idx" ON public.admin_logs USING btree ("createdAt");


--
-- Name: admin_logs_entity_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX admin_logs_entity_idx ON public.admin_logs USING btree (entity);


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: categories_parentId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "categories_parentId_idx" ON public.categories USING btree ("parentId");


--
-- Name: categories_slug_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX categories_slug_idx ON public.categories USING btree (slug);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: delivery_addresses_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "delivery_addresses_userId_idx" ON public.delivery_addresses USING btree ("userId");


--
-- Name: flash_sales_isActive_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "flash_sales_isActive_idx" ON public.flash_sales USING btree ("isActive");


--
-- Name: flash_sales_startDate_endDate_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "flash_sales_startDate_endDate_idx" ON public.flash_sales USING btree ("startDate", "endDate");


--
-- Name: newsletter_subscribers_email_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX newsletter_subscribers_email_idx ON public.newsletter_subscribers USING btree (email);


--
-- Name: newsletter_subscribers_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX newsletter_subscribers_email_key ON public.newsletter_subscribers USING btree (email);


--
-- Name: newsletter_subscribers_isActive_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "newsletter_subscribers_isActive_idx" ON public.newsletter_subscribers USING btree ("isActive");


--
-- Name: notifications_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "notifications_createdAt_idx" ON public.notifications USING btree ("createdAt");


--
-- Name: notifications_orderId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "notifications_orderId_idx" ON public.notifications USING btree ("orderId");


--
-- Name: notifications_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX notifications_status_idx ON public.notifications USING btree (status);


--
-- Name: notifications_type_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX notifications_type_idx ON public.notifications USING btree (type);


--
-- Name: order_items_colorId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "order_items_colorId_idx" ON public.order_items USING btree ("colorId");


--
-- Name: order_items_orderId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "order_items_orderId_idx" ON public.order_items USING btree ("orderId");


--
-- Name: order_items_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "order_items_productId_idx" ON public.order_items USING btree ("productId");


--
-- Name: order_items_specId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "order_items_specId_idx" ON public.order_items USING btree ("specId");


--
-- Name: orders_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "orders_createdAt_idx" ON public.orders USING btree ("createdAt");


--
-- Name: orders_orderNumber_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "orders_orderNumber_idx" ON public.orders USING btree ("orderNumber");


--
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- Name: orders_paymentStatus_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "orders_paymentStatus_idx" ON public.orders USING btree ("paymentStatus");


--
-- Name: orders_scheduledDelivery_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "orders_scheduledDelivery_idx" ON public.orders USING btree ("scheduledDelivery");


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: orders_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "orders_userId_idx" ON public.orders USING btree ("userId");


--
-- Name: payments_mpesaCheckoutRequestId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "payments_mpesaCheckoutRequestId_key" ON public.payments USING btree ("mpesaCheckoutRequestId");


--
-- Name: payments_mpesaReceiptNumber_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "payments_mpesaReceiptNumber_idx" ON public.payments USING btree ("mpesaReceiptNumber");


--
-- Name: payments_mpesaReceiptNumber_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "payments_mpesaReceiptNumber_key" ON public.payments USING btree ("mpesaReceiptNumber");


--
-- Name: payments_mpesaTransactionId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "payments_mpesaTransactionId_idx" ON public.payments USING btree ("mpesaTransactionId");


--
-- Name: payments_mpesaTransactionId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "payments_mpesaTransactionId_key" ON public.payments USING btree ("mpesaTransactionId");


--
-- Name: payments_orderId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "payments_orderId_idx" ON public.payments USING btree ("orderId");


--
-- Name: payments_orderId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "payments_orderId_key" ON public.payments USING btree ("orderId");


--
-- Name: payments_paystackReference_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "payments_paystackReference_idx" ON public.payments USING btree ("paystackReference");


--
-- Name: payments_paystackReference_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "payments_paystackReference_key" ON public.payments USING btree ("paystackReference");


--
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status);


--
-- Name: product_bundle_items_bundleId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "product_bundle_items_bundleId_idx" ON public.product_bundle_items USING btree ("bundleId");


--
-- Name: product_bundle_items_bundleId_productId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "product_bundle_items_bundleId_productId_key" ON public.product_bundle_items USING btree ("bundleId", "productId");


--
-- Name: product_bundle_items_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "product_bundle_items_productId_idx" ON public.product_bundle_items USING btree ("productId");


--
-- Name: product_bundles_isActive_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "product_bundles_isActive_idx" ON public.product_bundles USING btree ("isActive");


--
-- Name: product_colors_isActive_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "product_colors_isActive_idx" ON public.product_colors USING btree ("isActive");


--
-- Name: product_colors_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "product_colors_productId_idx" ON public.product_colors USING btree ("productId");


--
-- Name: product_images_isPrimary_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "product_images_isPrimary_idx" ON public.product_images USING btree ("isPrimary");


--
-- Name: product_images_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "product_images_productId_idx" ON public.product_images USING btree ("productId");


--
-- Name: product_specifications_isActive_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "product_specifications_isActive_idx" ON public.product_specifications USING btree ("isActive");


--
-- Name: product_specifications_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "product_specifications_productId_idx" ON public.product_specifications USING btree ("productId");


--
-- Name: product_specifications_type_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX product_specifications_type_idx ON public.product_specifications USING btree (type);


--
-- Name: products_brand_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX products_brand_idx ON public.products USING btree (brand);


--
-- Name: products_categoryId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "products_categoryId_idx" ON public.products USING btree ("categoryId");


--
-- Name: products_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "products_createdAt_idx" ON public.products USING btree ("createdAt");


--
-- Name: products_isActive_isFeatured_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "products_isActive_isFeatured_idx" ON public.products USING btree ("isActive", "isFeatured");


--
-- Name: products_sku_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX products_sku_idx ON public.products USING btree (sku);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: products_slug_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX products_slug_idx ON public.products USING btree (slug);


--
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- Name: recently_viewed_sessionId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "recently_viewed_sessionId_idx" ON public.recently_viewed USING btree ("sessionId");


--
-- Name: recently_viewed_sessionId_productId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "recently_viewed_sessionId_productId_key" ON public.recently_viewed USING btree ("sessionId", "productId");


--
-- Name: recently_viewed_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "recently_viewed_userId_idx" ON public.recently_viewed USING btree ("userId");


--
-- Name: recently_viewed_userId_productId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "recently_viewed_userId_productId_key" ON public.recently_viewed USING btree ("userId", "productId");


--
-- Name: recently_viewed_viewedAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "recently_viewed_viewedAt_idx" ON public.recently_viewed USING btree ("viewedAt");


--
-- Name: reviews_isApproved_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "reviews_isApproved_idx" ON public.reviews USING btree ("isApproved");


--
-- Name: reviews_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "reviews_productId_idx" ON public.reviews USING btree ("productId");


--
-- Name: reviews_rating_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX reviews_rating_idx ON public.reviews USING btree (rating);


--
-- Name: reviews_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "reviews_userId_idx" ON public.reviews USING btree ("userId");


--
-- Name: saved_cart_items_sessionId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "saved_cart_items_sessionId_idx" ON public.saved_cart_items USING btree ("sessionId");


--
-- Name: saved_cart_items_sessionId_productId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "saved_cart_items_sessionId_productId_key" ON public.saved_cart_items USING btree ("sessionId", "productId");


--
-- Name: saved_cart_items_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "saved_cart_items_userId_idx" ON public.saved_cart_items USING btree ("userId");


--
-- Name: saved_cart_items_userId_productId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "saved_cart_items_userId_productId_key" ON public.saved_cart_items USING btree ("userId", "productId");


--
-- Name: saved_searches_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "saved_searches_userId_idx" ON public.saved_searches USING btree ("userId");


--
-- Name: settings_category_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX settings_category_idx ON public.settings USING btree (category);


--
-- Name: settings_key_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX settings_key_idx ON public.settings USING btree (key);


--
-- Name: settings_key_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX settings_key_key ON public.settings USING btree (key);


--
-- Name: stock_notifications_notified_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX stock_notifications_notified_idx ON public.stock_notifications USING btree (notified);


--
-- Name: stock_notifications_productId_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "stock_notifications_productId_email_key" ON public.stock_notifications USING btree ("productId", email);


--
-- Name: stock_notifications_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "stock_notifications_productId_idx" ON public.stock_notifications USING btree ("productId");


--
-- Name: stock_notifications_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "stock_notifications_userId_idx" ON public.stock_notifications USING btree ("userId");


--
-- Name: wishlist_shares_shareToken_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "wishlist_shares_shareToken_idx" ON public.wishlist_shares USING btree ("shareToken");


--
-- Name: wishlist_shares_shareToken_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "wishlist_shares_shareToken_key" ON public.wishlist_shares USING btree ("shareToken");


--
-- Name: categories categories_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notifications notifications_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_items order_items_colorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES public.product_colors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_specId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_specId_fkey" FOREIGN KEY ("specId") REFERENCES public.product_specifications(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_bundle_items product_bundle_items_bundleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_bundle_items
    ADD CONSTRAINT "product_bundle_items_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES public.product_bundles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_bundle_items product_bundle_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_bundle_items
    ADD CONSTRAINT "product_bundle_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_colors product_colors_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_colors
    ADD CONSTRAINT "product_colors_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_images product_images_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_specifications product_specifications_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_specifications
    ADD CONSTRAINT "product_specifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: recently_viewed recently_viewed_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recently_viewed
    ADD CONSTRAINT "recently_viewed_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: saved_cart_items saved_cart_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.saved_cart_items
    ADD CONSTRAINT "saved_cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_notifications stock_notifications_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_notifications
    ADD CONSTRAINT "stock_notifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict 7iLohWa8tDg3XCgnBmHQPUKjnlihnhAdcBxgB9AykThoe884Wz0U6IdwNtnqbPj

