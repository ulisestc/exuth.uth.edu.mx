---
version: 2.0
name: UTH-Bolsa-de-Trabajo — Identidad UTH × Principios Apple
description: >
  La identidad gráfica oficial de la Universidad Tecnológica de Huejotzingo
  (Manual de Identidad Gráfica, agosto 2021) expresada con la gramática de
  diseño de Apple: la interfaz se retira para que el contenido (vacantes,
  personas, empresas) hable. Secciones a sangre completa que alternan lienzo
  claro y teselas en Negro UTH, titulares con tracking negativo, un único tono
  de acción (Verde UTH) y la pleca institucional guinda/dorado como la única
  firma decorativa del sistema.

source-of-truth:
  identity: "docs/Manual_Identidad_Grafica_2021.pdf"
  principles: "Apple design analysis (apple.com — home, store, buy flow, environment)"

colors:
  # --- Acento único (Verde UTH en tres pasos tonales, como el Action Blue de Apple)
  primary: "#007F66"          # Verde Acción: CTAs y enlaces sobre lienzos claros (AA 5.0:1 con blanco)
  primary-focus: "#00A887"    # Pantone Green C exacto: anillo de foco, indicadores activos, rellenos de marca
  primary-on-dark: "#00A887"  # Pantone Green C sobre teselas oscuras (AA 4.8:1 sobre #2D2926)
  primary-tint: "#E6F5F1"     # Fondo de chips seleccionados y estados de éxito
  on-primary: "#FFFFFF"

  # --- Tinta (Pantone Black C como el "near-black" de Apple)
  ink: "#2D2926"
  ink-muted-80: "#4A4542"
  ink-muted-64: "#636569"     # Pantone Gray (80%) oficial: texto secundario, metadatos (AA 5.8:1)
  ink-muted-48: "#A6A6A8"     # Pantone Cool Gray oficial: SOLO deshabilitados e iconografía pasiva
  body-on-dark: "#FFFFFF"
  body-muted-on-dark: "#D6D1C4" # Crema 7527 oficial: copia secundaria sobre teselas oscuras

  # --- Superficies
  canvas: "#FFFFFF"
  canvas-parchment: "#F5F4F1" # "Pergamino UTH": Crema 7527 al ~20 % — el #f5f5f7 de Apple, en clave cálida
  surface-pearl: "#FAFAF8"
  surface-tile-1: "#2D2926"   # Negro UTH — tesela oscura principal
  surface-tile-2: "#332F2B"   # micro-paso más claro
  surface-tile-3: "#24211F"   # micro-paso más oscuro (pie de pila, visores)
  surface-black: "#1A1816"    # vacío real: visor de CV, overlays fotográficos
  surface-chip-translucent: "#D6D1C4" # Crema al 64 % sobre fotografía

  # --- Líneas
  hairline: "#E4E2DD"
  divider-soft: "#EFEDE9"

  # --- Institucionales (NO interactivos)
  institutional-wine: "#691C32" # Pantone 7421 — pleca superior, sellos de Vinculación
  institutional-gold: "#C2BA98" # Pantone 453  — pleca, insignia "Egresado verificado"

  # --- Semánticos (estados, nunca decoración)
  danger: "#A8123E"           # Pantone 7426 — errores, acciones destructivas, rechazos
  danger-tint: "#FBECEF"
  warning-ink: "#6B5E2E"      # texto sobre warning-tint (AA)
  warning-tint: "#F4F0E2"     # dorado 453 aclarado — "pendiente / en revisión"

