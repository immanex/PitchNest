# PitchNest Deployment Guide

## Production URLs
- **Backend API:** https://pitchnest-backend-10489410829.us-central1.run.app
- **Frontend:** https://pitchnest-frontend-10489410829.us-central1.run.app
- **Database:** Cloud SQL (pitchnest-live:us-central1:pitchnest-db)

## Local Development

### Using Docker Compose
```bash
docker-compose up --build
```
- Frontend: http://localhost
- Backend: http://localhost:8080
- PostgreSQL: localhost:5432

### Manual Setup
See main README.md

## Cloud Deployment

### Prerequisites
- GCP project: pitchnest-live
- Artifact Registry: cloud-run-source-deploy
- Cloud SQL instance: pitchnest-db

### Manual Deployment

**Backend:**
```bash
cd Backend
gcloud builds submit --tag us-central1-docker.pkg.dev/pitchnest-live/cloud-run-source-deploy/pitchnest-backend

gcloud run deploy pitchnest-backend \
  --image us-central1-docker.pkg.dev/pitchnest-live/cloud-run-source-deploy/pitchnest-backend:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances pitchnest-live:us-central1:pitchnest-db \
  --set-env-vars SECRET_KEY=xxx,GEMINI_API_KEY=xxx,DATABASE_URL=xxx
```

**Frontend:**
```bash
cd Frontend
gcloud builds submit --tag us-central1-docker.pkg.dev/pitchnest-live/cloud-run-source-deploy/pitchnest-frontend -f Dockerfile.cloud

gcloud run deploy pitchnest-frontend \
  --image us-central1-docker.pkg.dev/pitchnest-live/cloud-run-source-deploy/pitchnest-frontend:latest \
  --region us-central1 \
  --allow-unauthenticated
```

### CI/CD (GitHub Actions)

Automated deployment on push to `main` or `cloud-setup-v2` branches.

**Required GitHub Secrets:**
- `GCP_SA_KEY`: Service account JSON key
- `SECRET_KEY`: JWT secret
- `GEMINI_API_KEY`: Google Gemini API key
- `DATABASE_URL`: PostgreSQL connection string

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection (asyncpg format)
- `SECRET_KEY`: JWT signing key
- `GEMINI_API_KEY`: Google Gemini API key

### Frontend
None required (backend URL in nginx config)

## Troubleshooting

### Container fails to start
- Check logs: `gcloud run logs read --service=pitchnest-backend --region=us-central1`
- Verify port 8080 is exposed
- Check environment variables

### Database connection fails
- Verify Cloud SQL instance is running
- Check DATABASE_URL format
- Ensure Cloud SQL connector is added

### Permission denied
- Run: `gcloud run services add-iam-policy-binding SERVICE_NAME --region=us-central1 --member=allUsers --role=roles/run.invoker`
- Or enable in Console: Security tab → Allow unauthenticated

## Monitoring
- Cloud Run metrics: https://console.cloud.google.com/run?project=pitchnest-live
- Logs: https://console.cloud.google.com/logs?project=pitchnest-live
