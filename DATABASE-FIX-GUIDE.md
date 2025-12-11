# 🔧 Database Connection Fix

## ❌ Current Error

```
Error: P1000: Authentication failed against database server,
the provided database credentials for `mombasa_user` are not valid.
```

## 🔍 Root Cause

The database credentials in `.env.local` don't match your MySQL setup.

## ✅ Quick Fix Options

### **Option 1: Use Root User** (Quickest)

If you know your MySQL root password:

```bash
# Test your MySQL connection first
mysql -u root -p

# If it works, update .env.local with the correct root password
```

Then update `.env.local`:
```env
DATABASE_URL="mysql://root:YOUR_ACTUAL_ROOT_PASSWORD@localhost:3306/mombasa_shisha_bongs"
```

---

### **Option 2: Create New Database User** (Recommended for Production)

Run these MySQL commands:

```bash
# Connect to MySQL
mysql -u root -p

# Then run these SQL commands:
CREATE DATABASE IF NOT EXISTS mombasa_shisha_bongs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'mombasa_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'MombasaSecure2024!';

GRANT ALL PRIVILEGES ON mombasa_shisha_bongs.* TO 'mombasa_user'@'localhost';

FLUSH PRIVILEGES;

-- Verify user was created
SELECT user, host, plugin FROM mysql.user WHERE user = 'mombasa_user';

EXIT;
```

Then update `.env.local`:
```env
DATABASE_URL="mysql://mombasa_user:MombasaSecure2024!@localhost:3306/mombasa_shisha_bongs"
```

---

### **Option 3: Reset Root Password** (If you forgot it)

#### macOS with Homebrew:

```bash
# Stop MySQL
brew services stop mysql

# Start in safe mode
mysqld_safe --skip-grant-tables &

# Connect without password
mysql -u root

# Reset password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password_here';
FLUSH PRIVILEGES;
EXIT;

# Kill safe mode
pkill mysqld

# Start MySQL normally
brew services start mysql
```

---

## 🚀 Step-by-Step Fix (Recommended)

### Step 1: Test MySQL Connection

```bash
# Try to connect to MySQL
mysql -u root -p

# If successful, you'll see:
# mysql>

# Check databases
SHOW DATABASES;

# Exit
EXIT;
```

### Step 2: Create Database and User

If MySQL connection works, run:

```sql
mysql -u root -p

-- Create database
CREATE DATABASE IF NOT EXISTS mombasa_shisha_bongs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with strong password
CREATE USER IF NOT EXISTS 'mombasa_user'@'localhost' 
IDENTIFIED WITH mysql_native_password BY 'MombasaSecure2024!';

-- Grant privileges
GRANT ALL PRIVILEGES ON mombasa_shisha_bongs.* TO 'mombasa_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify
USE mombasa_shisha_bongs;
SHOW TABLES;

EXIT;
```

### Step 3: Update .env.local

Replace the DATABASE_URL line:

```env
DATABASE_URL="mysql://mombasa_user:MombasaSecure2024!@localhost:3306/mombasa_shisha_bongs"
```

### Step 4: Test Connection

```bash
cd /Users/fahimrashid/mombasa-shisha-bongs

# Test Prisma can connect
npx prisma db pull

# Should show:
# ✔ Introspected X models
```

### Step 5: Run Migrations

```bash
# Run migrations
npx prisma migrate dev --name init

# Should create tables successfully
```

### Step 6: Seed Database

```bash
# Seed with sample data
npm run db:seed

# Should show:
# 🌱 Starting database seed...
# ✅ Categories created
# ✅ Products created
# ... etc.
# 🎉 Database seed completed successfully!
```

---

## 🔍 Troubleshooting

### Check if MySQL is Running

```bash
# macOS
brew services list | grep mysql

# Should show:
# mysql started
```

If not running:
```bash
brew services start mysql
```

### Check MySQL Version

```bash
mysql --version

# Should be MySQL 8.0 or higher
```

### Test Connection with CLI

```bash
# Try different credentials
mysql -u root -p                    # Try root
mysql -u mombasa_user -p            # Try mombasa_user
mysql --host=127.0.0.1 -u root -p   # Try with explicit host
```

### Common Password Issues

1. **Default Homebrew MySQL**: No password (press Enter)
2. **Some installations**: Password is `root`
3. **Secure installations**: You set it during install

### Find MySQL Socket

```bash
# Find where MySQL is running
ps aux | grep mysql

# Find socket file
ls -la /tmp/mysql.sock
ls -la /var/run/mysqld/mysqld.sock
```

---

## 📝 My Recommendation

Since you're in development, use the **simplest approach**:

### **Use Root User Temporarily**

1. **Find your root password**:
   - Try: no password (just press Enter)
   - Try: `root`
   - Try: `password`

2. **Test connection**:
   ```bash
   mysql -u root -p
   # Enter password
   ```

3. **Once connected, create database**:
   ```sql
   CREATE DATABASE mombasa_shisha_bongs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   SHOW DATABASES;
   EXIT;
   ```

4. **Update .env.local**:
   ```env
   # Replace with YOUR actual root password
   DATABASE_URL="mysql://root:YOUR_ROOT_PASSWORD@localhost:3306/mombasa_shisha_bongs"
   ```

5. **Run migrations**:
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

---

## ✅ Success Indicators

After fixing, you should see:

```bash
✔ Your database is now in sync with your schema.
✔ Generated Prisma Client

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

---

## 🆘 Still Having Issues?

If you're still stuck, provide:

1. Output of: `mysql --version`
2. Output of: `brew services list | grep mysql`
3. Can you connect with: `mysql -u root -p` ?
4. What password are you using?

Then I can give you specific instructions!

---

## 🎯 Once Fixed

After the database is set up:

1. ✅ Migrations will create all 10 tables
2. ✅ Seed will add sample data
3. ✅ Admin dashboard will show real statistics
4. ✅ You can continue to Products Management

**Let me know once it's working, then type "NEXT" to continue!**