typography:
  # Arimo = clon métrico libre de Arial (fuente oficial del Manual, p. 10) con ejes 400–700,
  # lo que permite la escalera 400/600 de Apple sin romper la identidad.
  family: "Arimo, Arial, Helvetica, sans-serif"
  family-solemn: "'Times New Roman', Times, serif" # solo documentos descargables (constancias, reportes)
  hero-display:   { fontSize: 56px, fontWeight: 600, lineHeight: 1.07, letterSpacing: -0.02em }
  display-lg:     { fontSize: 40px, fontWeight: 600, lineHeight: 1.10, letterSpacing: -0.015em }
  display-md:     { fontSize: 32px, fontWeight: 600, lineHeight: 1.15, letterSpacing: -0.012em }
  lead:           { fontSize: 24px, fontWeight: 400, lineHeight: 1.25, letterSpacing: -0.005em }
  lead-airy:      { fontSize: 21px, fontWeight: 400, lineHeight: 1.45, letterSpacing: 0 }
  tagline:        { fontSize: 21px, fontWeight: 600, lineHeight: 1.19, letterSpacing: -0.005em }
  body-strong:    { fontSize: 17px, fontWeight: 600, lineHeight: 1.30, letterSpacing: -0.01em }
  body:           { fontSize: 17px, fontWeight: 400, lineHeight: 1.47, letterSpacing: -0.01em }
  dense-link:     { fontSize: 14px, fontWeight: 400, lineHeight: 2.20, letterSpacing: 0 }
  caption:        { fontSize: 14px, fontWeight: 400, lineHeight: 1.43, letterSpacing: -0.005em }
  caption-strong: { fontSize: 14px, fontWeight: 600, lineHeight: 1.29, letterSpacing: -0.005em }
  button-large:   { fontSize: 17px, fontWeight: 400, lineHeight: 1.0, letterSpacing: -0.01em }
  button-utility: { fontSize: 14px, fontWeight: 400, lineHeight: 1.29, letterSpacing: -0.005em }
  fine-print:     { fontSize: 12px, fontWeight: 400, lineHeight: 1.33, letterSpacing: 0 }
  nav-link:       { fontSize: 14px, fontWeight: 400, lineHeight: 1.0, letterSpacing: -0.005em }

rounded:
  none: 0px     # teselas a sangre completa
  xs: 6px       # códigos/claves (UTH-2026-VAC-…)
  sm: 8px       # botones utilitarios oscuros, imágenes dentro de tarjetas
  md: 12px      # inputs de formulario, cápsulas pearl
  lg: 18px      # tarjetas utilitarias, tarjetas de vacante, modales
  pill: 9999px  # CTAs, chips de filtro, buscador, estatus
  full: 9999px  # botones circulares de icono

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 80px

elevation:
  flat: "none"
  hairline: "0 0 0 1px rgba(45,41,38,0.08)"
  frosted: "backdrop-filter: saturate(180%) blur(20px) sobre canvas al 80 %"
  photo: "rgba(45,41,38,0.22) 3px 5px 30px 0"   # la única sombra "de contenido"
  sheet: "rgba(45,41,38,0.18) 0 24px 60px -12px" # solo modales/hojas (adaptación UTH, ver §Elevación)

