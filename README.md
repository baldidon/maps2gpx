# maps2gpx

Converti i percorsi di Google Maps in file GPX, pronti da caricare sul tuo GPS navigator o app di navigazione preferita.

## Cosa fa

**maps2gpx** ti permette di incollare un link di Google Maps e ottenere un file GPX del percorso. Il file GPX contiene la traccia completa (punti GPS, distanza, profilo altimetrico) e può essere importato in dispositivi Garmin, app come Komoot, Wikiloc, OruxMaps e qualsiasi software che supporti il formato GPX.

### Funzionalità

- **Parsing automatico** dei link Google Maps (direzioni e luoghi, inclusi link corti `goo.gl` e `maps.app.goo.gl`)
- **Tre profili di percorrenza**: auto, bici, a piedi
- **Mappa interattiva** con anteprima del percorso (Leaflet + OpenStreetMap)
- **Download immediato** del file `.gpx` generato
- **Risoluzione automatica** degli short link di Google Maps

### Come funziona

1. Incolla un link Google Maps con un percorso (es. `https://www.google.com/maps/dir/45.46,9.19/41.90,12.49`)
2. L'app estrae i waypoint dal link
3. Il backend calcola il percorso via GraphHopper e genera il GPX
4. Visualizzi la traccia sulla mappa e scarichi il file

## Stack tecnologico

| Componente | Tecnologia |
|---|---|
| Frontend | Angular 21, Leaflet, Tailwind CSS |
| Backend | NestJS 11, TypeScript |
| Routing API | [GraphHopper](https://graphhopper.com/) |
| GPX Generation | [gpx-builder](https://github.com/tyrasd/gpx-builder) |
| Package Manager | pnpm |

## Prerequisiti

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 10
- Una [API key di GraphHopper](https://graphhopper.com/apikey/) (gratuita, fino a 500 richieste/giorno)

## Installazione

Clona il repository e installa le dipendenze:

```bash
git clone <repo-url>
cd maps2gpx

# Backend
cd backend
pnpm install
cp .env.example .env
# Modifica .env e inserisci la tua GRAPHHOPPER_API_KEY

# Frontend
cd ../frontend
pnpm install
```

## Configurazione

Nel file `backend/.env`:

```env
GRAPHHOPPER_API_KEY=la_tua_api_key_qui
```

## Avvio

Avvia il backend e il frontend in due terminali separati:

```bash
# Terminale 1 – Backend (http://localhost:3000)
cd backend
pnpm start:dev

# Terminale 2 – Frontend (http://localhost:4200)
cd frontend
pnpm start
```

Apri [http://localhost:4200](http://localhost:4200) nel browser.

## Test

```bash
# Backend
cd backend
pnpm test

# Frontend
cd frontend
pnpm test
```

## Struttura del progetto

```
maps2gpx/
├── backend/
│   └── src/
│       └── gpx/
│           ├── gpx.controller.ts    # POST /api/route-to-gpx, /api/resolve-url
│           ├── gpx.service.ts       # Logica routing (GraphHopper) + generazione GPX
│           └── dto/
│               ├── route-request.dto.ts
│               └── route-response.dto.ts
├── frontend/
│   └── src/app/
│       ├── app.ts                   # Componente principale
│       ├── models/route.model.ts    # Tipi condivisi
│       └── services/
│           ├── url-parser.service.ts # Parsing link Google Maps
│           └── gpx-api.service.ts   # Chiamate API al backend
└── AGENTS.md
```

## Formati URL Google Maps supportati

| Tipo | Esempio |
|---|---|
| Direzioni con coordinate | `google.com/maps/dir/45.46,9.19/41.90,12.49` |
| Direzioni con nomi | `google.com/maps/dir/Milano/Roma` (richiede coordinate esplicite) |
| Luogo con coordinate | `google.com/maps/place/Colosseo/@41.89,12.49` |
| Link corti | `maps.app.goo.gl/...`, `goo.gl/maps/...` |

## Licenza

UNLICENSED – progetto privato.
