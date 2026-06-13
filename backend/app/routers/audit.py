"""Audit Log endpoints for lead history"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.database import get_db
from app.models.audit import LeadAuditLog
from app.models.lead import Lead
from app.schemas.audit import AuditLogListResponse, LeadAuditLogResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/leads", tags=["audit"])


@router.get("/{lead_id}/audit", response_model=AuditLogListResponse, status_code=status.HTTP_200_OK)
async def get_lead_audit_history(
    lead_id: int,
    event_type: Optional[str] = Query(None, description="Filter by event type (CREATED, FIELD_EDITED, STATUS_CHANGED, DELETED)"),
    limit: int = Query(default=100, ge=1, le=500, description="Number of audit entries to return"),
    offset: int = Query(default=0, ge=0, description="Number of audit entries to skip"),
    db: AsyncSession = Depends(get_db),
) -> AuditLogListResponse:
    """
    Obtener historial de auditoría completo de un lead.
    
    Retorna lista de eventos ordenados DESC por created_at (más recientes primero).
    Soporta filtrado por tipo de evento y paginación.
    
    Eventos disponibles:
    - CREATED: Lead fue creado
    - FIELD_EDITED: Un campo fue editado
    - STATUS_CHANGED: Status cambio
    - DELETED: Lead fue eliminado
    
    **Raises:**
        HTTPException 404: Lead no encontrado
        HTTPException 500: Error del servidor
    
    **Example:**
    ```
    GET /api/leads/1/audit?limit=50&offset=0&event_type=STATUS_CHANGED
    → 200 OK: { data: [...], meta: { total: 15, limit: 50, offset: 0 } }
    
    GET /api/leads/99999/audit
    → 404 Not Found: Lead no encontrado
    ```
    """
    try:
        # Verify lead exists
        lead_stmt = select(Lead).where(Lead.id == lead_id)
        lead_result = await db.execute(lead_stmt)
        if not lead_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lead con ID {lead_id} no encontrado",
            )
        
        # Build query for audit log entries
        base_stmt = select(LeadAuditLog).where(LeadAuditLog.lead_id == lead_id)
        count_stmt = select(func.count()).select_from(LeadAuditLog).where(LeadAuditLog.lead_id == lead_id)
        
        # Filter by event type if provided
        if event_type:
            base_stmt = base_stmt.where(LeadAuditLog.event_type == event_type)
            count_stmt = count_stmt.where(LeadAuditLog.event_type == event_type)
        
        # Get total count
        total_result = await db.execute(count_stmt)
        total = total_result.scalar_one()
        
        # Order DESC by created_at (newest first) + apply pagination
        base_stmt = base_stmt.order_by(desc(LeadAuditLog.created_at)).limit(limit).offset(offset)
        result = await db.execute(base_stmt)
        audit_logs = result.scalars().all()
        
        return AuditLogListResponse(
            data=[LeadAuditLogResponse.model_validate(log) for log in audit_logs],
            meta={"total": total, "limit": limit, "offset": offset},
        )
        
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(
            f"Error fetching audit history for lead {lead_id}",
            extra={"lead_id": lead_id, "error": str(exc)},
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener historial de auditoría",
        )