components:
  institutional-pleca:  { height: 4px, split: "2/3 {colors.institutional-wine} · 1/3 {colors.institutional-gold}" }
  global-nav:           { backgroundColor: "{colors.canvas} @ 80 % + frosted", textColor: "{colors.ink}", typography: "{typography.nav-link}", height: 64px }
  sub-nav-frosted:      { backgroundColor: "{colors.canvas-parchment} @ 80 % + frosted", textColor: "{colors.ink}", typography: "{typography.tagline}", height: 52px }
  button-primary:       { backgroundColor: "{colors.primary}", textColor: "{colors.on-primary}", typography: "{typography.body}", rounded: "{rounded.pill}", padding: 11px 22px }
  button-secondary-pill:{ backgroundColor: transparent, textColor: "{colors.primary}", border: "1px solid {colors.primary}", rounded: "{rounded.pill}", padding: 11px 22px }
  button-dark-utility:  { backgroundColor: "{colors.ink}", textColor: "{colors.on-primary}", typography: "{typography.button-utility}", rounded: "{rounded.sm}", padding: 8px 15px }
  button-pearl-capsule: { backgroundColor: "{colors.surface-pearl}", textColor: "{colors.ink-muted-80}", border: "1px solid {colors.hairline}", typography: "{typography.caption}", rounded: "{rounded.md}", padding: 8px 14px }
  button-destructive:   { backgroundColor: "{colors.danger}", textColor: "{colors.on-primary}", rounded: "{rounded.pill}", padding: 11px 22px }
  button-icon-circular: { backgroundColor: "{colors.surface-chip-translucent} @ 64 %", textColor: "{colors.ink}", rounded: "{rounded.full}", size: 44px }
  text-link:            { textColor: "{colors.primary}" }
  text-link-on-dark:    { textColor: "{colors.primary-on-dark}" }
  tile-light:           { backgroundColor: "{colors.canvas}", rounded: "{rounded.none}", padding: "80px vertical" }
  tile-parchment:       { backgroundColor: "{colors.canvas-parchment}", rounded: "{rounded.none}", padding: "80px vertical" }
  tile-dark:            { backgroundColor: "{colors.surface-tile-1}", textColor: "{colors.body-on-dark}", rounded: "{rounded.none}", padding: "80px vertical" }
  utility-card:         { backgroundColor: "{colors.canvas}", border: "1px solid {colors.hairline}", rounded: "{rounded.lg}", padding: 24px }
  job-card:             { extends: utility-card }
  stat-tile:            { backgroundColor: "{colors.canvas-parchment}", rounded: "{rounded.lg}", padding: 24px, number: "{typography.display-md}" }
  status-pill:          { rounded: "{rounded.pill}", typography: "{typography.caption-strong}", padding: 4px 10px }
  filter-chip:          { backgroundColor: "{colors.canvas}", border: "1px solid {colors.hairline}", rounded: "{rounded.pill}", padding: 8px 16px }
  filter-chip-selected: { border: "2px solid {colors.primary-focus}", backgroundColor: "{colors.primary-tint}" }
  search-input:         { backgroundColor: "{colors.canvas}", border: "1px solid rgba(45,41,38,0.12)", rounded: "{rounded.pill}", height: 48px }
  text-input:           { backgroundColor: "{colors.canvas}", border: "1px solid rgba(45,41,38,0.16)", rounded: "{rounded.md}", height: 44px, typography: "{typography.body}" }
  segmented-tabs:       { backgroundColor: "{colors.canvas-parchment}", rounded: "{rounded.pill}", activeBackground: "{colors.canvas}" }
  modal-sheet:          { backgroundColor: "{colors.canvas}", rounded: "{rounded.lg}", shadow: "{elevation.sheet}" }
  floating-sticky-bar:  { backgroundColor: "{colors.canvas-parchment} @ 80 % + frosted", height: 64px }
  footer:               { backgroundColor: "{colors.canvas-parchment}", textColor: "{colors.ink-muted-80}", typography: "{typography.fine-print}" }
---

# Sistema de Diseño — Bolsa de Trabajo UTH

> **Identidad:** *Manual de Identidad Gráfica Institucional (agosto 2021)* — Universidad Tecnológica de Huejotzingo, OPD del Gobierno del Estado de Puebla.
> **Gramática:** principios de diseño de Apple (apple.com).
> **Plataforma:** `exuth.uth.edu.mx` · Next.js 16 · Tailwind CSS v4.
> **Implementación:** los tokens viven en `src/app/globals.css` (`@theme`) y los primitivos en `src/components/ui/`.

---

## 1. Visión

La versión anterior era *correcta en color pero ruidosa en estructura*: cada pantalla mezclaba verde, guinda, dorado, azul, ámbar y esmeralda como acentos; textos de 10–12 px; tarjetas con sombras, bordes de color y degradados; y portales que apilaban todo en una sola página larga.

Este sistema conserva **cada valor oficial del Manual** y cambia **cómo se usan**:

