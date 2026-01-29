# External Job Aggregator - Backend Implementation

## 🎉 Implementation Complete

The external job aggregator system has been successfully implemented! This system combines internal database jobs with external API jobs from Adzuna, JSearch (RapidAPI), and Remotive.

## 🚀 Quick Start

### 1. Install Dependencies (Already Done)
```bash
npm install
```

### 2. Configure Environment Variables

Update your `.env` file with the following new variables:

```env
# Redis Configuration (for job caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_TTL=900

# External Job APIs
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_API_KEY=your_adzuna_api_key
JSEARCH_API_KEY=your_jsearch_rapidapi_key
REMOTIVE_API_KEY=

# Feature Flags
ENABLE_EXTERNAL_JOBS=true
```

### 3. Install and Start Redis (Optional but Recommended)

**Windows:**
```bash
# Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases
# Or use Docker:
docker run -d -p 6379:6379 redis:latest
```

**Note:** Redis is optional. If Redis is not available, the system will work without caching (external API calls will be made on every request).

### 4. Get API Keys

- **Adzuna:** Sign up at https://developer.adzuna.com/
- **JSearch (RapidAPI):** Sign up at https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
- **Remotive:** No API key required (free public API)

### 5. Start the Server

```bash
npm run dev
```

## 📡 API Endpoints

### GET /api/v1/jobs

Fetch aggregated jobs from internal database and external APIs.

**Query Parameters:**
- `keyword` (optional): Search keyword for title and description
- `location` (optional): Filter by location
- `type` (optional): Filter by job type (`Full-time`, `Part-time`, `Contract`, `Internship`)
- `source` (optional): Filter by source (`internal`, `adzuna`, `jsearch`, `remotive`, `external`)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20, max: 100): Jobs per page

**Example Requests:**

```bash
# Get all jobs (page 1, 20 per page)
GET /api/v1/jobs

# Search for developer jobs
GET /api/v1/jobs?keyword=developer

# Search for remote jobs in New York
GET /api/v1/jobs?keyword=developer&location=New York

# Get only internal jobs
GET /api/v1/jobs?source=internal

# Get only external jobs
GET /api/v1/jobs?source=external

# Get jobs from specific provider
GET /api/v1/jobs?source=adzuna

# Paginated results
GET /api/v1/jobs?page=2&limit=50

# Combined filters
GET /api/v1/jobs?keyword=developer&location=remote&type=Full-time&page=1&limit=20
```

**Response Format:**

```json
{
  "statusCode": 200,
  "data": {
    "jobs": [
      {
        "id": "internal_65f8a9b2c1234567890abcde",
        "title": "Senior Full Stack Developer",
        "company": "Tech Corp",
        "location": "New York, NY",
        "type": "Full-time",
        "salary": "$120000",
        "description": "We are looking for...",
        "applyUrl": "/api/v1/jobs/apply/65f8a9b2c1234567890abcde",
        "source": "internal",
        "sourceLogo": "/company-logo.png",
        "postedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "adzuna_12345678",
        "title": "Frontend Developer",
        "company": "StartupXYZ",
        "location": "Remote",
        "type": "Full-time",
        "salary": "$80000 - $100000",
        "description": "Join our team...",
        "applyUrl": "/api/v1/jobs/redirect/adzuna_12345678",
        "source": "adzuna",
        "sourceLogo": "https://www.adzuna.com/favicon.ico",
        "postedAt": "2024-01-14T08:20:00.000Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "message": "Jobs fetched successfully"
}
```

### GET /api/v1/jobs/redirect/:jobId

Track click and redirect to external job application URL.

**Example:**
```bash
GET /api/v1/jobs/redirect/adzuna_12345678
```

**Response:** HTTP 302 redirect to the external job URL

**Click Tracking:** Logs the following data:
- Job ID
- Source (internal, adzuna, jsearch, remotive)
- IP address
- User agent
- Timestamp

## 🔒 Security Features

### Rate Limiting
- **Job Listing Endpoint:** 100 requests per 15 minutes per IP
- **Job Redirect Endpoint:** 50 requests per 15 minutes per IP
- **General API:** 200 requests per 15 minutes per IP

### Security Headers (Helmet)
- XSS Protection
- Content Security Policy
- HSTS (HTTP Strict Transport Security)
- Frame Options
- And more...

### Input Validation
- All query parameters are validated using Joi
- Sanitization prevents injection attacks
- Type checking and range validation

## 💾 Caching Strategy

### Redis Caching
- **Cache Key Format:** `jobs:{keyword}:{location}:{type}:{source}:{page}:{limit}`
- **TTL:** 15 minutes (900 seconds)
- **Graceful Degradation:** If Redis is unavailable, the system works without caching

