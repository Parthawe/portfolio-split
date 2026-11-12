# Raahi service design extension

Checked 31 October 2026. A 2026 working browser extension of the 2022 service concept.

## Evidence and limits

This is secondary/desk research. No new rider interviews, observations, participant counts or usability outcomes are claimed. The original project credits and surviving artifacts remain in the case study.

- Pune Metro project profile: https://www.punemetrorail.org/project-profile . Use named station sequences and Open annotations; no live departure or coordinate feed. Range Hill is not a boardable choice.
- Official Aqua feeder reference: https://www.punemetrorail.org/download/Pune_Metro_AquaLine.pdf . Selected K-21 and Metro Shuttle 20 stop sequences. The PDF has no visible effective date. Historical fare bands and frequencies are not current quotes.
- Accessibility facilities: https://www.punemetrorail.org/download/commuters_guide/Facilities-available-for-PWD.pdf . Describes facilities; does not confirm lift uptime or the accessibility of every approach.
- One Pune Card: https://www.punemetrorail.org/one-pune-card . Operator validation and balance-update steps inform the proposed service boundary. Raahi does not issue operator-valid tickets.
- Google Maps URLs: https://developers.google.com/maps/documentation/urls/get-started . Named places are handed off only when the rider opens directions. No key or paid API is used.

## Working scenario

Aditi is a fictional demo rider. Plan Vanaz to EON IT Park, compare route legs, follow the journey, issue a demo QR ticket, then complete the trip and inspect Activity and Insights. Times, fares, walking links and coordinates are prototype estimates. No live GPS or payment service is connected.

## Service architecture

Dated operator references -> normalized stop/service network -> local route engine -> personal app / kiosk / vehicle display -> external Google Maps directions when requested.

The personal app stores data in its browser and offers backup, restore and erase actions. The shared kiosk uses a separate in-memory route and receipt session. End session or reload clears it; its receipt never enters the personal wallet. The bus display advances manually and can rehearse English, Marathi and Hindi labels. Translation, physical reach, glare, announcements and passenger comprehension still need field testing.

The prototype source and hosted app remain private. Selected interface captures and conceptual hardware mockups are public case-study artifacts, not installed equipment or proof of production adoption.

## Blueprint and recovery

See service-blueprint.csv for the proposed rider, frontstage, backstage, ownership and failure/recovery layers. Operator payment, validators, telemetry, refunds and current accessibility availability need authorized integrations. Do not silently substitute estimated values for those services.

## Proposed evaluation

Recruit frequent commuters, first-time transfer riders and people who use language or mobility assistance. Test route choice, transfer comprehension, kiosk language/reach/privacy, next-stop recognition under glare and noise, and recovery from unavailable routes or rejected tickets. Record task completion, time, errors and help requests. No study results are available yet.