1. **Un solo color dice "haz clic aquí":** el Verde UTH. Guinda y Dorado dejan de ser botones y vuelven a su papel institucional (pleca, sellos, insignias).
2. **La interfaz se retira.** Sin degradados, sin sombras en tarjetas ni botones, sin bordes de color. Jerarquía = tamaño tipográfico + espacio + cambio de superficie.
3. **El ritmo lo da la superficie.** Secciones a sangre completa alternan Blanco → Pergamino → Negro UTH. El cambio de color *es* el divisor.
4. **Lectura, no escaneo.** Cuerpo a 17 px, titulares a 600 con tracking negativo, máximo ~65 caracteres por línea.
5. **Una tarea por vista.** Los portales usan sub-navegación (pestañas) en lugar de una página infinita. Cada vista tiene **una** acción primaria.

### Características clave
- Pleca institucional (guinda 2/3 · dorado 1/3, 4 px) como única firma decorativa — aparece una vez, sobre la navegación global.
- Navegación global blanca esmerilada (64 px) con el imagotipo horizontal; sub-navegación esmerilada de 52 px en portales con título, pestañas y CTA persistente a la derecha.
- Dos gramáticas de botón: **píldora verde** (acciones) y **rectángulo utilitario** de 8 px (herramientas de consola).
- Tarjetas utilitarias blancas de 18 px con *hairline*, sin sombra.
- Estatus como píldoras tintadas (fondo claro + texto oscuro del mismo tono), nunca como bloques saturados.

---

## 2. Color

### 2.1 Mapeo Apple → UTH

| Rol Apple | Apple | UTH | Origen oficial |
|---|---|---|---|
| Action Blue (CTA, enlaces) | `#0066cc` | **Verde Acción `#007F66`** | Pantone Green C oscurecido para AA |
| Focus Blue | `#0071e3` | **Verde UTH `#00A887`** | Pantone Green C exacto |
| Sky Link Blue (en oscuro) | `#2997ff` | **Verde UTH `#00A887`** | Pantone Green C exacto |
| Near-Black Ink | `#1d1d1f` | **Negro UTH `#2D2926`** | Pantone Black C exacto |
| Parchment | `#f5f5f7` | **Pergamino `#F5F4F1`** | Crema 7527 al ~20 % |
| Dark tile | `#272729` | **Negro UTH `#2D2926`** | Pantone Black C exacto |
| Body muted on dark | `#cccccc` | **Crema `#D6D1C4`** | Pantone 7527 exacto |
| Ink muted | `#7a7a7a` | **Gris UTH `#636569`** | Pantone Gray 80 % exacto |

> [!IMPORTANT]
> **Por qué existe `#007F66`.** Texto blanco sobre `#00A887` da **2.9:1**, que reprueba WCAG AA para texto normal. Apple resuelve lo mismo con su azul `#0066cc`. El Verde Acción es el **mismo matiz** del Pantone Green C con menor luminancia (5.0:1 con blanco). El verde exacto se conserva para foco, indicadores, iconografía y todo lo que va sobre fondos oscuros, donde sí cumple contraste.

### 2.2 Superficies
- **Blanco** (`canvas`): lienzo dominante, tarjetas, formularios.
- **Pergamino** (`canvas-parchment`): secciones alternas, fondo de consolas/portales, pie de página. Lo bastante distinto del blanco como para crear ritmo.
- **Negro UTH** (`surface-tile-1/2/3`): teselas oscuras de impacto (hero de portales, CTA de registro, bloque "Cómo funciona"). Máximo **una o dos** por página.
- **Vacío** (`surface-black`): visor de PDF/CV y overlays fotográficos.

### 2.3 Institucionales (no interactivos)
- **Guinda 7421** `#691C32`: pleca superior, sello "Validado por Vinculación UTH", eyebrow institucional ocasional. **Nunca** un botón.
- **Dorado 453** `#C2BA98`: pleca superior, insignia "Egresado verificado". **Nunca** un botón.

