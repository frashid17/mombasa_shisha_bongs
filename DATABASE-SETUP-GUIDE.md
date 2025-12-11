# 🔧 Database Setup Guide - MySQL Configuration

## ❌ Error You're Encountering

```
Error querying the database: Unknown authentication plugin `sha256_password'.
```

## 🔍 Root Cause

MySQL 8.0+ uses `caching_sha2_password` as the default authentication plugin, but some MySQL clients (including older versions of Prisma's engine) don't support it yet.

## ✅ Solutions (Choose One)

### **Solution 1: Create Database with Correct Authentication** ⭐ RECOMMENDED

Run these MySQL commands:

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create the database
CREATE DATABASE mombasa_shisha_bongs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a user with mysql_native_password authentication
CREATE USER 'mombasa_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON mombasa_shisha_bongs.* TO 'mombasa_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify the user was created correctly
SELECT user, host, plugin FROM mysql.user WHERE user = 'mombasa_user';

EXIT;
```

Then update your `.env.local`:

```env
DATABASE_URL="mysql://mombasa_user:your_secure_password@localhost:3306/mombasa_shisha_bongs"
```

---

### **Solution 2: Alter Existing User Authentication**

If you already have a user:

```sql
-- Connect to MySQL
mysql -u root -p

-- Change the authentication plugin for existing user
ALTER USER 'your_username'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;

EXIT;
```

---

### **Solution 3: Alter Root User** (Not Recommended for Production)

```sql
-- Connect to MySQL
mysql -u root -p

-- Change root authentication (NOT recommended for production)
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_root_password';
FLUSH PRIVILEGES;

EXIT;
```

---

## 🚀 Complete Setup Steps

### Step 1: Fix MySQL Authentication

Choose one of the solutions above and execute the SQL commands.

### Step 2: Update Environment Variables

Update your `.env.local` file:

```env
# Replace with your actual credentials
DATABASE_URL="mysql://mombasa_user:your_secure_password@localhost:3306/mombasa_shisha_bongs"
```

### Step 3: Test Connection

```bash
cd /Users/fahimrashid/mombasa-shisha-bongs

# Test if Prisma can connect
npx prisma db pull
```

If successful, you should see:
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": MySQL database "mombasa_shisha_bongs" at "localhost:3306"
Introspecting based on datasource defined in prisma/schema.prisma
✔ Introspected 0 models and wrote them into prisma/schema.prisma in XXXms
```

### Step 4: Run Migrations

```bash
# Create and apply the initial migration
npx prisma migrate dev --name init
```

Expected output:
```
✔ Your database is now in sync with your schema.
✔ Generated Prisma Client
```

### Step 5: Seed Database

```bash
# Run the seed script
npm run db:seed
```

Expected output:
```
🌱 Starting database seed...
✅ Categories created
✅ Products created
✅ Product images created
✅ Order and order items created
✅ Payment record created
✅ Reviews created
✅ Settings created
🎉 Database seed completed successfully!
```

### Step 6: Verify in Prisma Studio

```bash
# Open Prisma Studio to view your data
npm run db:studio
```

This will open a GUI at `http://localhost:5555` where you can browse your database.

---

## 🔍 Troubleshooting

### Error: "Access denied for user"

**Problem**: Wrong credentials in DATABASE_URL

**Solution**: Double-check your username and password in `.env.local`

### Error: "Unknown database"

**Problem**: Database doesn't exist

**Solution**: Create the database first:
```sql
CREATE DATABASE mombasa_shisha_bongs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Can't connect to MySQL server"

**Problem**: MySQL is not running

**Solution**: Start MySQL:
```bash
# macOS with Homebrew
brew services start mysql

# Or check if it's running
brew services list
```

### Check MySQL Version

```bash
mysql --version
```

Should show MySQL 8.0 or higher.

### Check MySQL is Running

```bash
# macOS
brew services list | grep mysql

# Or try to connect
mysql -u root -p
```

---

## 📝 Quick Reference Commands

```bash
# Connect to MySQL
mysql -u root -p

# Show all databases
SHOW DATABASES;

# Use specific database
USE mombasa_shisha_bongs;

# Show all tables
SHOW TABLES;

# Show user authentication methods
SELECT user, host, plugin FROM mysql.user;

# Exit MySQL
EXIT;
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] MySQL is running
- [ ] Database `mombasa_shisha_bongs` exists
- [ ] User created with `mysql_native_password`
- [ ] `.env.local` updated with correct credentials
- [ ] `npx prisma db pull` succeeds
- [ ] `npx prisma migrate dev` succeeds
- [ ] `npm run db:seed` succeeds
- [ ] `npm run db:studio` opens successfully

---

## 🎯 Expected Final State

After completing all steps, you should have:

```
📊 Database: mombasa_shisha_bongs
👤 User: mombasa_user
🔐 Auth: mysql_native_password
📋 Tables: 10 (categories, products, orders, etc.)
📦 Sample Data: 4 categories, 4 products, 1 order
```

---

## 🆘 Still Having Issues?

If you're still encountering errors, provide:

1. Your MySQL version: `mysql --version`
2. Your OS: macOS/Linux/Windows
3. The exact error message
4. Output of: `SELECT user, host, plugin FROM mysql.user;`

---

## 🚀 Next Steps After Setup

Once your database is running and seeded:

1. Verify data in Prisma Studio
2. Test API endpoints (Step 4)
3. Implement authentication with Clerk (Step 5)
4. Build the frontend (Steps 6-7)

---

**Need to reset and start over?**

```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS mombasa_shisha_bongs; CREATE DATABASE mombasa_shisha_bongs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Reset Prisma migrations
npx prisma migrate reset

# Re-run migrations and seed
npx prisma migrate dev --name init
npm run db:seed
```

