# EnglishPro Test - Coolify Deployment Guide

## 🚀 Complete Deployment Steps for Ubuntu Coolify Server

### 1. **Prepare Your GitHub Repository**

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Prepare for Coolify deployment"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. **Set Up PostgreSQL Database in Coolify**

1. **In Coolify Dashboard:**
   - Click **+ New Resource** → **Database** → **PostgreSQL**
   - Name it: `englishpro-database`
   - Version: Select **PostgreSQL 16** (or latest)
   - Click **Deploy**
   
2. **Get Database Connection String:**
   - After deployment, go to database details
   - Copy the **Connection String** (looks like: `postgresql://postgres:password@postgres-uuid:5432/postgres`)
   - **Save this** - you'll need it for environment variables

### 3. **Deploy Your Application in Coolify**

1. **Create New Application:**
   - Click **+ New Resource** → **Application**
   - Select **Public Repository** or **Private Repository** (connect GitHub if needed)
   - Enter your GitHub repo URL
   - Branch: `main`

2. **Build Configuration:**
   - **Build Pack**: Select **Dockerfile** (since we have a Dockerfile)
   - **Base Directory**: Leave empty (root)
   - **Dockerfile Location**: `./Dockerfile`
   - **Port**: `5000`
   - **Health Check Path**: `/` (optional)

3. **Environment Variables** (CRITICAL - Add these in the Environment Variables tab):

   ```env
   # Database (use the connection string from Step 2)
   DATABASE_URL=postgresql://postgres:password@postgres-uuid:5432/postgres
   
   # Session Secret (generate a random string)
   SESSION_SECRET=your-super-secret-random-string-here-minimum-32-chars
   
   # Paystack Keys (get from https://dashboard.paystack.com)
   PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
   
   # Node Environment
   NODE_ENV=production
   PORT=5000
   ```

   **How to add environment variables in Coolify:**
   - Go to your application → **Environment Variables** tab
   - For each variable:
     - Click **+ Add**
     - Key: Variable name (e.g., `DATABASE_URL`)
     - Value: Variable value
     - Is Build Variable: Check this for `VITE_PAYSTACK_PUBLIC_KEY` only
     - Click **Save**

4. **Deploy:**
   - Click **Deploy** button
   - Monitor the build logs for any errors
   - Wait for deployment to complete (usually 2-5 minutes)

### 4. **Run Database Migration**

After the app is deployed, you need to push the database schema:

1. **In Coolify:**
   - Go to your application → **Terminal** (or **Execute Command**)
   
2. **Run migration command:**
   ```bash
   npm run db:push
   ```
   
   **Alternative if Terminal is not available:**
   - SSH into your Ubuntu server
   - Find the container: `docker ps | grep englishpro`
   - Execute command: `docker exec -it CONTAINER_ID npm run db:push`

### 5. **Configure Domain & SSL**

1. **In Coolify:**
   - Go to your application → **Domains** tab
   - Click **+ Add Domain**
   - Enter your domain: `englishpro.yourdomain.com`
   - Enable **Auto SSL** (Coolify will provision Let's Encrypt certificate)
   - Click **Save**

2. **Update DNS Records:**
   - Go to your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.)
   - Add an A record:
     - Type: `A`
     - Name: `englishpro` (or `@` for root domain)
     - Value: Your Ubuntu server IP address
     - TTL: 300 (or default)
   - Save and wait 5-10 minutes for DNS propagation

### 6. **Verify Deployment**

✅ **Check these:**
- Visit `https://englishpro.yourdomain.com` (or the Coolify-provided URL)
- Test registration and payment flow
- Check database connection by creating a test user
- Verify M-Pesa and card payments work

### 7. **Monitoring & Logs**

**View Application Logs:**
- Coolify Dashboard → Your App → **Logs** tab
- Real-time logs will show requests and errors

**View Database:**
- Coolify Dashboard → PostgreSQL Database → **Terminal**
- Connect: `psql $DATABASE_URL`
- View tables: `\dt`

### 8. **Automatic Deployments (CI/CD)**

Enable auto-deploy on git push:
1. Go to your app → **General** tab
2. Enable **Auto Deploy**
3. Select branch: `main`
4. Now every push to `main` will trigger automatic deployment

### 9. **Backup Database**

**Manual Backup:**
```bash
# In Coolify database terminal
pg_dump $DATABASE_URL > backup.sql
```

**Scheduled Backups:**
- Coolify → Database → **Backups** tab
- Configure automatic daily/weekly backups

---

## 🔧 Environment Variables Reference

| Variable | Description | Where to Get | Required |
|----------|-------------|--------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Coolify Database details | ✅ Yes |
| `SESSION_SECRET` | Secret for session encryption | Generate random string (32+ chars) | ✅ Yes |
| `PAYSTACK_SECRET_KEY` | Paystack secret API key | https://dashboard.paystack.com | ✅ Yes |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key | https://dashboard.paystack.com | ✅ Yes |
| `VITE_PAYSTACK_PUBLIC_KEY` | Same as above (for Vite build) | https://dashboard.paystack.com | ✅ Yes |
| `NODE_ENV` | Environment type | Set to `production` | ✅ Yes |
| `PORT` | Application port | Set to `5000` | ✅ Yes |

---

## 🐛 Troubleshooting

### Build Fails
- Check **Build Logs** in Coolify
- Ensure all required files are pushed to GitHub
- Verify Dockerfile is in root directory

### Database Connection Fails
- Verify `DATABASE_URL` format is correct
- Ensure database and app are in same Coolify project
- Check database is running in Coolify dashboard

### Payment Not Working
- Verify Paystack keys are correct
- Check if keys are for correct environment (test/live)
- Ensure `VITE_PAYSTACK_PUBLIC_KEY` is marked as **Build Variable**

### Port Issues
- Coolify automatically handles port mapping
- Ensure PORT=5000 in environment variables
- Check Dockerfile EXPOSE matches PORT

### Database Schema Missing
- Run `npm run db:push` in application terminal
- Check Drizzle schema files are included in deployment

---

## 📋 Quick Checklist

Before going live:
- [ ] Database deployed and connection string obtained
- [ ] All environment variables configured
- [ ] Database migration completed (`npm run db:push`)
- [ ] Domain configured with SSL
- [ ] DNS records updated
- [ ] Test registration and payment flow
- [ ] Monitor logs for errors
- [ ] Set up database backups

---

## 🔐 Security Notes

1. **Never commit `.env` files** to GitHub
2. **Use strong SESSION_SECRET** (minimum 32 random characters)
3. **Enable HTTPS** (Coolify does this automatically)
4. **Regularly update dependencies**: `npm update`
5. **Monitor application logs** for suspicious activity
6. **Set up database backups** regularly

---

## 📞 Support Resources

- **Coolify Docs**: https://coolify.io/docs
- **Paystack Docs**: https://paystack.com/docs
- **Application Issues**: Check GitHub repository issues