### 2.4 Semánticos
| Estado | Fondo | Texto | Uso |
|---|---|---|---|
| Éxito / aprobada / aceptada | `primary-tint` | `primary` | Vacante aprobada, postulación aceptada, CV activo |
| Pendiente / en revisión | `warning-tint` | `warning-ink` | Revisión UTH, vacante pendiente, padrón en validación |
| En proceso / enviada | `canvas-parchment` | `ink` | Enviada a empresa, borrador |
| Rechazada / error | `danger-tint` | `danger` | Rechazos, errores de formulario |
| Cerrada / concluida | `divider-soft` | `ink-muted-64` | Proceso concluido, vacante cerrada |

### 2.5 Degradados
**Ninguno.** La atmósfera proviene de la fotografía. Los degradados `from-[#2D2926] to-[#3a3532]` y similares de la versión anterior quedan prohibidos.

---

## 3. Tipografía

### 3.1 Familia
- **Arimo** (vía `next/font/google`), con *fallback* `Arial, Helvetica, sans-serif`. Arimo es métricamente idéntica a Arial — la fuente oficial del Manual (p. 10) — pero ofrece pesos intermedios (400–700). Esto permite el peso **600** de Apple para titulares sin abandonar la identidad.
- **Times New Roman** solo en documentos descargables solemnes (constancias, reportes CACEI).

### 3.2 Jerarquía

| Token | Tamaño | Peso | Interlineado | Tracking | Uso |
|---|---|---|---|---|---|
| `hero-display` | 56 px | 600 | 1.07 | −0.02em | Titular del hero de inicio |
| `display-lg` | 40 px | 600 | 1.10 | −0.015em | Titular de sección / tesela |
| `display-md` | 32 px | 600 | 1.15 | −0.012em | Título de página interna, números de métricas |
| `lead` | 24 px | 400 | 1.25 | −0.005em | Subtítulo de hero |
| `lead-airy` | 21 px | 400 | 1.45 | 0 | Párrafo introductorio |
| `tagline` | 21 px | 600 | 1.19 | −0.005em | Título de tarjeta grande, nombre del portal en sub-nav |
| `body-strong` | 17 px | 600 | 1.30 | −0.01em | Título de vacante en tarjeta, énfasis |
| `body` | 17 px | 400 | 1.47 | −0.01em | Párrafos, botones primarios |
| `caption` | 14 px | 400 | 1.43 | −0.005em | Metadatos, ayudas de formulario |
| `caption-strong` | 14 px | 600 | 1.29 | −0.005em | Labels de formulario, estatus |
| `fine-print` | 12 px | 400 | 1.33 | 0 | Legal, pie de página |

### 3.3 Principios
- **Cuerpo a 17 px, no 14 ni 12.** La versión anterior usaba `text-xs` (12 px) para descripciones y `text-[10px]` para labels. Mínimo absoluto en la nueva UI: **12 px**, y solo para legal/claves.
- **600 para titulares, no 800/900.** `font-black` y `font-extrabold` quedan prohibidos.
- **Tracking negativo solo ≥ 17 px.** Nunca en 12–14 px.
- **Mayúsculas con tracking amplio (eyebrows):** máximo una por cada tres secciones.

---

## 4. Layout

### 4.1 Espaciado
Base 8 px. Tokens: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 80.
- Padding vertical de sección: **80 px** desktop / **56 px** móvil.
- Padding de tarjeta: **24 px**.
- Separación entre tarjetas: **16–24 px**.

### 4.2 Contenedores
| Contexto | Ancho máximo |
|---|---|
| Lectura (detalle de vacante, aviso de privacidad, formularios) | `max-w-3xl` (768 px) |
| Contenido general | `max-w-[1120px]` |
| Consolas con tablas (admin) | `max-w-[1280px]` |

### 4.3 Filosofía de espacio en blanco
El espacio es el pedestal del contenido. Un titular de sección tiene al menos 48 px de aire arriba. Las tarjetas nunca se tocan. La excepción deliberada es el pie de página: denso a propósito para mostrar toda la arquitectura de información de un vistazo.

---

## 5. Elevación