### Cache Behavior
- **First Request:** Cache miss → Fetch from all sources → Store in cache
- **Subsequent Requests:** Cache hit → Return cached data (faster response)
- **After 15 Minutes:** Cache expires → Fresh data fetched on next request

## 📊 Database Schema

### JobClick Collection

Tracks clicks on job application links for analytics.

```javascript
{
  jobId: String,        // Job identifier (e.g., "adzuna_12345")
  source: String,       // "internal" | "adzuna" | "jsearch" | "remotive"
  timestamp: Date,      // Click timestamp
  ip: String,          // User IP address
  userAgent: String    // Browser user agent
}
```

**Indexes:**
- `jobId` + `timestamp` (for job-specific analytics)
- `source` + `timestamp` (for source-specific analytics)

## 🔧 Troubleshooting

### Redis Connection Issues

If you see: `⚠️ Redis connection failed. Caching will be disabled.`

**Solution:**
1. Make sure Redis is installed and running
2. Check `REDIS_HOST` and `REDIS_PORT` in `.env`
3. Test connection: `redis-cli ping` (should return `PONG`)

### External API Errors

If external jobs are not appearing:

1. **Check API Keys:** Verify keys in `.env` are correct
2. **Check Feature Flag:** Ensure `ENABLE_EXTERNAL_JOBS=true`
3. **Check API Quotas:** You may have exceeded rate limits
4. **Check Logs:** Look for error messages in console

### Disable External Jobs

To temporarily disable external jobs:

```env
ENABLE_EXTERNAL_JOBS=false
```

The system will fall back to internal jobs only.

## 📈 Performance Optimization

### Current Optimizations
- ✅ Redis caching (15-minute TTL)
- ✅ Parallel API calls using `Promise.allSettled`
- ✅ Database indexes on job status and timestamps
- ✅ Rate limiting to prevent abuse
- ✅ Graceful error handling (failed APIs don't break the system)

### Recommended for Production
- Use Redis Cluster for high availability
- Implement cursor-based pagination for large datasets
- Add CDN for static assets (logos, images)
- Monitor API quota usage
- Set up logging and monitoring (e.g., Winston, Datadog)

## 🧪 Testing

### Manual Testing

```bash
# Test internal jobs only
curl "http://localhost:8000/api/v1/jobs?source=internal"

# Test external jobs
curl "http://localhost:8000/api/v1/jobs?source=external"

# Test pagination
curl "http://localhost:8000/api/v1/jobs?page=1&limit=5"

# Test filters
curl "http://localhost:8000/api/v1/jobs?keyword=developer&location=remote"

# Test redirect tracking
curl -L "http://localhost:8000/api/v1/jobs/redirect/remotive_12345"
```

### Check Redis Cache

```bash
# Connect to Redis CLI
redis-cli

# View all cache keys
KEYS jobs:*

# View specific cache entry
GET "jobs:developer:remote::external:1:20"

# Check TTL
TTL "jobs:developer:remote::external:1:20"
```

## 🎯 Next Steps

### Backend (Complete ✅)
- ✅ Provider services for Adzuna, JSearch, Remotive
- ✅ Job aggregator service
- ✅ Redis caching
- ✅ Pagination and filtering
- ✅ Click tracking
- ✅ Security (rate limiting, Helmet, validation)

### Frontend (To Do)
- [ ] Update job listing component to display source badges
- [ ] Add pagination controls
- [ ] Add filter UI (keyword, location, type, source)
- [ ] Update apply button to use redirect route
- [ ] Add loading states

## 📝 Notes

### Backward Compatibility
- ✅ All existing features remain intact
- ✅ Existing `/api/v1/jobs` endpoint enhanced (not replaced)
- ✅ Old query parameters still work (`search`, `location`, `jobType`)
- ✅ Response format includes pagination metadata

### API Providers

**Adzuna:**
- Coverage: Multiple countries
- Rate Limit: Varies by plan
- Requires: App ID + API Key

**JSearch (RapidAPI):**
- Coverage: Global
- Rate Limit: Varies by plan
- Requires: RapidAPI Key

**Remotive:**
- Coverage: Remote jobs only
- Rate Limit: Generous (free tier)
- Requires: No API key

## 🆘 Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify environment variables are set correctly
3. Ensure Redis is running (if using caching)
4. Check API key validity and quotas
5. Review the implementation plan for detailed architecture

---

**Implementation Date:** January 2024
**Version:** 1.0.0
**Status:** Production Ready ✅
