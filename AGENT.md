Project: Mojara Market

Architecture
- FastAPI backend
- Supabase database
- React Native mobile app

Important directories
backend/
frontend/
services/payments/
services/orders/

Rules
- All endpoints must include tests
- Use repository pattern for database access
- Never commit secrets
- Use pydantic models for API validation

Commands
tests: pytest
lint: ruff .
start_backend: uvicorn app.main:app --reload
start_frontend: pnpm dev