| Nivel | Tratamiento | Uso |
|---|---|---|
| Plano | sin sombra, sin borde | Teselas, navegación, footer |
| Hairline | `1px solid hairline` | Tarjetas utilitarias, inputs, tablas |
| Esmerilado | `backdrop-filter: saturate(180%) blur(20px)` sobre 80 % | Nav global, sub-nav, barra flotante |
| Foto | `rgba(45,41,38,.22) 3px 5px 30px` | Fotografía apoyada sobre superficie |
| Hoja (adaptación UTH) | `rgba(45,41,38,.18) 0 24px 60px -12px` | **Solo** modales y menús desplegables |

> [!NOTE]
> Apple usa exactamente una sombra. Una bolsa de trabajo necesita además modales (formularios de vacante, edición de perfil); la sombra **Hoja** es la única concesión y nunca se usa en tarjetas, botones ni texto.

---

## 6. Formas

| Token | Valor | Uso |
|---|---|---|
| `none` | 0 | Teselas a sangre completa |
| `xs` | 6 px | Claves (`UTH-2026-VAC-…`) en monoespaciado |
| `sm` | 8 px | Botones utilitarios oscuros, logos de empresa |
| `md` | 12 px | Inputs, selects, textareas |
| `lg` | 18 px | Tarjetas, modales, zonas de carga de archivos |
| `pill` | 9999 px | CTAs, chips, buscador, estatus, pestañas segmentadas |

**Regla de gramática:** acción = píldora; contenedor = 18 px; campo = 12 px; herramienta = 8 px. Nada intermedio.

---

## 7. Componentes

Todos viven en `src/components/ui/` y se importan desde `@/components/ui`.

### 7.1 Navegación
- **`Pleca`** — franja de 4 px, guinda 2/3 · dorado 1/3. Una sola vez por página, encima de la nav global.
- **`Navbar` (global-nav)** — blanco 80 % esmerilado, 64 px. Izquierda: imagotipo horizontal (convivencia horizontal obligatoria, Manual p. 8). Centro: *Vacantes · Empresas · Eventos*. Derecha: sin sesión → enlace "Iniciar sesión" + píldora "Crear cuenta"; con sesión → píldora "Mi panel" + menú de avatar (nombre, rol, cerrar sesión). Móvil (< 768 px): hamburguesa con hoja desplegable.
- **`SubNav` (sub-nav-frosted)** — en portales. Pergamino 80 % esmerilado, 52 px, `sticky top-16`. Izquierda: nombre del portal en `tagline`. Centro/derecha: pestañas. Extremo derecho: un CTA primario persistente ("Publicar vacante", "Explorar vacantes").

### 7.2 Botones (`Button`)
| Variante | Aspecto | Cuándo |
|---|---|---|
| `primary` | píldora Verde Acción, texto blanco | La acción principal de la vista. **Una** por vista. |
| `secondary` | píldora transparente, borde y texto verde | Acción alterna junto a la primaria |
| `ghost` | solo texto verde | Acciones terciarias, "Cancelar" |
| `utility` | rect. 8 px Negro UTH, texto blanco 14 px | Herramientas de consola (exportar, filtrar) |
| `pearl` | rect. 12 px pearl + hairline | Acciones secundarias dentro de tarjetas |
| `destructive` | píldora Rojo 7426 | Eliminar, rechazar, suspender |

- Tamaños: `sm` (36 px alto, 14 px), `md` (44 px, 17 px), `lg` (52 px, 17 px).
- Estado presionado: `transform: scale(0.97)` — la micro-interacción del sistema.
- Foco: `outline: 2px solid #00A887; outline-offset: 2px`.
- Deshabilitado: opacidad 40 %, sin cursor.
- Cargando: spinner de 16 px + etiqueta en gerundio ("Guardando…").

### 7.3 Contenedores
- **`Card`** — blanco, hairline, 18 px, padding 24 px, sin sombra. Variante `parchment` para agrupar dentro de una página blanca.
- **`Section`** — tesela a sangre completa: `tone="light" | "parchment" | "dark"`, padding vertical 80/56 px.
- **`StatTile`** — número en `display-md`, etiqueta en `caption` gris. Sin iconos de colores.
- **`PageHeader`** — título `display-md`, descripción `lead-airy` gris, acciones a la derecha.
- **`EmptyState`** — icono 40 px gris en círculo pergamino, título `body-strong`, texto `caption`, **un** CTA.
- **`Skeleton`** — bloques pergamino con pulso suave; sustituyen spinners en listas.

