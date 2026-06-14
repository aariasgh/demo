# Manual Testing Checklist — E6-S1 Responsive Design

**Proyecto:** Mini CRM  
**Historia:** E6-S1 Diseño Responsivo  
**Fecha Prueba:** 2026-06-13  
**Tester:** Amelia (Developer)  
**Entorno:** http://localhost:3000  

## 🎯 Breakpoints a Probar

| Breakpoint | Resolución | Dispositivo | Estado | Notas |
|---|---|---|---|---|
| **xs** | 320x568 | iPhone SE | ⏳ | |
| **xs+** | 375x667 | iPhone 6/7/8 | ⏳ | |
| **sm** | 414x896 | iPhone 12 Pro | ⏳ | |
| **md** | 768x1024 | iPad Portrait | ⏳ | |
| **md+** | 1024x768 | iPad Landscape | ⏳ | |
| **lg** | 1280x720 | Laptop 720p | ⏳ | |
| **lg+** | 1440x900 | Laptop 900p | ⏳ | |
| **xl** | 1920x1080 | Desktop FHD | ⏳ | |

---

## ✅ Criterios por Breakpoint

### **BREAKPOINT 1: xs (320px)**
- [ ] Grid render con 1 columna (stacked vertically)
- [ ] Sin scroll horizontal
- [ ] Lead names legibles (text-sm = 14px)
- [ ] Botones/inputs >= 48x44px
- [ ] Modal modal 90% viewport width
- [ ] Touch targets cómodos (no necesita zoom)
- [ ] Debug indicator muestra "xs: 320px" abajo derecha
- [ ] Notas: ___

### **BREAKPOINT 2: xs+ (375px)**
- [ ] Grid sigue con 1 columna
- [ ] Más espacio horizontal que 320px
- [ ] Lead cards no quedan muy anchas
- [ ] Botones ¿tocables sin activar neighbors?
- [ ] Modal scroll si contenido > 90vh
- [ ] Notas: ___

### **BREAKPOINT 3: sm (414px)**
- [ ] Grid aún 1 columna
- [ ] Máximo ancho útil en mobile
- [ ] Texto no se corta
- [ ] Notas: ___

### **BREAKPOINT 4: md (768px) — TABLET**
- [ ] **Grid cambia a 2 columnas**
- [ ] Dos columnas lado a lado (Nuevo, En contacto visibles)
- [ ] Scroll horizontal para ver Propuesta, Cerrado
- [ ] Padding se ajusta (p-3 → p-4)
- [ ] Fonts escalan (text-sm → text-base)
- [ ] Debug indica "md: 768px"
- [ ] Notas: ___

### **BREAKPOINT 5: md+ (1024px) — TABLET LANDSCAPE**
- [ ] 2-3 columnas visibles
- [ ] Readability mantiene
- [ ] Scroll horizontal funcional
- [ ] Notas: ___

### **BREAKPOINT 6: lg (1280px) — DESKTOP**
- [ ] **Grid cambia a 4 columnas (xl:grid-cols-4)**
- [ ] Todas 4 columnas (Nuevo, En contacto, Propuesta, Cerrado) visibles
- [ ] Sin scroll horizontal necesario
- [ ] Padding desktop (p-6 = 24px)
- [ ] Fonts en tamaño desktop (text-base = 16px)
- [ ] Gap entre columnas es lg:gap-6 (24px)
- [ ] Debug indica "lg: 1024px"
- [ ] Notas: ___

### **BREAKPOINT 7: lg+ (1440px)**
- [ ] 4 columnas aún visibles con espacio
- [ ] Más air gap en cards
- [ ] Notas: ___

### **BREAKPOINT 8: xl (1920px)**
- [ ] 4 columnas + extra space
- [ ] Debug indica "xl: 1280px+"
- [ ] Notas: ___

---

## 🔍 Criterios Globales Aplicados a Todos

### **Layout & Spacing**
- [ ] No layout shift al resize (smooth transition)
- [ ] Padding responsivo aplicado correctamente
- [ ] Gaps entre elementos consistentes
- [ ] Margin/padding no causa cutoff

### **Typography**
- [ ] Lead names siempre legibles
- [ ] Company/email visible sin truncate abusivo
- [ ] Font sizes escalan con breakpoint
- [ ] Line-height 1.4-1.6 (no demasiado tight)

### **Touch & Mobile**
- [ ] Botones >= 48px de alto (no accidentes)
- [ ] Inputs >= 44px de alto
- [ ] Modal no más ancho que 90% viewport
- [ ] Cards draggables sin rozar con otros

### **Scroll Behavior**
- [ ] Scroll vertical en columnas cuando hace falta
- [ ] Scroll horizontal SOLO en tablet 2-col si necesario
- [ ] Sin scroll horizontal en mobile (excepto intencional)
- [ ] Smooth scroll en iOS (no janky)

### **Performance**
- [ ] Resize 320→768→1280 sin lag (60fps visual)
- [ ] CSS se carga con Build bundle < 50KB gzipped
- [ ] No janky animation/transitions

### **Accessibility**
- [ ] Botones tienen aria-labels
- [ ] Inputs accesibles via keyboard Tab
- [ ] Focus visible (outline azul)
- [ ] Screen reader friendly

---

## 🧪 Testing Tools Recomendados

### Chrome DevTools
```
F12 → Toggle device toolbar (Ctrl+Shift+M)
→ Select device or custom dimensions
→ Simulate different breakpoints
```

### Firefox ResponsiveDesign
```
Ctrl+Shift+M → Resize viewport
→ Test at each breakpoint
```

### Manual Measurement (Chrome)
```
DevTools → Inspect element → Computed
→ Check actual width/height/font-size values
```

---

## 📝 Resumen de Ejecución

**Total Breakpoints Testeados:** ___/8  
**Criterios Pasados:** ___/✅  
**Criterios Fallidos:** ___/❌  
**Bloqueadores:** [ ] Ninguno [ ] Mayor [ ] Menor  
**Listo para Code Review:** [ ] Sí [ ] No  

**Hallazgos Críticos:**
```
(Enumerar issues encontradas aquí)
```

**Notas Adicionales:**
```
(Cualquier feedback o mejora encontrada)
```

**Fecha Completada:** ___  
**Aprobado por:** ___  
