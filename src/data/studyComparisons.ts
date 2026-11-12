type Study = { intro: string; items: { title: string; input: string; mapping: string; response: string; question: string }[] }
export const studyComparisons: Record<string, Study> = {
  'feeling-patterns': {
    intro: 'Compare how each study turns a physical signal into a tactile response.',
    items: [
      { title: 'Heartbeat sleeve', input: 'A pulse sensor reads a heartbeat.', mapping: 'Pulse timing becomes motor timing.', response: 'A knitted sleeve returns a rhythm at the wrist.', question: 'Can the wearer distinguish the signal from ordinary movement, comfortably and consistently?' },
      { title: 'Mood vest', input: 'A selected pattern of waves, pulses, or localized vibration.', mapping: 'Motor timing and placement distribute the pattern over neoprene.', response: 'The wearer feels a spatial sequence.', question: 'Do people distinguish the patterns? Emotional meanings must not be assumed to be universal.' },
      { title: 'Pressure letters', input: 'A press at a position on a fabric pad.', mapping: 'Position and pressure select a tactile sequence.', response: 'Another pad conveys the sequence to a recipient.', question: 'Which differences remain recognizable without looking, and how is an ambiguous message repeated?' },
    ],
  },
  'embodied-web': {
    intro: 'Choose an input to inspect its feedback loop and its access constraint.',
    items: [
      { title: 'Breath', input: 'Microphone input during breathing.', mapping: 'The signal controls expansion and contraction.', response: 'The canvas changes pace with the input.', question: 'Can ambient noise be separated from the intended input? A manual control is needed when microphone access is declined.' },
      { title: 'Pose', input: 'Body landmarks from a webcam.', mapping: 'Raised or extended arms map to letterforms.', response: 'A letter appears in response to the pose.', question: 'Which poses are reliably recognized across bodies, lighting, and camera positions?' },
      { title: 'Tilt', input: 'Phone movement.', mapping: 'Orientation affects terrain and camera movement.', response: 'A procedural landscape changes with the device.', question: 'Does neutral-position calibration make the relationship predictable? Touch or keyboard controls should remain available.' },
      { title: 'Proximity', input: 'Messages shared between devices.', mapping: 'A proposed position signal would coordinate sound.', response: 'Web Audio produces a distributed choir.', question: 'How will physical distance actually be sensed? Network timing alone cannot establish proximity.' },
      { title: 'Silhouette', input: 'A webcam silhouette.', mapping: 'The silhouette acts as a boundary for falling particles.', response: 'Particles appear to catch or move with the body.', question: 'Can a first-time visitor discover the interaction without a verbal explanation?' },
    ],
  },
  'hypercinema': {
    intro: 'Compare where each piece gives the viewer control over attention.',
    items: [
      { title: 'Displaced', input: 'The viewer looks around a 360° scene.', mapping: 'Head direction selects a view within the recorded environment.', response: 'An eight-minute portrait follows three international students.', question: 'Can the story remain coherent when the viewer looks away from the intended point of interest?' },
      { title: 'Echoes', input: 'A walk through Washington Square Park.', mapping: 'Binaural direction places interviews, ambience, and narration around the listener.', response: 'Sound draws attention along the route.', question: 'Are transitions legible at different walking speeds, with environmental noise and without headphones?' },
      { title: 'Branch', input: 'The viewer chooses one of three screens.', mapping: 'Each screen holds a perspective on the same dinner party.', response: 'Attention determines which information is received.', question: 'Does each perspective stand alone? What remains understandable when a viewer switches midway?' },
    ],
  },
  'performance-by-design': {
    intro: 'Compare what triggers a cue, what changes, and what the audience must understand.',
    items: [
      { title: 'Light as narrator', input: 'A timed lighting cue.', mapping: 'DMX controls brightness, color, and timing.', response: 'The room suggests a scene or transition without dialogue.', question: 'Can viewers identify the transition without being told the intended meaning?' },
      { title: 'Audience as performer', input: 'People enter and move through rooms.', mapping: 'Visual, auditory, tactile, and olfactory cues direct attention.', response: 'Visitors experience a sequence at different speeds.', question: 'How can someone enter late, pause, or leave without missing essential context?' },
      { title: 'Reactive stage', input: 'A performer moves across pressure sensors.', mapping: 'Sensor events trigger lighting and sound.', response: 'Movement changes the room in a shared feedback loop.', question: 'Does the cue arrive at the right moment, and what happens when a sensor misses or repeats an event?' },
    ],
  },
  'applications': {
    intro: 'Inspect the product contract behind each concept before judging the interface.',
    items: [
      { title: 'Collective Memory', input: 'One sentence contributed to a shared story.', mapping: 'The described React, Socket.IO, and MongoDB flow shares and stores contributions.', response: 'A story grows through multiple contributors.', question: 'How are simultaneous submissions ordered, failed submissions retried, and harmful contributions moderated?' },
      { title: 'Mood Map', input: 'A mood contribution associated with a campus location.', mapping: 'The concept places colored pins on a Mapbox map.', response: 'Readers see moods distributed across a place.', question: 'What location precision, consent, retention, and removal controls are necessary before this can be public?' },
    ],
  },
  'production-studio': {
    intro: 'Read the build as a series of handoffs. Each stage has a dependency that must be checked.',
    items: [
      { title: 'Concept', input: 'A shared interaction brief and deadline.', mapping: 'Agree scope and ownership before hardware and software diverge.', response: 'A defined build direction for the collaborators.', question: 'Can every collaborator explain the essential interaction and the boundary of their responsibility?' },
      { title: 'Prototype', input: 'Sensor output, enclosure dimensions, and software assumptions.', mapping: 'Compare physical fit and input behavior while the parts are still changeable.', response: 'A prototype that exposes integration dependencies.', question: 'Which assumption is most expensive to change after fabrication?' },
      { title: 'Integration', input: 'Hardware, software, and enclosure subsystems.', mapping: 'Reconcile data format, calibration, and physical fit.', response: 'A complete interaction rather than separately working parts.', question: 'Can the system recover after a disconnected sensor or interrupted power?' },
      { title: 'Exhibition', input: 'The assembled installation and setup instructions.', mapping: 'Prepare signage, reset procedures, and a repeatable handoff.', response: 'A visitor-ready installation with a clear operating procedure.', question: 'Can a collaborator set up and reset the work without the original builder present?' },
    ],
  },
  'storytelling': {
    intro: 'Connect an action to a consequence in documented projects from this portfolio.',
    items: [
      { title: 'Enigma', input: 'A visitor draws a letter.', mapping: 'The neural-network sculpture turns processing into a visible sequence.', response: 'A cascade of light follows the drawing.', question: 'Does the sequence help a visitor understand the process, or only notice that something happened?' },
      { title: 'Shuffle', input: 'A visitor moves one fader.', mapping: 'The coupled mechanism redistributes the other positions.', response: 'A single action produces a physical trade-off.', question: 'Can the relationship be discovered through manipulation, and can the visitor predict the next response?' },
      { title: 'Sea of Salt', input: 'A visitor advances the folktale through an interaction.', mapping: 'Narrative progress operates a salt-grinding mechanism.', response: 'The story leaves a material residue.', question: 'Does each step connect the action to the narrative, including for someone who enters midway?' },
    ],
  },
  'messy-humans': {
    intro: 'Select a condition to turn a broad inclusion goal into a concrete review question.',
    items: [
      { title: 'Limited attention', input: 'Someone is distracted or using one hand.', mapping: 'Check action reach, readable status, and alternatives to a single input mode.', response: 'The primary task remains discoverable and recoverable.', question: 'Can someone resume after an interruption without remembering an earlier state?' },
      { title: 'Anxious payment', input: 'Someone is uncertain about a payment.', mapping: 'Keep amount, fees, destination, and review in the same decision path.', response: 'They can inspect the commitment before confirming.', question: 'Does an error explain what happened to the money and what action is safe next?' },
      { title: 'Different conventions', input: 'Names, languages, or payment habits differ from the default.', mapping: 'Review field assumptions, direction, language switching, and requirements.', response: 'People can enter valid information without adopting an unrelated convention.', question: 'Which validation rules exclude a real name, address, or local payment method?' },
      { title: 'Research participation', input: 'An access constraint identified during a review.', mapping: 'Turn role-play observations into questions for people with relevant lived experience.', response: 'The next research plan includes those affected by the decision.', question: 'Who is absent from the study, and which conclusions cannot be made without them?' },
    ],
  },
}
