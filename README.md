# FinanceMaster

**WebTech WiSe25/26 – Gruppenarbeit**  
Team: Tomer Gonen, Kolja Schollmeyer

Eine Web-App zur Verwaltung von Einnahmen und Ausgaben mit Kategorisierung und Finanzübersicht.

## Links

- **Backend Repository**: https://github.com/tomergonen2002/FinanceMaster
- **Frontend Repository**: https://github.com/KoljaSchollmeyer/frontend
- **Live Backend**: https://financemaster-8cou.onrender.com
- **Live Frontend**: https://frontend-7vbb.onrender.com
- **Lokal Frontend**: http://localhost:5173/
- **Lokal Backend**: http://localhost:8080/

## Installation und Lokale Entwicklung

### Backend starten

```bash
cd FinanceMaster
./gradlew bootRun
```

### Frontend starten

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8080 npm run dev
```

## App nutzen (Kurzanleitung)

### 1) Start & Anmeldung

- Öffne das Frontend (lokal oder live):
  - Lokal: http://localhost:5173/
  - Live: https://frontend-7vbb.onrender.com
- Registriere dich über **Neues Konto** oder melde dich über **Anmelden** an.
- Die App nutzt eine **Session (HttpOnly-Cookie)**. Nach der Anmeldung bleibt man eingeloggt, bis man **Abmelden** ausführt.
- Tipp: Nutze nach dem ersten Login den Button **Beispieldaten**, um die App sofort mit Test-Kategorien und zeitlich verteilten Transaktionen zu füllen.

### 2) Dark Mode

- Über den Sonne/Mond-Switch kannst du jederzeit zwischen Light und Dark Mode wechseln.

### 3) Kategorien verwalten

- Lege Kategorien an (z.B. Lebensmittel, Miete, Gehalt).
- Kategorien können nur gelöscht werden, wenn **keine Transaktionen** mehr daran hängen.

### 4) Transaktionen erfassen

- Erfasse Einnahmen oder Ausgaben mit:
  - Typ (**Einnahme** / **Ausgabe**)
  - Betrag
  - Datum
  - Kategorie
  - optionaler Beschreibung
- **Währungsumrechnung**: Bei Auswahl einer Fremdwährung (USD, GBP, etc.) wird automatisch der historische Wechselkurs zum gewählten Datum geladen und der Gegenwert in Euro gespeichert.
- Transaktionen können einzeln gelöscht werden.

### 5) Filtern & Finanzübersicht

- In der **Liste** der Transaktionen kannst du filtern, um gezielt bestimmte Buchungen in der Liste zu suchen oder zu bearbeiten.
- In der **Übersicht** siehst du:
  - Summe **Einnahmen**, Summe **Ausgaben**
  - **Bilanz** (= Einnahmen − Ausgaben)
  - Aufschlüsselungen nach Kategorie bzw. Datum (je nach Ansicht)

## Datenbankmodell (Übersicht)

Das relationale Modell besteht aus drei Tabellen und ihren Beziehungen:

- `users`: Benutzerkonto (inkl. `password_hash`)
- `categories`: Kategorien pro Benutzer (`categories.user_id → users.id`)
- `transactions`: Transaktionen mit Kategorie & Benutzer (`transactions.category_id → categories.id`, `transactions.user_id → users.id`)

<div align="center">
  <img src="docs/db-diagram.png" alt="Relationales DB-Modell" width="720" />
</div>


## Deployment auf Render

### Benötigte Umgebungsvariablen (Backend Service)

```
DB_NAME=financemaster_database
DB_PASSWORD=...
FRONTEND_URL=https://frontend-7vbb.onrender.com
```

### Tests ausführen

**Backend**:
```bash
cd FinanceMaster
./gradlew clean test build --no-daemon
```

**Frontend**:
```bash
cd frontend
npm test
```

## Sicherheit und Architektur

### Sicherheitsmassnahmen

- Passwoerter werden mit BCrypt gehasht
- Session-basierte Authentifizierung mit HttpSession
- Datenbank-Credentials über Umgebungsvariablen
- CORS-Konfiguration für sichere Cross-Origin-Requests
- User-Isolation: Strenge Trennung der Daten zwischen verschiedenen Usern
  - Jeder User sieht nur seine Kategorien
  - Jeder User sieht nur seine Transaktionen
  - Backend validiert User-Zugehörigkeit bei jedem Request