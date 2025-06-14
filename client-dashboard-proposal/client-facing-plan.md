# Proyecto Reporting ILV - Dashboard Ejecutivo

## Objetivo del MVP

Desarrollar una plataforma web que permita cargar archivos Excel con información financiera, analizarlos automáticamente mediante agentes de IA, y generar dashboards ejecutivos personalizados según el tipo de datos detectados. Todo esto desplegado en la web, accesible desde cualquier navegador, sin necesidad de instalaciones locales.

## 🤖 Alcance del MVP

1. **Autenticación (Login/Logout)** básico que permite el ingreso seguro a la información de ILV desde cualquier navegador
2. **Cargar archivos Excel** directamente en la plataforma o conectar con Google Drive (por definir)
3. **Análisis automático** mediante agentes IA que comprenden el contexto financiero y generan la información necesaria para su visualización
4. **Generación inteligente de dashboards** adaptados al tipo de información y con base en los requerimientos de ILV

### Arquitectura Simplificada del Sistema

```mermaid
flowchart LR
    U[Usuario <br> Login]
    W[Aplicación Web <br> Carga Archivo Excel]
    D[Dashboard ILV]
    AI[Procesamiento <br> Agente IA]
    DB[(Base de Datos)]

    U --> W
    W --> D
    W --> AI
    AI --> DB
    DB --> D

    style U fill:#1976d2,color:#fff
    style D fill:#4caf50,color:#fff
    style AI fill:#ff9800,color:#fff
    style DB fill:#9c27b0,color:#fff
```

### Flujo de Trabajo del Sistema

```mermaid
sequenceDiagram
    participant U as Usuario
    participant W as Web App
    participant AI as Agente IA
    participant DB as Base de Datos
    participant V as Motor de Visualización

    U->>W: Carga archivo Excel
    W->>AI: Envía datos para análisis
    AI->>AI: Detecta tipo de datos
    AI->>AI: Analiza información
    AI->>DB: Guarda análisis
    AI->>V: Define estructura dashboard
    V->>W: Genera visualizaciones
    W->>U: Muestra dashboard interactivo
```

### Arquitectura Detallada del Sistema

```mermaid
flowchart LR
    subgraph "Usuario"
        U[Usuario]
    end

    subgraph "Frontend - Navegador Next.js - Deployment Vercel"
        U --> UI[Interfaz Web]
        UI --> UPLOAD[Módulo de Carga]
        UI --> DASH[Dashboard]
        VIZ[Motor de Visualización] --> DASH
        TREMOR[Tremor - KPIs] --> VIZ
        CHARTJS[ChartJS - Gráficos] --> VIZ
        ECHARTS[ECharts - Gráficos] --> VIZ
    end

    subgraph "Backend - Servidor Next.js - Deployment Vercel"
        UPLOAD --> API[API Routes]
        API --> LANG[LangGraph Orchestrator]
        LANG --> AGENT[Agente Analizador]
        AGENT --> LLM[OpenAI/Claude API]
        LLM --> AGENT
    end

    subgraph "Servicios Cloud - Supabase"
        API --> STORAGE[File Storage]
        STORAGE --> FILES[Archivos Excel]
        AGENT --> DB[(PostgreSQL)]
        DB --> DATA[Datos Procesados]
        DATA --> VIZ
    end

    style U fill:#e3f2fd
    style DASH fill:#c8e6c9
    style AGENT fill:#fff9c4
    style DB fill:#ffe0b2
    style VIZ fill:#f3e5f5
```

## 🛠️ Stack Tecnológico

### **Base del Sistema**

- **Next.js con TypeScript**: Framework full-stack que nos permite tener frontend y backend en un solo proyecto
- **Supabase**: Base de datos PostgreSQL en la nube con almacenamiento de archivos integrado (y acceso futuro a bases de datos vectorizadas para RAG)
- **Vercel**: Hosting con despliegue automático y escalabilidad global

### **Inteligencia Artificial**

- **LangGraph/LangChain**: Orquestación de agentes IA para análisis financiero
- **OpenAI GPT / Anthropic Claude**: Modelos de lenguaje para comprensión y análisis de datos
- **Model Context Protocol (MCP)**: Estándar abierto para integración con herramientas IA

### **Visualización de Datos (por definir uno o varios)**

- **ChartJS**: Librería open source para visualización de gráficos
- **Tremor**: Componentes ejecutivos pre-diseñados (KPIs, métricas, comparaciones)
- **Apache ECharts**: Gráficos avanzados (waterfall, treemaps, heatmaps)

## 🚀 Plan de Implementación (dedicación aprox: 4hr/día)

### Fase 1: Infraestructura Base (3 semanas)

- Configuración del proyecto Next.js con TypeScript
- Integración con Supabase (base de datos y storage)
- Carga de archivos Excel

### Fase 2: Login (1 semana)

- Implementación backend y base de datos para el sistema de login básico (ingreso con email y password)
- Creación de página de login en frontend con ingreso de email y password

### Fase 3: Inteligencia Artificial (3 semanas)

- Implementación de agentes con LangGraph/LangChain
- Análisis automático de estructura de datos
- Generación de insights automáticos como input para frontend

### Fase 4: Visualización y Dashboard (2 semanas)

- Conexión frontend con resultados de IA
- Generación de gráficos de acuerdo a reportes de IA
- Pruebas y ajustes finales

### Timeline del MVP

```mermaid
gantt
    title Plan de Desarrollo MVP - 2 Meses + 1 semana Aprox
	axisFormat %V
    section Fase 1
    Setup Inicial Frontend :2024-01-01, 5d
    Setup Backend y Base de Datos:5d
    Primer Carga de Excel            :5d
    section Fase 2
    Setup Login Backend y DB       	 :3d
    Setup Login Frontend         :2d
    section Fase 3
    Setup LangGraph/LangChain (IA)       :10d
    Análisis Datos         :5d
    section Fase 4
    Visualización Dashboard              :5d
    Pruebas y Ajustes      :5d
```

## 💰 Inversión

### MVP (2 meses)

- **Horas estimadas (tiempo aproximado)**: 10.800USD equivalentes a 180 horas (4 horas/día × 45 días)

### Costos de Infraestructura (estimación mensual)

- **Supabase**: Plan Pro ~$0-25USD/mes
- **Vercel**: Plan Pro ~$0-20USD/mes
- **OpenAI/Claude API**: ~$0-100USD/mes según uso
- **Total estimado**: ~$0-150USD/mes según uso

## 🔮 Expansiones Futuras (sugeridas, por definir)

### Fase 2: Avance de Plan de Trabajo

- Earn Value Management (PMI-EVM)
- Gráficas adicionales para Project Management

### Fase 3: Presupuesto Operativo

- Earn Value Management (PMI-EVM)
- Gráficas adicionales para Presupuesto Operativo

### Fase 4: Multi-Empresa

- Sistema que replique análisis para las demás empresas del Grupo Malatesta

---

Este MVP sentará las bases para un sistema robusto que puede evolucionar según las necesidades del equipo. La arquitectura modular permite agregar nuevos tipos de análisis, agentes y fuentes de datos.
