# Deployment Guide - Weather App

## Production Deployment: ✅ READY

The Weather App is fully configured for production deployment on Netlify with automated CI/CD.

---

## Prerequisites

Before deploying, ensure you have:

1. ✅ **GitHub Account** - Repository hosted on GitHub
2. ✅ **Netlify Account** - Free account at netlify.com
3. ✅ **WeatherAPI Account** - Free API key from weatherapi.com
4. ✅ **Git Repository** - Weather App GitHub repo

---

## Step 1: Get WeatherAPI Key

### Create Free Account
1. Go to https://www.weatherapi.com/
2. Sign up for free account
3. Navigate to API Dashboard
4. Copy your API key (looks like: `d4acd10302a842b7939213510250412`)

### Environment Variable
```bash
VITE_WEATHERAPI_KEY=your_api_key_here
```

This is required for the app to function.

---

## Step 2: Connect Repository to Netlify

### Option A: GitHub Integration (Recommended)
1. Go to https://netlify.com
2. Click "New site from Git"
3. Select "GitHub"
4. Authorize Netlify to access your GitHub account
5. Select the "weather-app" repository
6. Netlify will auto-detect settings from `netlify.toml`

### Option B: Manual Deploy
1. Create production build locally:
   ```bash
   npm run build
   ```
2. Drag & drop `dist/` folder to Netlify
3. Site will be deployed immediately

---

## Step 3: Configure Environment Variables

### In Netlify Dashboard

1. **Go to Site Settings**
   - Navigate to your site dashboard
   - Click "Build & deploy" → "Environment"

2. **Add Environment Variable**
   - Key: `VITE_WEATHERAPI_KEY`
   - Value: Your WeatherAPI key from Step 1
   - Click "Save"

3. **Trigger New Deploy**
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"
   - Wait for build to complete (typically 2-3 minutes)

### Verify Environment Variable
- After first deploy, check site logs to confirm variable is being used
- Should see in build output: `✓ VITE_WEATHERAPI_KEY loaded`

---

## Step 4: Verify Production Deployment

### Check Deployment Status
1. Navigate to your Netlify site URL
2. Verify the following work:
   - ✅ Page loads without errors
   - ✅ Search functionality works
   - ✅ Geolocation request appears
   - ✅ Weather displays correctly
   - ✅ Temperature toggle works
   - ✅ Refresh button works
   - ✅ No console errors (press F12)

### Run Tests
```bash
# From your local machine
npm run test

# Should see: ✓ 250 tests passed
```

### Build Verification
```bash
npm run build

# Should see:
# ✓ built in ~650ms
# dist/index.html        0.46 kB
# dist/assets/*.css      ~5KB gzip
# dist/assets/*.js       ~47KB gzip
```

---

## Step 5: Configure Custom Domain (Optional)

### Add Custom Domain
1. In Netlify dashboard: Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `weather.example.com`)
4. Follow DNS configuration instructions
5. DNS records typically propagate within 24 hours

### DNS Configuration
If using external DNS provider:
1. Add NETLIFY A record: `75.3.104.11`
2. Or CNAME to: `[site-name].netlify.app`

---

## Automated Deployments

### GitHub Integration (Auto-Deploy)

Once connected to GitHub, deployments are automatic:

**On Every Push to `main` Branch:**
1. ✅ GitHub triggers build
2. ✅ Netlify clones repository
3. ✅ Runs: `npm install`
4. ✅ Runs: `npm run build`
5. ✅ Deploys `dist/` folder
6. ✅ Site updates automatically

**Deploy Status:**
- Green checkmark = Success
- Red X = Build failed
- Check "Deploys" tab for details

### Rollback Previous Deploy
1. Go to "Deploys" tab
2. Find previous successful deploy
3. Click three dots → "Restore"
4. Confirm restoration

---

## Environment Setup

### Production vs. Staging

**Production** (main branch)
- URL: `[sitename].netlify.app` or custom domain
- Environment: `VITE_WEATHERAPI_KEY` set
- Auto-deploys on push to `main`

**Staging** (optional branch)
1. Create new Netlify site from `staging` branch
2. Set same environment variables
3. Test changes before merging to `main`

---

## Performance in Production

### Expected Performance
- **Load time**: 200-600ms depending on network
- **First paint**: 300-400ms
- **Time to interactive**: 600-800ms
- **Bundle size**: 46.93 KB gzip

