"""
Global Standard Event Agent API

이벤트 기획 및 실행을 위한 AI-Native Agent System API.
- CMP International Standards 준수
- EMBOK 5x5 Matrix 기반 도메인 설계
- Cvent REST API 호환

Author: Event Agent System
Version: 0.1.0
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Cloudflare Workers 환경 감지
try:
    from workers import WorkerEntrypoint
    import asgi
    IS_WORKERS = True
except ImportError:
    IS_WORKERS = False

from routers.finance import router as finance_router


# =============================================================================
# APP LIFESPAN
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 실행되는 로직"""
    # Startup
    print("🚀 Event Agent API Starting...")
    print("📚 CMP-IS Domain D: Financial Management - Active")
    yield
    # Shutdown
    print("👋 Event Agent API Shutting down...")


# =============================================================================
# APP INITIALIZATION
# =============================================================================

app = FastAPI(
    title="Global Standard Event Agent API",
    description="""
## 이벤트 기획 및 실행을 위한 AI-Native Agent System

### 📋 준수 표준
- **CMP-IS**: Certified Meeting Professional International Standards
- **EMBOK**: Event Management Body of Knowledge (5x5 Matrix)
- **APEX**: Accepted Practices Exchange

### 🎯 현재 구현된 도메인
- **Financial Management** (CMP-IS Domain D)
  - Skill 7: Manage Event Funding
  - Skill 8: Manage Budget
  - Skill 9: Manage Monetary Transactions

### 🔗 API 호환성
- Cvent REST API 필드명 호환
- FastAPI + Pydantic v2
- OpenAPI 3.0 Swagger 문서

### 📖 참고 문서
- [CMP International Standards](https://www.eventscouncil.org/cmp)
- [EMBOK Model](https://www.embok.org)
    """,
    version="0.1.0",
    contact={
        "name": "Event Agent Team",
        "url": "https://github.com/event-agent",
    },
    license_info={
        "name": "MIT",
    },
    lifespan=lifespan,
)


# =============================================================================
# CORS MIDDLEWARE
# =============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Lovable, 프론트엔드 등 모든 도메인 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# ROUTERS
# =============================================================================

app.include_router(finance_router)


# =============================================================================
# ROOT ENDPOINTS
# =============================================================================

@app.get(
    "/",
    summary="API 상태 확인",
    description="API 서버가 정상 동작 중인지 확인합니다.",
    tags=["Health"],
)
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Global Standard Event Agent API is Running",
        "version": "0.1.0",
        "standards": ["CMP-IS", "EMBOK", "APEX"],
        "active_domains": ["Financial Management"],
        "docs": "/docs",
    }


@app.get(
    "/health",
    summary="헬스체크",
    description="서버 상태 및 활성화된 도메인 정보를 반환합니다.",
    tags=["Health"],
)
async def health_check():
    """헬스체크 엔드포인트"""
    return {
        "status": "healthy",
        "api_version": "0.1.0",
        "domains": {
            "financial_management": {
                "status": "active",
                "reference": "CMP-IS Domain D",
                "skills": [
                    "Skill 7: Manage Event Funding",
                    "Skill 8: Manage Budget",
                    "Skill 9: Manage Monetary Transactions",
                ],
            },
            "strategic_planning": {"status": "planned", "reference": "CMP-IS Domain A"},
            "project_management": {"status": "planned", "reference": "CMP-IS Domain B"},
            "risk_management": {"status": "planned", "reference": "CMP-IS Domain C"},
            "human_resources": {"status": "planned", "reference": "CMP-IS Domain E"},
        },
    }


# =============================================================================
# ERROR HANDLERS
# =============================================================================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """전역 예외 처리"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc),
            "path": str(request.url),
        },
    )


# =============================================================================
# CLOUDFLARE WORKERS ENTRYPOINT
# =============================================================================

if IS_WORKERS:
    class Default(WorkerEntrypoint):
        """Cloudflare Workers 진입점"""
        async def fetch(self, request):
            return await asgi.fetch(app, request, self.env)


# =============================================================================
# RUN (for local development)
# =============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
