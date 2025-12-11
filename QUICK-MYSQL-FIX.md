# 🔧 QUICK MySQL Connection Fix

## ❌ Current Error

```
Authentication failed against database server, 
the provided database credentials for `root` are not valid.
```

## 🎯 **FASTEST FIX - Try These In Order**

### **Option 1: No Password (Most Common on Mac)**

```bash
# Test if root has no password
mysql -u root

# If that works, use this in .env.local:
DATABASE_URL="mysql://root@localhost:3306/mombasa_shisha_bongs"
```

### **Option 2: Empty String Password**

```bash
# Test with empty password
mysql -u root -p
# Press Enter when prompted for password

# If that works, use this in .env.local:
DATABASE_URL="mysql://root:@localhost:3306/mombasa_shisha_bongs"
```

### **Option 3: Common Default Passwords**

Try these passwords one by one:

```bash
# Try: root
mysql -u root -proot

# Try: password  
mysql -u root -ppassword

# Try: admin
mysql -u root -padmin
```

If one works, update `.env.local`:
```env
DATABASE_URL="mysql://root:THE_PASSWORD_THAT_WORKED@localhost:3306/mombasa_shisha_bongs"
```

---

## 🚀 **STEP-BY-STEP SOLUTION**

### Step 1: Find Your MySQL Root Password

```bash
# Try connecting without password
mysql -u root

# If that doesn't work, try with prompt
mysql -u root -p
# Then try different passwords
```

### Step 2: Create Database

Once you're connected to MySQL:

```sql
-- Create the database
CREATE DATABASE IF NOT EXISTS mombasa_shisha_bongs 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Verify it was created
SHOW DATABASES;

-- Exit
EXIT;
```

### Step 3: Update .env.local

Based on what worked above, update your connection string:

```bash
# If no password worked:
DATABASE_URL="mysql://root@localhost:3306/mombasa_shisha_bongs"

# If a password worked (replace YOUR_PASSWORD):
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/mombasa_shisha_bongs"
```

### Step 4: Run Migrations

```bash
cd /Users/fahimrashid/mombasa-shisha-bongs

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database
npm run db:seed
```

### Step 5: Restart Server

The dev server should auto-reload, but if not:

```bash
# Visit the admin page
open http://localhost:3000/admin
```

---

## 🆘 **IF MYSQL WON'T CONNECT AT ALL**

### Check if MySQL is Running

```bash
# Check MySQL status
brew services list | grep mysql

# If not running, start it
brew services start mysql

# Or if installed differently
mysql.server start
```

### Reset MySQL Root Password (macOS)

```bash
# Stop MySQL
brew services stop mysql

# Start in safe mode
mysqld_safe --skip-grant-tables &

# Connect without password
mysql -u root

# Reset password
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
EXIT;

# Kill safe mode
pkill mysqld

# Start MySQL normally
brew services start mysql

# Test connection
mysql -u root -pnewpassword
```

---

## ✅ **SUCCESS CHECKLIST**

After fixing, you should be able to:

- [ ] Connect to MySQL: `mysql -u root -p`
- [ ] See your database: `SHOW DATABASES;`
- [ ] Run migrations: `npx prisma migrate dev`
- [ ] Seed data: `npm run db:seed`
- [ ] Visit http://localhost:3000/admin and see stats

---

## 📝 **WHAT I'LL DO NOW**

I'll run a diagnostic script to help you find the right connection string.

