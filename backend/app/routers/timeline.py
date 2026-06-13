"""Timeline Event CRUD endpoints"""

import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.database import get_db
from app.models.timeline import TimelineEvent, TimelineEventType
from app.models.lead import Lead
from app.schemas.timeline import (
    TimelineEventCreate,
    TimelineEventResponse,
    TimelineListResponse,
    TimelineEventTypeSchema,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/leads/{lead_id}/timeline", tags=["timeline"])


@router.get("", response_model=TimelineListResponse, status_code=status.HTTP_200_OK)
async def list_timeline_events(
    lead_id: int,
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> TimelineListResponse:
    """
    Get all timeline events for a lead.
    
    Retorna lista de eventos ordenados DESC por timestamp (más recientes primero).
    Soporta filtrado por tipo de evento y paginación.
    """
    try:
        # Verify lead exists
        lead_stmt = select(Lead).where(Lead.id == lead_id)
        lead_result = await db.execute(lead_stmt)
        if not lead_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lead {lead_id} no encontrado",
            )
        
        # Build query
        base_stmt = select(TimelineEvent).where(TimelineEvent.lead_id == lead_id)
        count_stmt = select(func.count()).select_from(TimelineEvent).where(TimelineEvent.lead_id == lead_id)
        
        # Filter by event type if provided
        if event_type:
            base_stmt = base_stmt.where(TimelineEvent.event_type == event_type)
            count_stmt = count_stmt.where(TimelineEvent.event_type == event_type)
        
        # Get total count
        total_result = await db.execute(count_stmt)
        total = total_result.scalar_one()
        
        # Order DESC by timestamp (newest first) + apply pagination
        base_stmt = base_stmt.order_by(desc(TimelineEvent.timestamp)).limit(limit).offset(offset)
        result = await db.execute(base_stmt)
        events = result.scalars().all()
        
        return TimelineListResponse(
            data=[TimelineEventResponse.model_validate(event) for event in events],
            meta={"total": total, "limit": limit, "offset": offset},
        )
        
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error listing timeline events for lead {lead_id}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al listar eventos",
        )


@router.post("", response_model=TimelineEventResponse, status_code=status.HTTP_201_CREATED)
async def create_timeline_event(
    lead_id: int,
    payload: TimelineEventCreate,
    db: AsyncSession = Depends(get_db),
) -> TimelineEventResponse:
    """
    Crear nuevo evento en timeline de un lead.
    
    Validaciones:
    - Lead debe existir
    - event_type debe ser válido (LEAD_CREATED, STATUS_CHANGED, NOTE_ADDED, CALL_MADE, EMAIL_SENT)
    - description no puede estar vacía
    """
    try:
        # Verify lead exists
        lead_stmt = select(Lead).where(Lead.id == lead_id)
        lead_result = await db.execute(lead_stmt)
        if not lead_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lead {lead_id} no encontrado",
            )
        
        # Create event
        new_event = TimelineEvent(
            lead_id=lead_id,
            event_type=payload.event_type,
            description=payload.description,
            event_metadata=payload.metadata or {},
            created_by="user",  # TODO: Extract from auth context
            timestamp=datetime.now(timezone.utc),
        )
        
        db.add(new_event)
        await db.commit()
        await db.refresh(new_event)
        
        logger.info(f"Timeline event created: lead_id={lead_id}, type={payload.event_type}")
        return TimelineEventResponse.model_validate(new_event)
        
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        logger.error(f"Error creating timeline event for lead {lead_id}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear evento",
        )


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_timeline_event(
    lead_id: int,
    event_id: int,
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Eliminar un evento del timeline.
    
    Validaciones:
    - Event debe existir
    - Event debe pertenecer al lead especificado
    """
    try:
        # Find event
        event_stmt = select(TimelineEvent).where(
            TimelineEvent.id == event_id,
            TimelineEvent.lead_id == lead_id,
        )
        event_result = await db.execute(event_stmt)
        event = event_result.scalar_one_or_none()
        
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Evento {event_id} no encontrado",
            )
        
        # Delete
        await db.delete(event)
        await db.commit()
        
        logger.info(f"Timeline event deleted: event_id={event_id}, lead_id={lead_id}")
        
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        logger.error(f"Error deleting timeline event {event_id}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al eliminar evento",
        )
