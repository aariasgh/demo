## Mini CRM de Seguimiento de Clientes Potenciales

\---

## 🟣 Modelo de Negocio

### 🎯 Problema

Los equipos de ventas no tienen visibilidad clara del estado de sus clientes potenciales, lo que genera:

* Pérdida de oportunidades
* Seguimiento inconsistente
* Baja tasa de conversión

### 💡 Propuesta de valor

Permitir a los ejecutivos de ventas:

* Dar seguimiento estructurado a leads
* Visualizar el pipeline comercial
* Priorizar esfuerzos de venta

### 👤 Usuarios objetivo

* Ejecutivo de ventas
* Coordinador comercial

### 📈 Métricas de éxito

* Incremento en tasa de conversión
* Reducción de leads sin seguimiento
* Disminución del tiempo promedio de cierre

\---

## 🟡 Alcance Funcional (Scope)

### ✅ MVP (mínimo para validar valor)

1. Registro de clientes potenciales (leads)
2. Clasificación por estado:

   * Nuevo
   * En contacto
   * Propuesta enviada
   * Cerrado
3. Visualización en pipeline (tipo Kanban)
4. Edición de datos básicos del cliente
5. Cambio de estado manual

### 🚫 Fuera de alcance (por ahora)

* Integraciones con correo
* Automatización de seguimiento
* Reportes avanzados
* Multiusuario complejo

\---

## 🟢 Casos de Uso

### 🧩 CU-01: Crear lead

**Como** ejecutivo de ventas  
**Quiero** registrar un cliente potencial  
**Para** iniciar seguimiento comercial

**Criterios de aceptación:**

* Se puede ingresar nombre y empresa
* Se asigna estado "Nuevo" por defecto
* El lead queda visible en la lista

\---

### 🧩 CU-02: Actualizar estado del lead

**Como** ejecutivo de ventas  
**Quiero** cambiar el estado del cliente  
**Para** reflejar su avance en el proceso

**Criterios de aceptación:**

* Se puede cambiar entre estados definidos
* El cambio se refleja en el pipeline

\---

### 🧩 CU-03: Visualizar pipeline

**Como** usuario  
**Quiero** ver los leads organizados por estado  
**Para** entender el progreso comercial

**Criterios de aceptación:**

* Los leads se agrupan por estado
* Cada columna representa una etapa

\---

### 🔁 Estados del proceso

```
Nuevo → En contacto → Propuesta enviada → Cerrado
````

\---

## 🟠 Aceptación (Validación del Producto)

### ✅ Criterios globales

* Un usuario puede crear y actualizar leads sin fricción
* El estado del lead es siempre visible
* El pipeline refleja el estado real del proceso

### 🧪 Escenario de validación

1. Crear 3 leads
2. Mover uno a "En contacto"
3. Mover otro a "Propuesta enviada"
4. Validar visualización en pipeline

\---

## 🔴 N — Normas y Reglas de Negocio

* Todo lead debe tener un estado
* No existen estados fuera de los definidos
* El estado inicial siempre es "Nuevo"
* El flujo del pipeline es lineal (puede retroceder manualmente)

\---

## 🧠 Notas de Producto

* Esta página es la **fuente de verdad (spec inicial)**
* Toda funcionalidad debe derivarse de esta definición
* Los cambios deben reflejarse primero aquí antes de implementarse
* Este documento es **vivo y versionado**

