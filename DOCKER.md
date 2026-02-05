# Docker Setup & Deployment Guide

## Running with Docker

This application is fully containerized and can be run on any system with Docker installed.

### Prerequisites
- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)

### Quick Start

1. **Pull and run the application:**
   ```bash
   docker compose pull
   docker compose up -d

2.Access the application:

Frontend: http://localhost
Backend API: http://localhost:5000/api/health

3.Stop the application:
docker compose down

Docker Compose Configuration
The application uses two services:

Backend: Node.js/Express API running on port 5000
Frontend: React app served via Nginx on port 80

docker compose pull mrk31/issue-tracker-backend:latest mrk31/issue-tracker-frontend:latest