### 7.4 Formularios
- **`Field`** — label arriba (`caption-strong`, tinta), control, ayuda (`caption`, gris) y error debajo (`caption`, rojo 7426 + icono).
- **`Input` / `Select` / `Textarea`** — 44 px, radio 12 px, borde `rgba(45,41,38,.16)`, foco con anillo verde de 2 px (no cambio de borde).
- **`SearchInput`** — píldora 48 px con icono.
- **`Chip`** (filtros) — píldora con hairline; seleccionado = borde 2 px verde + `primary-tint`.
- Nunca usar placeholder como label.

### 7.5 Estatus (`StatusPill`)
Píldora tintada con punto de 6 px. Mapeo central en `src/lib/status.ts` — todas las pantallas lo usan para que "En revisión UTH" se vea igual en el portal del egresado, de la empresa y en la consola.

### 7.6 Modales (`Modal`)
Hoja blanca 18 px con sombra *Hoja*, overlay `rgba(26,24,22,.48)` con desenfoque 8 px. Encabezado con título `tagline` y botón circular de cierre (44 px). Pie con acciones alineadas a la derecha: `ghost` "Cancelar" + `primary`. Cierra con `Esc` y clic en overlay. En móvil se presenta como hoja inferior a pantalla completa.

### 7.7 Pestañas (`Tabs`)
Control segmentado: contenedor pergamino en píldora, pestaña activa blanca con hairline. Para más de 5 pestañas o en la sub-nav, usar pestañas de texto con indicador inferior de 2 px verde.

### 7.8 Footer
Pergamino, 3–4 columnas de enlaces en `dense-link`, encabezados en `caption-strong`. Fila legal en `fine-print` gris. Imagotipo con `mix-blend-multiply` para integrarse al pergamino.

---

## 8. Arquitectura de información y UX

### 8.1 Mapa del sitio
```
Inicio ─┬─ Vacantes ── Detalle de vacante ── Postularme (egresado)
        ├─ Empresas ── Perfil de empresa
        ├─ Eventos
        ├─ Iniciar sesión / Crear cuenta (egresado | empresa)
        └─ Aviso de privacidad
Portal Egresado  : Resumen · Postulaciones · CV y documentos · Mi perfil
Portal Empresa   : Resumen · Vacantes · Candidatos · Perfil de empresa
Consola UTH      : Resumen · Vacantes · Postulaciones · Empresas · Padrón · Eventos · Reportes
```

### 8.2 Reglas de UX
1. **Una acción primaria por vista.** Si hay dos píldoras verdes rellenas, una sobra.
2. **El acceso administrativo no compite en la portada.** Vive en el pie de página ("Acceso institucional").
3. **Portales con pestañas, no scroll infinito.** La pestaña activa se refleja en la URL (`?tab=`), para que el botón Atrás y los enlaces funcionen.
4. **Estados completos:** cargando (skeleton), vacío (EmptyState con CTA), error (mensaje en línea con reintento), éxito (confirmación en línea o toast efímero).
5. **Lenguaje claro y en segunda persona.** "Sube tu CV" en lugar de "Módulo de gestión de expediente digital curricular".
6. **Feedback inmediato:** cada botón que dispara una petición muestra estado de carga y se deshabilita.
7. **Móvil primero en navegación:** menú hamburguesa, tablas que colapsan a tarjetas en < 768 px, objetivos táctiles ≥ 44 px.

---

## 9. Logotipo (Manual pp. 5, 8, 15–16)
- Convivencia **horizontal** en la navegación global; **cuadrada/vertical** en login, registro y hero.
- Área de protección mínima **1X** (≥ 16 px) libre de texto o bordes.
- ❌ Deformar, rotar, recolorear, aplicar degradados o sombras al imagotipo.
- ❌ Colocarlo sobre fondos ruidosos. Sobre Negro UTH, usar la versión en reserva blanca (pendiente de archivo) o colocarlo en una zona clara.

