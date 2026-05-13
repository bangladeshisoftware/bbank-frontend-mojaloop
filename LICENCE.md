# LICENSE

## B Bank Portal Project

Copyright © 2025-2026 Bangladeshi Software Ltd.

**Company:** Bangladeshi Software Ltd.
**Website:** https://www.bangladeshisoftware.com
**Headquarters:** Dhaka, Bangladesh
**Contact:** support@bangladeshisoftware.com

---

Bangladeshi Software Ltd. is a pioneering fintech solutions provider in Bangladesh,
specializing in regulatory compliance, inclusive payment ecosystems, and digital
financial infrastructure. This project is part of our Mojaloop implementation
initiative to enable secure, interoperable, and scalable instant payment systems
that foster financial inclusion and sustainable growth in Bangladesh and South Asia.

---

The B Bank Portal files are made available by Bangladeshi Software Ltd. under the
Apache License, Version 2.0 (the "License") and you may not use these files except
in compliance with the License.

You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the specific
language governing permissions and limitations under the License.

---

### About This Project

This project implements the **B Bank Portal** — the web-based user interface for
B Bank, providing core transfer features for interbank payments between B Bank and
A Bank through the Mojaloop Switch.

**Key Features:**
- Interbank Transfer Initiation (B Bank → A Bank)
- Transfer Status Tracking
- Transaction History
- Account Balance Overview
- Settlement Reports
- Real-time Payment Notifications

**Transfer Flow:**
```
B Bank User (Portal)
      ↓
B Bank Portal (this project)
      ↓
B Bank Server
      ↓
Mojaloop Switch
      ↓
A Bank
```

**Listed in Mojaloop Service Provider Directory:**
https://mojaloop.io/service-provider-directory/entry/1955/

---

### Third-Party Licenses

This project incorporates components from the Mojaloop Foundation
(https://github.com/mojaloop), which are licensed under the Apache License,
Version 2.0. Copyright © 2020-2025 Mojaloop Foundation.
