1. ERD
1.1 Core system logic

There are two layers:

Real data layer

Built from the uploaded files:

patients
encounters
vitals
lab_results
medications
Patient flow layer

Added as mock/proposed entities:

service_flow_status
service_requests
notifications
survey_responses

The logic is:

patients are the anchor
encounters are the care events
vitals and lab_results belong to encounters
medications belong to patients across time
service_flow_status supports current patient journey updates
service_requests supports step-by-step progress inside an encounter
notifications supports patient communication
survey_responses supports post-experience feedback
1.2 ERD in structured text
PATIENTS
--------
PK patient_id
first_name
last_name
date_of_birth
age
sex
postal_code
blood_type
insurance_number
primary_language
emergency_contact_phone

ENCOUNTERS
----------
PK encounter_id
FK patient_id -> PATIENTS.patient_id
encounter_date
encounter_type
facility
chief_complaint
diagnosis_code
diagnosis_description
triage_level
disposition
length_of_stay_hours
attending_physician

VITALS
------
PK vitals_id
FK patient_id -> PATIENTS.patient_id
FK encounter_id -> ENCOUNTERS.encounter_id
heart_rate
systolic_bp
diastolic_bp
temperature_celsius
respiratory_rate
o2_saturation
pain_scale
recorded_at

LAB_RESULTS
-----------
PK lab_id
FK patient_id -> PATIENTS.patient_id
FK encounter_id -> ENCOUNTERS.encounter_id
test_name
test_code
value
unit
reference_range_low
reference_range_high
abnormal_flag
collected_date

MEDICATIONS
-----------
PK medication_id
FK patient_id -> PATIENTS.patient_id
drug_name
drug_code
dosage
frequency
route
prescriber
start_date
end_date
active

SERVICE_FLOW_STATUS   [MOCK / PROPOSED]
-------------------
PK flow_id
FK patient_id -> PATIENTS.patient_id
FK encounter_id -> ENCOUNTERS.encounter_id
current_step
next_step
status
estimated_wait_minutes
location
priority_label
last_updated
communication_language

SERVICE_REQUESTS   [MOCK / PROPOSED]
----------------
PK request_id
FK patient_id -> PATIENTS.patient_id
FK encounter_id -> ENCOUNTERS.encounter_id
request_type
request_name
requested_at
status
priority
assigned_location
completed_at

NOTIFICATIONS   [MOCK / PROPOSED]
-------------
PK notification_id
FK patient_id -> PATIENTS.patient_id
FK encounter_id -> ENCOUNTERS.encounter_id
channel
language
message_type
message_body
sent_at
delivery_status

SURVEY_RESPONSES   [MOCK / PROPOSED]
----------------
PK survey_response_id
FK patient_id -> PATIENTS.patient_id
FK encounter_id -> ENCOUNTERS.encounter_id
survey_sent_at
survey_completed_at
preferred_language
communication_clarity_score
wait_time_clarity_score
next_step_understanding_score
overall_experience_score
free_text_comment
consent_to_follow_up
1.3 Relationship summary
Current uploaded data
One patient can have many encounters
One patient can have many medications
One encounter can have many vitals
One encounter can have many lab results
Proposed patient-flow extension
One encounter can have many service requests
One encounter can have one or more service flow status updates over time
One encounter can generate many notifications
One encounter can generate zero or one survey response per patient experience, depending on the design
1.4 Mermaid ERD

You can paste this into Mermaid-compatible tools:

1.5 Recommended modeling notes
Keep patient history worker-facing only

Even though the model supports historical data, the patient interface should not expose that longitudinal layer.

Keep wait time as operationally separate

Wait time should come from service_flow_status, not be derived from encounter length of stay.

Keep survey tied to the encounter

That makes analysis much stronger because feedback stays connected to the actual service experience.

Keep notifications auditable

Every patient-facing message should be stored with:

channel
language
type
sent time
delivery status
2. Screen architecture

I would structure the product as two distinct application experiences:

Patient experience
Health worker experience

They are connected by data, but they should not share the same information architecture.

2.1 Patient experience architecture
Purpose

Support the patient through the current care journey only.

Main navigation
Patient App / Portal
│
├── Home / Current Visit
│   ├── Current Status
│   ├── Estimated Wait Time
│   ├── Next Step
│   └── Last Update Timestamp
│
├── Messages
│   ├── Wait Time Updates
│   ├── Step Changes
│   ├── Instructions
│   └── Language Preferences
│
├── After Visit
│   ├── Next Steps
│   ├── Follow-up Instructions
│   └── Care Completion Status
│
└── Feedback
    ├── Short Survey
    ├── Optional Comment
    └── Confirmation
Patient screen 1. Home / Current Visit
Goal

Give the patient immediate clarity.