---

## 10. Hacer / No hacer

### Hacer
- Usar `primary` para **toda** acción y enlace sobre fondos claros, y `primary-on-dark` sobre teselas oscuras.
- Titulares a 600 con tracking negativo; cuerpo a 17 px / 400 / 1.47.
- Alternar Blanco → Pergamino → Negro UTH para separar secciones.
- Reservar la píldora para lo que es una acción.
- `scale(0.97)` como estado presionado en todos los botones.
- Usar `StatusPill` y `src/lib/status.ts` para todo estatus.

### No hacer
- ❌ Botones guinda, dorados, azules, ámbar o esmeralda. El único color de acción es el verde.
- ❌ Sombras en tarjetas o botones (`shadow-sm`, `shadow-md`, `shadow-lg`).
- ❌ Degradados decorativos.
- ❌ `font-black`, `font-extrabold`, `text-[10px]`, `text-[11px]` para contenido.
- ❌ Bordes laterales de color en hover ("acento izquierdo").
- ❌ Paletas de Tailwind ajenas a la marca (`emerald-*`, `blue-*`, `amber-*`, `rose-*`) — usar tokens.
- ❌ Más de una pleca por página.
- ❌ Hex en línea en componentes: usar las utilidades de token (`bg-primary`, `text-ink`, `bg-parchment`…).

---

## 11. Tokens en código

Tailwind v4 (`@theme` en `globals.css`) expone:

| Utilidad | Valor |
|---|---|
| `bg-primary` / `text-primary` | `#007F66` |
| `bg-brand` / `text-brand` / `ring-brand` | `#00A887` |
| `bg-primary-tint` | `#E6F5F1` |
| `text-ink` / `bg-ink` | `#2D2926` |
| `text-ink-80` | `#4A4542` |
| `text-ink-64` | `#636569` |
| `text-ink-48` | `#A6A6A8` |
| `bg-parchment` | `#F5F4F1` |
| `bg-pearl` | `#FAFAF8` |
| `bg-tile` / `bg-tile-2` / `bg-tile-3` | `#2D2926` / `#332F2B` / `#24211F` |
| `text-cream` | `#D6D1C4` |
| `border-hairline` | `#E4E2DD` |
| `border-divider` | `#EFEDE9` |
| `bg-wine` / `bg-gold` | `#691C32` / `#C2BA98` |
| `text-danger` / `bg-danger-tint` | `#A8123E` / `#FBECEF` |
| `text-warning-ink` / `bg-warning-tint` | `#6B5E2E` / `#F4F0E2` |
| `rounded-card` | 18 px |
| `rounded-field` | 12 px |
| `shadow-photo` / `shadow-sheet` | ver §5 |

Clases de tipografía compuestas: `text-hero`, `text-display-lg`, `text-display-md`, `text-lead`, `text-lead-airy`, `text-tagline`, `text-body`, `text-caption`, `text-fine`.

---

## 12. Guía de iteración
1. Un componente a la vez; referenciarlo por nombre (`Button variant="secondary"`).
2. Nunca hex en línea: siempre utilidades de token.
3. No documentar hover como estado de diseño: definir reposo y presionado; el hover es solo un leve cambio de opacidad/tono.
4. Ante la duda sobre énfasis: cambiar la superficie (claro → oscuro) antes que añadir adornos.
5. Antes de añadir un color, preguntar: ¿es acción (verde), estado (semántico) o institución (pleca)? Si no es ninguno, no va.

## 13. Pendientes conocidos
- Falta la versión del imagotipo en **reserva blanca** (SVG) para usarla sobre teselas oscuras.
- La fotografía de las secciones de inicio es provisional; debe sustituirse por fotografía institucional real (egresados, campus, empresas en convenio) manteniendo el encuadre.
