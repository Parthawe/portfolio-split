# MentraOS source assets

Upstream: https://github.com/Mentra-Community/MentraOS
Revision: a02dade84d5eaa6463d379ceb9d055a1a12dcf8b
License: Apache-2.0; full upstream LICENSE included as LICENSE.txt.

Unmodified assets:
- live.png: mobile/assets/glasses/mentra_live/mentra_live.png
- g1.png: mobile/assets/glasses/g1.png

The portfolio's MentraSourcePrototype.tsx is a browser adaptation, not the native app. Model-selection layout, model images, route order and pairing labels are drawn from mobile/src/app/pairing/{select-glasses-model,prep,scan,success,failure}.tsx and mobile/src/i18n/en.ts. Browser permission and device-response controls are additions. Only two models are included. No Bluetooth, account, cloud or native engine integration is implemented. No generated assets used.
