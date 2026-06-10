"""Lead CRUD endpoints for the Mini CRM API"""

import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select, func

from app.database import get_db
from app.models.lead import Lead, LeadStatus
from app.models.audit import LeadAuditLog
from app.schemas.lead import (
    LeadCreate,
    LeadListMeta,
    LeadListResponse,
    LeadResponse,
    LeadUpdate,
    LeadStatusUpdate,
)

logger = logging.getLogger(__name__)

# Idempotency cache for status changes
IDEMPOTENCY_CACHE = {}

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.get("", response_model=LeadListResponse, status_code=status.HTTP_200_OK)
async def list_leads(
    status: LeadStatus | None = Query(default=None, description="Filter by lead status"),
    limit: int = Query(default=100, ge=1, le=1000, description="Number of leads to return"),
    offset: int = Query(default=0, ge=0, description="Number of leads to skip"),
    db: AsyncSession = Depends(get_db),
) -> LeadListResponse:
    """
    List leads with optional status filtering, ordering and pagination.

    The response keeps the existing lead fields and adds metadata so the
    Kanban frontend can render the pipeline efficiently.
    """
    try:
        base_stmt = select(Lead)
        count_stmt = select(func.count()).select_from(Lead)

        if status is not None:
            status_value = status.value if isinstance(status, LeadStatus) else status
            base_stmt = base_stmt.where(Lead.status == status_value)
            count_stmt = count_stmt.where(Lead.status == status_value)

        total_result = await db.execute(count_stmt)
        total = total_result.scalar_one()

        base_stmt = base_stmt.order_by(Lead.created_at.desc()).limit(limit).offset(offset)
        result = await db.execute(base_stmt)
        leads = result.scalars().all()

        return LeadListResponse(
            data=[LeadResponse.model_validate(lead) for lead in leads],
            meta=LeadListMeta(total=total, limit=limit, offset=offset),
        )

    except HTTPException:
        raise

    except Exception as exc:
        logger.error(
            "Unexpected error listing leads",
            extra={"error": str(exc), "status_filter": status, "limit": limit, "offset": offset},
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al listar los leads",
        )


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    lead_data: LeadCreate,
    db: AsyncSession = Depends(get_db),
) -> LeadResponse:
    """
    Create a new lead with complete validation and audit trail.
    
    - Validates all input fields (name, company, email, phone, notes)
    - Checks for email uniqueness in the database
    - Creates lead and audit log in a single atomic transaction
    - Returns 201 Created with full lead details including timestamps
    
    **Raises:**
        HTTPException 400: Validation error (handled by Pydantic)
        HTTPException 409: Email already exists in the database
        HTTPException 500: Unexpected database error
    
    **Example request:**
    ```json
    {
        "name": "Juan García",
        "company": "TechCorp SL",
        "email": "juan@techcorp.com",
        "phone": "+34917777777",
        "notes": "Lead muy interesado"
    }
    ```
    
    **Example response (201 Created):**
    ```json
    {
        "id": 1,
        "name": "Juan García",
        "company": "TechCorp SL",
        "email": "juan@techcorp.com",
        "phone": "+34917777777",
        "status": "Nuevo",
        "notes": "Lead muy interesado",
        "created_at": "2026-06-08T14:30:45.123000",
        "updated_at": "2026-06-08T14:30:45.123000"
    }
    ```
    """
    
    try:
        # Step 1: Check email uniqueness BEFORE creating lead
        # Pre-check provides better error message than IntegrityError
        stmt = select(Lead).where(Lead.email == lead_data.email)
        result = await db.execute(stmt)
        existing_lead = result.scalars().first()
        
        if existing_lead:
            logger.warning(
                f"Attempted duplicate email creation",
                extra={
                    "email": lead_data.email,
                    "existing_lead_id": existing_lead.id,
                }
            )
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email ya existe en el sistema",
                headers={"X-Error-Code": "EMAIL_DUPLICATE"},
            )
        
        # Step 2: Create new lead with timestamps
        now = datetime.now(timezone.utc)
        new_lead = Lead(
            name=lead_data.name,
            company=lead_data.company,
            email=lead_data.email,
            phone=lead_data.phone,
            status="Nuevo",  # Always default status for new leads
            notes=lead_data.notes,
            created_at=now,
            updated_at=now,
        )
        
        db.add(new_lead)
        await db.flush()  # Get the auto-generated ID without committing
        
        # Step 3: Create audit log entry in same transaction
        # Captures complete lead data for audit trail
        audit_log = LeadAuditLog(
            lead_id=new_lead.id,
            event_type="CREATED",
            old_value=None,  # No previous value for creation
            new_value={
                "name": new_lead.name,
                "company": new_lead.company,
                "email": new_lead.email,
                "phone": new_lead.phone,
                "status": new_lead.status,
                "notes": new_lead.notes,
            },
            description=f"Lead created: {new_lead.name} from {new_lead.company}",
            created_by_id=None,  # Future: from authentication context
            meta={"ip_address": None, "user_agent": None},  # Future: from request context
        )
        
        db.add(audit_log)
        
        # Step 4: Commit transaction (atomic: both lead and audit log succeed or both rollback)
        await db.commit()
        
        # Step 5: Refresh to ensure all fields are populated from DB
        await db.refresh(new_lead)
        
        logger.info(
            f"Lead created successfully",
            extra={
                "lead_id": new_lead.id,
                "email": new_lead.email,
                "name": new_lead.name,
                "company": new_lead.company,
            }
        )
        
        return new_lead
        
    except IntegrityError as e:
        # Fallback catch for database constraint violations
        # Should be rare due to pre-check, but defensive programming
        await db.rollback()
        logger.error(
            f"Database integrity error during lead creation",
            extra={"error": str(e), "email": lead_data.email},
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email ya existe en el sistema",
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions (email duplicate, etc)
        raise
        
    except Exception as e:
        # Catch unexpected errors
        await db.rollback()
        logger.error(
            f"Unexpected error creating lead",
            extra={"error": str(e), "email": lead_data.email},
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear el lead",
        )


@router.put("/{lead_id}", response_model=LeadResponse, status_code=status.HTTP_200_OK)
async def update_lead(
    lead_id: int,
    lead_data: LeadUpdate,
    db: AsyncSession = Depends(get_db),
) -> LeadResponse:
    """
    Update an existing lead with partial field updates and complete audit trail.
    
    - Validates all input fields (only provided fields are validated/updated)
    - Checks email uniqueness (excluding current lead)
    - Updates only provided fields, leaves others unchanged
    - Creates audit log entry with old_value → new_value for changed fields
    - Returns 200 OK with updated lead
    
    **Raises:**
        HTTPException 422: Validation error (handled by Pydantic)
        HTTPException 404: Lead not found
        HTTPException 409: Email already exists in another lead
        HTTPException 500: Unexpected database error
    
    **Example request (partial update - only phone):**
    ```json
    { "phone": "+34917999999" }
    ```
    
    **Example response (200 OK):**
    ```json
    {
        "id": 1,
        "name": "Juan García",
        "company": "TechCorp SL",
        "email": "juan@techcorp.com",
        "phone": "+34917999999",
        "status": "Nuevo",
        "notes": "Updated",
        "created_at": "2026-06-08T14:30:45.123000",
        "updated_at": "2026-06-08T14:35:22.123000"
    }
    ```
    """
    
    try:
        # Step 1: Fetch existing lead
        stmt = select(Lead).where(Lead.id == lead_id)
        result = await db.execute(stmt)
        existing_lead = result.scalars().first()
        
        if not existing_lead:
            logger.warning(
                f"Attempted update to non-existent lead",
                extra={"lead_id": lead_id}
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found",
                headers={"X-Error-Code": "LEAD_NOT_FOUND"},
            )
        
        # Step 2: Email uniqueness check (if email is being changed)
        if lead_data.email is not None and lead_data.email != existing_lead.email:
            stmt = select(Lead).where(
                (Lead.email == lead_data.email) & 
                (Lead.id != lead_id)
            )
            result = await db.execute(stmt)
            duplicate_lead = result.scalars().first()
            
            if duplicate_lead:
                logger.warning(
                    f"Attempted email change to duplicate",
                    extra={
                        "lead_id": lead_id,
                        "email": lead_data.email,
                        "existing_lead_id": duplicate_lead.id,
                    }
                )
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email ya existe en el sistema",
                    headers={"X-Error-Code": "EMAIL_DUPLICATE"},
                )
        
        # Step 3: Capture old values for audit trail
        old_value = {}
        new_value = {}
        
        # Step 4: Update fields selectively (only if value actually changes)
        if lead_data.name is not None and lead_data.name != existing_lead.name:
            old_value["name"] = existing_lead.name
            new_value["name"] = lead_data.name
            existing_lead.name = lead_data.name
        
        if lead_data.company is not None and lead_data.company != existing_lead.company:
            old_value["company"] = existing_lead.company
            new_value["company"] = lead_data.company
            existing_lead.company = lead_data.company
        
        if lead_data.email is not None and lead_data.email != existing_lead.email:
            old_value["email"] = existing_lead.email
            new_value["email"] = lead_data.email
            existing_lead.email = lead_data.email
        
        if lead_data.phone is not None and lead_data.phone != existing_lead.phone:
            old_value["phone"] = existing_lead.phone
            new_value["phone"] = lead_data.phone
            existing_lead.phone = lead_data.phone
        
        if lead_data.notes is not None and lead_data.notes != existing_lead.notes:
            old_value["notes"] = existing_lead.notes
            new_value["notes"] = lead_data.notes
            existing_lead.notes = lead_data.notes
        
        # Step 5: Persist changes only if at least one field actually changed.
        # A no-op update must NOT bump updated_at (keeps the endpoint idempotent
        # per Decision #2) and must NOT create an audit event (Decision #4).
        if old_value:
            fields_changed = list(old_value.keys())
            existing_lead.updated_at = datetime.now(timezone.utc)
            db.add(existing_lead)
            await db.flush()

            # Step 6: Create audit log — one event with all changed fields, plus a
            # human-readable old → new description for the timeline UI (per spec).
            changes = [
                f"{field} edited from '{old_value[field]}' to '{new_value[field]}'"
                for field in fields_changed
            ]
            audit_log = LeadAuditLog(
                lead_id=existing_lead.id,
                event_type="FIELD_EDITED",
                old_value=old_value,
                new_value=new_value,
                description="; ".join(changes),
                created_by_id=None,  # Future: from authentication
                meta={"fields_changed": fields_changed},
            )
            db.add(audit_log)

            # Step 7: Commit transaction (atomic: lead + audit log)
            await db.commit()
            await db.refresh(existing_lead)
        
        logger.info(
            f"Lead updated successfully",
            extra={
                "lead_id": existing_lead.id,
                "fields_changed": list(old_value.keys()),
                "email": existing_lead.email,
            }
        )
        
        return existing_lead
        
    except IntegrityError as e:
        # The only unique constraint on leads is email; a violation here means a
        # concurrent request claimed the email between our pre-check and commit.
        # Decision #3: the UNIQUE constraint is the second line of defense → 409.
        await db.rollback()
        logger.error(
            f"Database integrity error during lead update",
            extra={"lead_id": lead_id, "error": str(e)},
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email ya existe en el sistema",
            headers={"X-Error-Code": "EMAIL_DUPLICATE"},
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions (email duplicate, lead not found, etc)
        raise
        
    except Exception as e:
        # Catch unexpected errors
        await db.rollback()
        logger.error(
            f"Unexpected error updating lead",
            extra={"lead_id": lead_id, "error": str(e)},
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al actualizar el lead",
        )


@router.get("/{lead_id}", response_model=LeadResponse, status_code=status.HTTP_200_OK)
async def get_lead(
    lead_id: int,
    db: AsyncSession = Depends(get_db),
) -> LeadResponse:
    """
    Retrieve a specific lead by ID.
    
    **Raises:**
        HTTPException 404: Lead not found
    
    **Example response (200 OK):**
    ```json
    {
        "id": 1,
        "name": "Juan García",
        "company": "TechCorp SL",
        "email": "juan@techcorp.com",
        "phone": "+34917777777",
        "status": "Nuevo",
        "notes": "Lead muy interesado",
        "created_at": "2026-06-08T14:30:45.123000",
        "updated_at": "2026-06-08T14:30:45.123000"
    }
    ```
    """
    try:
        stmt = select(Lead).where(Lead.id == lead_id)
        result = await db.execute(stmt)
        lead = result.scalars().first()
        
        if not lead:
            logger.warning(
                f"Attempted retrieval of non-existent lead",
                extra={"lead_id": lead_id}
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found",
                headers={"X-Error-Code": "LEAD_NOT_FOUND"},
            )
        
        return lead
        
    except HTTPException:
        raise
        
    except Exception as e:
        logger.error(
            f"Unexpected error retrieving lead",
            extra={"lead_id": lead_id, "error": str(e)},
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al recuperar el lead",
        )


@router.patch("/{lead_id}/status", response_model=LeadResponse, status_code=status.HTTP_200_OK)
async def change_lead_status(
    lead_id: int,
    status_update: LeadStatusUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> LeadResponse:
    """
    Change lead status with complete audit trail and idempotency support.
    
    **Status Values:** Nuevo, En contacto, Propuesta enviada, Cerrado
    
    **Idempotency:** Include `Idempotency-Key` header to prevent duplicate processing.
    Identical requests with same key return same result regardless of retry count.
    
    **Audit Trail:** Status changes are recorded in lead_audit_log with old/new values.
    Only creates audit event if status actually changes (not for no-op requests).
    
    **Raises:**
        HTTPException 400: Invalid status value
        HTTPException 404: Lead not found
        HTTPException 500: Unexpected database error
    
    **Example request:**
    ```json
    { "new_status": "En contacto" }
    ```
    
    **Example response (200 OK):**
    ```json
    {
        "id": 1,
        "name": "Juan García",
        "company": "TechCorp SL",
        "email": "juan@techcorp.com",
        "phone": "+34917777777",
        "status": "En contacto",
        "notes": "Lead muy interesado",
        "created_at": "2026-06-08T14:30:45.123000",
        "updated_at": "2026-06-08T14:35:22.123000"
    }
    ```
    """
    
    try:
        # Step 1: Check idempotency cache
        # CRITICAL FIX EC-001: Cache key must include lead_id to prevent cross-lead collisions
        idempotency_key = request.headers.get("Idempotency-Key")
        cache_key = None
        if idempotency_key:
            cache_key = f"{lead_id}:{idempotency_key}"
            if cache_key in IDEMPOTENCY_CACHE:
                cached_status, cached_response = IDEMPOTENCY_CACHE[cache_key]
                logger.info(
                    f"Idempotency hit - returning cached response",
                    extra={"lead_id": lead_id, "idempotency_key": idempotency_key}
                )
                return cached_response
        
        # Step 2: Fetch existing lead
        stmt = select(Lead).where(Lead.id == lead_id)
        result = await db.execute(stmt)
        existing_lead = result.scalars().first()
        
        if not existing_lead:
            logger.warning(
                f"Attempted status change for non-existent lead",
                extra={"lead_id": lead_id}
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found",
                headers={"X-Error-Code": "LEAD_NOT_FOUND"},
            )
        
        # Step 3: Capture old status and check for actual change
        old_status = existing_lead.status
        new_status = status_update.new_status
        
        # CRITICAL FIX BH-003: Move timestamp update AFTER change check
        # Per E2-S2 Decision #2: no-op requests must NOT bump updated_at
        # Step 4: Update status and timestamp ONLY if status actually changes
        if old_status != new_status.value:
            existing_lead.status = new_status.value
            existing_lead.updated_at = datetime.now(timezone.utc)
        
        db.add(existing_lead)
        await db.flush()
        
        # Step 5: Create audit log ONLY if status actually changed
        if old_status != new_status.value:
            audit_log = LeadAuditLog(
                lead_id=existing_lead.id,
                event_type="STATUS_CHANGED",
                old_value={"status": old_status},
                new_value={"status": new_status.value},
                description=f"Status changed: {old_status} → {new_status.value}",
                created_by_id=None,  # Future: from auth context
                meta={"old_status": old_status, "new_status": new_status.value},
            )
            db.add(audit_log)
        
        # Step 6: Commit transaction
        await db.commit()
        
        # Step 7: Refresh to ensure DB values are current
        await db.refresh(existing_lead)
        
        # Step 8: Cache response for idempotency
        response_data = LeadResponse.model_validate(existing_lead)
        if cache_key:
            IDEMPOTENCY_CACHE[cache_key] = (200, response_data)
            logger.info(
                f"Idempotency key cached",
                extra={"lead_id": lead_id, "idempotency_key": idempotency_key}
            )
        
        logger.info(
            f"Lead status changed successfully",
            extra={
                "lead_id": existing_lead.id,
                "old_status": old_status,
                "new_status": new_status,
            }
        )
        
        return response_data
        
    except HTTPException:
        raise
        
    except Exception as e:
        await db.rollback()
        logger.error(
            f"Unexpected error changing lead status",
            extra={"lead_id": lead_id, "error": str(e)},
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al cambiar estado del lead",
        )