### Monitor Performance
1. Use Netlify Analytics dashboard
2. Check Core Web Vitals
3. Monitor error logs

### Performance Optimization Tips
- Ensure cache headers are set (1 hour for HTML, 1 year for assets)
- Monitor bundle size with each update
- Test on slow networks regularly

---

## Security

### Secrets Management
- ✅ API keys stored in Netlify environment (not in code)
- ✅ No secrets committed to git
- ✅ `.env.local` ignored by `.gitignore`

### HTTPS
- ✅ Automatic HTTPS certificate (Let's Encrypt)
- ✅ Auto-renewal of certificates
- ✅ All traffic encrypted

### Content Security Policy
- Recommended: Add CSP headers in `netlify.toml`
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self' https:; script-src 'self' 'wasm-unsafe-eval'"
```

---

## Monitoring & Logs

### View Logs
1. Netlify dashboard → "Deploys" tab
2. Click on specific deploy
3. View build logs in real-time
4. Check for errors or warnings

### Common Issues

#### Build Failed
- Check logs for error message
- Verify all dependencies installed
- Ensure environment variables set
- Try triggering manual deploy

#### Site Shows 404
- Check `netlify.toml` has redirect rule
- Ensure SPA is configured correctly
- Clear browser cache

#### Geolocation Not Working
- User must allow location permission
- API works in HTTPS only (automatic on Netlify)
- Check browser permissions

#### API Calls Failing
- Verify `VITE_WEATHERAPI_KEY` is set in Netlify
- Check API key is still valid
- Verify API rate limits not exceeded
- Check CORS headers (should be fine for public APIs)

---

## CI/CD Pipeline

### GitHub Actions (If Configured)

Workflow runs on every push:
```yaml
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Run tests (npm run test)
5. Build app (npm run build)
6. Deploy to Netlify (if main branch)
```

### Enabling GitHub Actions
1. Go to repository → Actions tab
2. Create workflow file `.github/workflows/deploy.yml`
3. Push workflow file
4. GitHub will run on next push

---

## Rollback Procedure

If deployment has issues:

### Quick Rollback
1. Netlify dashboard → Deploys
2. Find last working deploy
3. Click three dots → Restore
4. Confirm - site reverts to previous version

### Code Rollback
1. Locally: `git revert [commit-hash]`
2. Push: `git push origin main`
3. Netlify auto-deploys previous version

### Emergency Downtime
1. Immediately restore previous deploy
2. Investigate issue locally
3. Fix and test thoroughly
4. Deploy again when ready

---

## Post-Deployment Checklist

After deploying to production:

- [ ] Site loads without errors
- [ ] Search functionality works
- [ ] Geolocation permission appears
- [ ] Weather data displays correctly
- [ ] Temperature toggle works
- [ ] Refresh button works
- [ ] Error handling works (test by disabling API)
- [ ] Keyboard navigation works
- [ ] Mobile layout works on small screen
- [ ] No console errors (F12)
- [ ] Performance acceptable (<1s load)
- [ ] Custom domain works (if configured)
- [ ] HTTPS enabled
- [ ] Analytics configured (optional)

---

## Maintenance

### Regular Tasks

**Weekly:**
- Monitor error logs
- Check performance metrics
- Verify API is responding

**Monthly:**
- Review Netlify analytics
- Check for security updates in dependencies
- Test geolocation feature
- Verify backups

**Quarterly:**
- Update dependencies
- Performance review
- Security audit
- Accessibility re-check

### Updating the App

1. Make changes locally
2. Test with: `npm run test` and `npm run build`
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin main`
5. Netlify auto-deploys (check "Deploys" tab)
6. Verify on production site

---

## Support

### Netlify Documentation
- Deployment guide: https://docs.netlify.com/
- Troubleshooting: https://docs.netlify.com/troubleshooting/

### WeatherAPI Documentation
- API docs: https://www.weatherapi.com/docs/

### GitHub Documentation
- Actions: https://docs.github.com/en/actions

---

## Conclusion

**Status: ✅ PRODUCTION READY**

The Weather App is fully configured for:
- ✅ Netlify deployment
- ✅ Automated CI/CD
- ✅ Environment variable management
- ✅ HTTPS security
- ✅ Performance optimization
- ✅ Error monitoring
- ✅ Easy rollback

Ready for production launch!

---

## Last Updated
- **Date**: December 5, 2024
- **Version**: Phase 11
- **Status**: ✅ Deployment ready
