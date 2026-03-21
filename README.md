# Monitor Catamarca

Dashboard interactivo de indicadores provinciales. Construido con React + Recharts, desplegable en Vercel con un click.

---

## Estructura del proyecto

```
monitor-catamarca/
├── public/
│   ├── index.html
│   └── data/               ← TUS ARCHIVOS CSV VAN AQUÍ
│       ├── pbg.csv
│       ├── exportaciones.csv
│       ├── litio.csv
│       └── ...
├── src/
│   ├── data/
│   │   └── config.js       ← ARCHIVO PRINCIPAL DE CONFIGURACIÓN
│   ├── components/
│   │   ├── KPICard.jsx
│   │   ├── ChartCard.jsx
│   │   └── Section.jsx
│   ├── hooks/
│   │   └── useCsvData.js
│   ├── App.jsx
│   ├── index.js
│   └── styles.css
├── package.json
└── vercel.json
```

---

## Cómo agregar tus datos

### 1. Formato de los CSV

Cada indicador tiene su propio CSV en `/public/data/`. El formato mínimo es:

```csv
año,valor
2018,1200
2019,1350
2020,980
2021,1400
2022,1680
2023,1820
2024,2100
```

Para gráficos multi-serie (barra apilada, línea doble), usá columnas adicionales:

```csv
año,mineria,agro,otros
2020,900,120,60
2021,1100,140,80
...
```

### 2. Registrar el indicador en config.js

Abrí `src/data/config.js` y agregá un objeto al array `indicadores[]`:

```js
{
  id: "mi_indicador",          // identificador único
  seccion: "economia",         // debe coincidir con un id de secciones[]
  nombre: "Nombre visible",    // aparece en el gráfico y el KPI card
  unidad: "mill. $",           // se muestra debajo del título y en tooltips
  archivo: "mi_indicador.csv", // nombre del CSV en /public/data/
  tipo: "area",                // "linea" | "barra" | "area" | "barra_apilada" | "linea_doble" | "dona"
  kpi: true,                   // true → aparece en los KPI cards de resumen
  formato: (v) => `$${v}M`,    // cómo mostrar el valor en el KPI card
  descripcion: "Texto explicativo para el tooltip",
}
```

### 3. Tipos de gráfico disponibles

| tipo            | Descripción                          | Columnas CSV requeridas       |
|-----------------|--------------------------------------|-------------------------------|
| `linea`         | Línea simple                         | `año`, `valor`                |
| `area`          | Área rellena                         | `año`, `valor`                |
| `barra`         | Barras verticales                    | `año`, `valor`                |
| `barra_apilada` | Barras apiladas (multi-serie)        | `año`, + una col por serie    |
| `linea_doble`   | Dos líneas (ej: nominal vs real)     | `periodo`, `nominal`, `real`  |
| `dona`          | Gráfico de dona (composición)        | `nombre`, `valor`             |

Para `barra_apilada` y `linea_doble`, agregá también la propiedad `series`:

```js
series: [
  { key: "mineria", nombre: "Minería",     color: "#1D9E75" },
  { key: "agro",    nombre: "Agropecuario",color: "#9FE1CB" },
  { key: "otros",   nombre: "Otros",       color: "#888780" },
]
```

---

## Instalación local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm start
# → http://localhost:3000
```

---

## Deploy en Vercel

### Opción A — desde la interfaz web (recomendado)

1. Crear cuenta en [vercel.com](https://vercel.com) (es gratis)
2. Subir el proyecto a GitHub (un repositorio nuevo)
3. En Vercel → "Add New Project" → importar el repositorio
4. Vercel detecta automáticamente que es React → click en **Deploy**
5. ¡Listo! La URL queda algo como `monitor-catamarca.vercel.app`

### Opción B — desde la terminal

```bash
npm install -g vercel
vercel login
vercel          # primer deploy
vercel --prod   # deploys siguientes
```

### Actualizaciones

Cada vez que hacés `git push` al repositorio vinculado, Vercel redespliega automáticamente en segundos.

---

## Personalización de estilo

Todos los colores y tipografías están en `src/styles.css` como variables CSS:

```css
:root {
  --font-display: 'Syne', sans-serif;  /* tipografía principal */
  --bg-page: #F4F2EC;                  /* fondo general */
  --bg-primary: #FFFFFF;               /* fondo de cards */
  --text-primary: #1C1B18;             /* texto principal */
  ...
}
```

El diseño respeta automáticamente el modo oscuro del sistema operativo.

---

## Preguntas frecuentes

**¿Puedo tener más de 3 secciones?**
Sí, agregá más objetos al array `secciones[]` en `config.js`.

**¿Qué pasa si falta un CSV?**
El gráfico muestra "Sin datos — cargá el CSV correspondiente" en lugar de romperse.

**¿Puedo usar datos de Google Sheets?**
Sí. Publicá la hoja como CSV (Archivo → Publicar en la web → CSV) y reemplazá el `fetch` en `useCsvData.js` por la URL pública.

**¿Funciona en celular?**
Sí, el diseño es responsive. En pantallas chicas los gráficos se apilan en columna única.
