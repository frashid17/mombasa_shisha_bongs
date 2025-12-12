# 🔧 Database Authentication Fix

## ❌ Current Error

```
Authentication failed against database server, 
the provided database credentials for `mombasa_user` are not valid.
```

## 🎯 Quick Fix Options

### **Option 1: Use Root User (Easiest for Development)**

Homebrew MySQL on macOS often has root with no password. Try this:

1. **Test root connection:**
```bash
mysql -u root
```

If that works (no password prompt), update your `.env.local`:

```env
DATABASE_URL="mysql://root@localhost:3306/mombasa_shisha_bongs"
```

2. **Create the database if it doesn't exist:**
```sql
mysql -u root

CREATE DATABASE IF NOT EXISTS mombasa_shisha_bongs 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

EXIT;
```

3. **Run Prisma migrations:**
```bash
npx prisma migrate dev --name init
```

---

### **Option 2: Create `mombasa_user` with Correct Credentials**

If you want to use a dedicated user:

1. **Connect to MySQL:**
```bash
mysql -u root
# Or if root has password:
mysql -u root -p
```

2. **Create user and database:**
```sql
-- Create database
CREATE DATABASE IF NOT EXISTS mombasa_shisha_bongs 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Create user with mysql_native_password (compatible with Prisma)
CREATE USER IF NOT EXISTS 'mombasa_user'@'localhost' 
  IDENTIFIED WITH mysql_native_password BY 'MombasaSecure2024!';

-- Grant privileges
GRANT ALL PRIVILEGES ON mombasa_shisha_bongs.* TO 'mombasa_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SELECT user, host, plugin FROM mysql.user WHERE user = 'mombasa_user';

EXIT;
```

3. **Update `.env.local`:**
```env
DATABASE_URL="mysql://mombasa_user:MombasaSecure2024!@localhost:3306/mombasa_shisha_bongs"
```

4. **Test connection:**
```bash
mysql -u mombasa_user -pMombasaSecure2024! mombasa_shisha_bongs
```

5. **Run Prisma migrations:**
```bash
npx prisma migrate dev --name init
```

---

### **Option 3: Fix Existing User Authentication**

If `mombasa_user` already exists but has wrong authentication:

```sql
mysql -u root

-- Change authentication method
ALTER USER 'mombasa_user'@'localhost' 
  IDENTIFIED WITH mysql_native_password BY 'MombasaSecure2024!';

FLUSH PRIVILEGES;

EXIT;
```

---

## 🚀 Step-by-Step Fix (Recommended)

### Step 1: Test MySQL Connection

```bash
# Try root with no password (most common on Homebrew)
mysql -u root

# If that doesn't work, try with password prompt
mysql -u root -p
```

### Step 2: Check Current Database Setup

```sql
-- Check if database exists
SHOW DATABASES LIKE 'mombasa_shisha_bongs';

-- Check if user exists
SELECT user, host, plugin FROM mysql.user WHERE user = 'mombasa_user';
```

### Step 3: Fix Based on Results

**If root works with no password:**
```env
DATABASE_URL="mysql://root@localhost:3306/mombasa_shisha_bongs"
```

**If you need to create mombasa_user:**
Follow Option 2 above.

### Step 4: Update `.env.local`

Make sure your `.env.local` has the correct `DATABASE_URL` matching your MySQL setup.

### Step 5: Test Prisma Connection

```bash
# Generate Prisma Client
npx prisma generate

# Test connection
npx prisma db pull

# Run migrations
npx prisma migrate dev --name init
```

---

## 🔍 Troubleshooting

### Check MySQL is Running

```bash
brew services list | grep mysql
```

If not running:
```bash
brew services start mysql
```

### Common Password Issues

1. **Homebrew MySQL**: Often no password for root
2. **Some installations**: Password might be `root` or empty string
3. **Secure installations**: You set it during install

### Test Different Credentials

```bash
# Try no password
mysql -u root

# Try empty password
mysql -u root -p
# (Press Enter when prompted)

# Try common passwords
mysql -u root -proot
mysql -u root -ppassword
```

---

## ✅ Verification

After fixing, verify the connection:

```bash
# Test with Prisma
npx prisma db pull

# Should show:
# ✔ Introspected X models
```

---

## 📝 Next Steps

Once the database connection is fixed:

1. Run migrations: `npx prisma migrate dev`
2. Seed database: `npm run db:seed` (if you have a seed script)
3. Test the application

