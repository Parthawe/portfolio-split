/** Public case-study evidence, separate from generated answers and reviewer material. */
export const projectChatEvidence: Record<string, { source: string; facts: string[]; limitations: string[] }> = {
  jugalbandi: {
    source: '/jugalbandi#cs-instrument',
    facts: [
      'Hexa-18 is the human-played MIDI instrument with 18 sensor inputs.',
      'Flute inputs at the top of Hexa-18 call the separate robotic flute.',
      'Tanpura inputs at the sides call the mechanized harp.',
      'Tabla inputs inside Hexa-18 call the mechanized rainsticks.',
      'The visitor plays the MIDI instrument and the robotic acoustic instruments answer.',
    ],
    limitations: ['Browser sound is synthesized. Browser timings and responses are illustrative; original trained weights and actuator logs are unavailable.'],
  },
  enigma: {
    source: '/enigma#cs-overview',
    facts: [
      'The original installation is a 200-neuron light sculpture for handwritten-letter recognition.',
      'The original feedforward model was trained on EMNIST letters.',
      'A tablet captures handwriting; a laptop prepares a 28 by 28 input; an Arduino Mega drives the LEDs.',
    ],
    limitations: [
      'The original trained model weights are not available in the archive.',
      'The browser drawing and typed-letter studies are explanatory adaptations, not the original trained model.',
      'The archive does not include a measured latency or recognition-accuracy report.',
    ],
  },
}

export function verifiedProjectAnswer(slug: string | undefined, question: string): string | undefined {
  if (slug === 'jugalbandi' && /\b(hexa[ -]?18|flute|tanpura|tabla|rainsticks?|robotic instrument)\b/i.test(question)) {
    return 'Hexa-18 is the human-played MIDI instrument with 18 sensor inputs. Flute at the top calls the robotic flute; tanpura on the sides calls the mechanized harp; tabla inside calls the rainsticks. The browser uses synthesized sound and illustrative timing, rather than the original trained weights or actuator logs.'
  }
  if (slug === 'enigma' && /\b(weights?|trained|accuracy|latency|recognition model)\b/i.test(question)) {
    return 'The original Enigma sculpture used a feedforward network trained on EMNIST letters. Its original weights, measured latency and recognition-accuracy report are not available in the archive. The browser drawing and typed-letter studies are explanatory adaptations, not the original trained model.'
  }
}
