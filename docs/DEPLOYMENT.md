# Netlify Deployment Guide

## 🚀 Deploying VCET AI Chatbot to Netlify

This guide provides step-by-step instructions for deploying the VCET AI Chatbot to Netlify.

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **Groq API Key**: Get your API key from [console.groq.com](https://console.groq.com)
3. **Git Repository**: Code pushed to GitHub/GitLab/Bitbucket
4. **Node.js**: Version 18+ installed locally

## Quick Start

### Option 1: Deploy via Netlify UI (Recommended)

1. **Connect Repository**
   - Log in to Netlify
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider (GitHub, GitLab, or Bitbucket)
   - Select the VCET_V6 repository

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: public
   Functions directory: netlify/functions
   ```

3. **Add Environment Variables**
   - Go to "Site settings" → "Environment variables"
   - Add the following:
     ```
     GROQ_API_KEY=your_groq_api_key_here
     LLM_MODEL=llama-3.3-70b-versatile
     EMBEDDING_MODEL=BAAI/bge-base-en-v1.5
     ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Your site will be live at `https://[site-name].netlify.app`

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```

4. **Set Environment Variables**
   ```bash
   netlify env:set GROQ_API_KEY "your_groq_api_key_here"
   netlify env:set LLM_MODEL "llama-3.3-70b-versatile"
   netlify env:set EMBEDDING_MODEL "BAAI/bge-base-en-v1.5"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Environment Variables

Required environment variables for production:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `GROQ_API_KEY` | Groq API Key (required) | `gsk_...` |
| `LLM_MODEL` | LLM model to use | `llama-3.3-70b-versatile` |
| `EMBEDDING_MODEL` | Embedding model | `BAAI/bge-base-en-v1.5` |
| `NODE_VERSION` | Node.js version | `18` |

## Build Process

The build process consists of:

1. **Template Conversion**
   - Converts Flask templates to static HTML
   - Replaces Jinja2 template tags with static content

2. **Asset Copying**
   - Copies CSS files from `static/css/` to `public/css/`
   - Copies JS files from `static/js/` to `public/js/`
   - Copies images from `static/images/` to `public/images/`

3. **Metadata Generation**
   - Creates `robots.txt`
   - Generates `manifest.json` for PWA
   - Creates `sitemap.xml`

To build locally:
```bash
npm install
npm run build
```

## Netlify Functions

The application uses serverless functions located in `netlify/functions/`:

### 1. Query Function
- **Endpoint**: `/.netlify/functions/query`
- **Method**: POST
- **Purpose**: Process user queries using Groq API
- **Request**:
  ```json
  {
    "query": "Tell me about VCET"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "response": "VCET is...",
    "cached": false,
    "response_time": 1.2
  }
  ```

### 2. Health Check Function
- **Endpoint**: `/.netlify/functions/health`
- **Method**: GET
- **Purpose**: System health monitoring
- **Response**:
  ```json
  {
    "status": "healthy",
    "rag_initialized": true,
    "timestamp": "2026-02-03T..."
  }
  ```

### 3. Stats Function
- **Endpoint**: `/.netlify/functions/stats`
- **Method**: GET
- **Purpose**: Return system statistics
- **Response**:
  ```json
  {
    "status": "success",
    "stats": {
      "total_queries": 42,
      "cache_hit_rate": 35,
      ...
    }
  }
  ```

### 4. Suggestions Function
- **Endpoint**: `/.netlify/functions/suggestions`
- **Method**: GET
- **Purpose**: Get suggested questions
- **Response**:
  ```json
  {
    "status": "success",
    "suggestions": ["Question 1", "Question 2", ...]
  }
  ```

## Custom Domain Setup

1. **Add Custom Domain**
   - Go to "Domain settings" in Netlify
   - Click "Add custom domain"
   - Enter your domain (e.g., `vcet-ai.example.com`)

2. **Configure DNS**
   - Add CNAME record pointing to your Netlify subdomain
   - Or use Netlify's nameservers for full DNS management

3. **Enable HTTPS**
   - Netlify automatically provisions Let's Encrypt SSL
   - Enable "Force HTTPS" in domain settings

## Performance Optimization

### 1. Enable Asset Optimization
In `netlify.toml`, the following optimizations are configured:
- CSS minification
- JS bundling
- Image compression
- Brotli compression

### 2. Configure Caching
```toml
[[headers]]
  for = "/css/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/js/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 3. Enable Split Testing (Optional)
Use Netlify's branch deploys for A/B testing different features.

## Monitoring & Analytics

### 1. Netlify Analytics
- Enable in site settings
- Track page views, bandwidth usage
- Monitor function invocations

### 2. Function Logs
View function execution logs:
```bash
netlify functions:list
netlify functions:log query
```

### 3. Error Tracking
- Check Deploy logs for build errors
- Monitor Function logs for runtime errors
- Set up notifications for failed deploys

## Troubleshooting

### Build Fails

**Problem**: Build command fails
```bash
Error: Unable to find template
```

**Solution**: Ensure `templates/index.html` exists and build script has correct paths

### Functions Not Working

**Problem**: 404 on function endpoints

**Solution**:
1. Check `netlify.toml` has correct functions directory
2. Verify functions are in `netlify/functions/`
3. Check function logs for errors

### CORS Issues

**Problem**: CORS errors in browser console

**Solution**: Functions include CORS headers. Check that OPTIONS requests are handled.

### Rate Limiting

**Problem**: 429 errors from Groq API

**Solution**:
1. Users can add their own API key in settings
2. Implement request throttling
3. Use caching to reduce API calls

## Security Best Practices

1. **Environment Variables**
   - Never commit API keys to Git
   - Use Netlify environment variables
   - Rotate keys periodically

2. **HTTPS Only**
   - Force HTTPS in Netlify settings
   - Use secure cookies if implementing auth

3. **Rate Limiting**
   - Implement client-side throttling
   - Monitor function invocations
   - Set usage alerts

4. **Content Security**
   - CSP headers configured in `netlify.toml`
   - XSS protection enabled
   - Frame options set

## Continuous Deployment

Netlify automatically deploys on Git push:

1. **Production Deploys**
   - Push to `main` branch
   - Automatic build and deploy
   - Instant cache invalidation

2. **Preview Deploys**
   - Open a Pull Request
   - Netlify creates preview URL
   - Test before merging

3. **Branch Deploys**
   - Configure branch patterns
   - Deploy specific branches
   - Use for staging environments

## Rollback Procedure

If deployment fails:

1. **Via Netlify UI**
   - Go to "Deploys" tab
   - Find working deploy
   - Click "Publish deploy"

2. **Via CLI**
   ```bash
   netlify rollback
   ```

## Cost Optimization

### Free Tier Limits
- 100GB bandwidth/month
- 125k function requests/month
- 100 build minutes/month

### Tips to Stay Within Limits
1. Enable caching for static assets
2. Use query caching in functions
3. Optimize images and bundles
4. Use CDN for large assets

## Support & Resources

- **Netlify Documentation**: https://docs.netlify.com
- **Netlify Community**: https://answers.netlify.com
- **Groq Documentation**: https://console.groq.com/docs
- **Project Repository**: [Your GitHub URL]

## Checklist

Before deploying:

- [ ] Environment variables configured
- [ ] Build script tested locally
- [ ] All Netlify functions created
- [ ] `netlify.toml` reviewed
- [ ] Custom domain ready (if applicable)
- [ ] HTTPS force enabled
- [ ] Analytics configured
- [ ] Error monitoring set up
- [ ] Rate limiting implemented
- [ ] Cache strategies configured

## Next Steps After Deployment

1. Test all functionality on live site
2. Configure custom domain
3. Set up monitoring and alerts
4. Test mobile responsiveness
5. Check performance metrics
6. Enable analytics
7. Set up error tracking
8. Create backup strategy

---

**Last Updated**: 2026-02-03  
**Deployment Platform**: Netlify  
**Node Version**: 18+  
**Build Command**: `npm run build`  
**Publish Directory**: `public`