Key areas
Status card
current step
plain-language description
Wait card
estimated wait time range
update timestamp
Next step card
what happens next
where to go, if relevant
Language toggle
patient-preferred communication language
Example content
You are checked in.
Estimated wait time: 20–30 minutes.
Next step: bloodwork.
Last updated: 10:42 AM.
Design note

This screen should reduce anxiety, not feel like a dashboard full of data.

Patient screen 2. Messages
Goal

Show patient-facing communications in one simple place.

Key areas
message feed
message type
sent time
plain-language summary
translated content
Message examples
Your wait time has changed.
Your next step is X-ray.
Please remain in the waiting area.
Your visit is complete. Review your next steps below.
Patient screen 3. After Visit
Goal

Provide the minimum safe amount of information after the encounter.

Key areas
visit complete / still waiting
next instruction
whether follow-up is needed
whether the patient may leave or must wait for another step
Important boundary

No detailed history, no broad clinical records, no raw lab interpretation.

Patient screen 4. Feedback survey
Goal

Capture patient experience immediately after the care journey.

Key areas
communication clarity
wait-time helpfulness
next-step understanding
overall experience
optional comment
Design note

This should feel short and respectful, not like a government form.

2.2 Health worker experience architecture
Purpose

Support fast review of the current encounter in context.

Main navigation
Worker Dashboard
│
├── Encounter Queue / Encounter List
│   ├── Active Encounters
│   ├── Filters
│   ├── Salient Flags
│   └── Search
│
├── Encounter Detail
│   ├── Encounter Summary
│   ├── Patient Snapshot
│   ├── Vitals
│   ├── Lab Results
│   ├── Medications
│   └── Salient Findings
│
├── Historical Context
│   ├── Prior Encounters
│   ├── Trends
│   ├── Medication History
│   └── Prior Abnormal Findings
│
└── Feedback / Service Insights
    ├── Survey Summary
    ├── Experience Trends
    └── Communication Issues
Worker screen 1. Encounter Queue / Encounter List
Goal

Help staff quickly identify which encounter to open and what may need attention.

Key areas
patient name or identifier
encounter type
facility
chief complaint
triage level
current status
alert badges
last updated
Suggested columns
Patient
Encounter type
Complaint
Triage
Current step
Salient flag
Last updated
Why it matters

This screen is the entry point for prioritization.

Worker screen 2. Encounter Detail

This is the core screen.

Layout recommendation
Encounter Detail
│
├── Header
│   ├── Patient identity
│   ├── Encounter type/date
│   ├── Facility
│   └── Triage / disposition
│
├── Left column
│   ├── Encounter Summary
│   ├── Current Vitals
│   └── Active Medications
│
├── Center column
│   ├── Lab Results
│   └── Result Interpretation Support
│
└── Right column
    ├── Salient Findings
    ├── Prior Relevant Context
    └── Operational Status
Section: Encounter Summary

Shows:

chief complaint
diagnosis code and description
attending physician
disposition
length of stay, if relevant
Section: Patient Snapshot

Shows:

age
sex
blood type
primary language
emergency contact if appropriate for role
Section: Current Vitals

Shows:

latest encounter vitals
timestamps
out-of-range markers
Section: Lab Results

Shows:

test
value
unit
reference range
abnormal flag
collected date
Section: Active Medications

Shows:

active meds only by default
expand to full medication history if needed
Section: Salient Findings

Shows only what deserves attention:

abnormal lab values
concerning vital patterns
values that appear inconsistent
encounter-specific risk cues

This should be the most visually prominent part after the header.

Worker screen 3. Historical Context
Goal

Support interpretation without cluttering the main encounter screen.

Key areas
recent encounters
recurring complaints
prior abnormal labs
prior notable vitals
active and recent medications
Design note

This should be a secondary screen or side panel, not the default first view.

Worker screen 4. Feedback / Service Insights
Goal

Let service leads review patient-experience trends.

Key areas
survey response rates
average ratings by facility
comments by theme
language-related clarity issues
pain points in current-step communication

This is more administrative, but it is useful if this becomes a broader service design system.

3. Cross-screen architecture logic
Patient side flow
Check-in confirmed
→ Current status screen
→ Wait time update
→ Step change notification
→ After-visit instruction
→ Feedback survey
Worker side flow
Encounter queue
→ Open encounter detail
→ Review salient findings
→ Check vitals / labs / meds
→ Open historical context if needed
→ Continue care workflow
4. Recommended screen priorities for MVP

If you are prototyping this first, I would prioritize these screens:

Patient MVP
Current Visit
Messages
Feedback Survey
Worker MVP
Encounter Queue
Encounter Detail

That is enough to communicate the full concept strongly.

5. Design principle for both architectures

The strongest rule for this product is:

same encounter, different level of meaning depending on the audience

So:

the patient sees clarity, timing, next steps, and safe communication
the worker sees depth, context, results, and salient findings

That distinction is what makes the architecture coherent.