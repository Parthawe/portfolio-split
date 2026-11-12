import { useEffect, useRef, useState } from 'react'
import './mentra-source.css'

type Step = 'model' | 'guide' | 'permission' | 'denied' | 'scan' | 'found' | 'connecting' | 'success' | 'failure'
const revision = 'a02dade84d5eaa6463d379ceb9d055a1a12dcf8b'
const models = [{ id: 'live', name: 'Mentra Live', maker: 'Mentra' }, { id: 'g1', name: 'Even Realities G1', maker: 'Even Realities' }] as const
const titles: Record<Step, string> = { model: 'Select Model', guide: 'Pairing Guide', permission: 'Bluetooth permission', denied: 'Permission Required', scan: 'Scanning', found: 'Choose your glasses', connecting: 'Pairing', success: 'Success', failure: 'Pairing Failed' }

export default function MentraSourcePrototype() {
  const [step, setStep] = useState<Step>('model')
  const [model, setModel] = useState<(typeof models)[number]>(models[0])
  const title = useRef<HTMLHeadingElement>(null)
  const first = useRef(true)
  useEffect(() => { if (first.current) { first.current = false; return }; title.current?.focus() }, [step])
  const reset = () => { setModel(models[0]); setStep('model') }
  return <div className="mentra-source">
    <section className="mentra-source-phone" aria-label="Mentra pairing browser adaptation">
      <header><button disabled={step === 'model'} onClick={() => setStep('model')} aria-label="Back to model selection">←</button><strong>Mentra</strong><span>Browser demo</span></header>
      <div className="mentra-source-screen">
        <h2 ref={title} tabIndex={-1}>{titles[step]}</h2>
        {step === 'model' ? <><p>Select a supported model to try pairing.</p><div className="mentra-source-models">{models.map(item => <button key={item.id} onClick={() => { setModel(item); setStep(item.id === 'g1' ? 'guide' : 'permission') }}><span><small>{item.maker}</small><strong>{item.name}</strong></span><img src={`/Assets/Projects/MentraSource/${item.id}.png`} alt="" /></button>)}</div></> : <>
          <img className="mentra-source-glasses" src={`/Assets/Projects/MentraSource/${model.id}.png`} alt={model.name} />
          {step === 'guide' && <><h3>Prepare your G1</h3><p>The original guide asks you to disconnect the glasses from the Even Realities app and place them in the charging case with its lid open.</p><p>This demo uses a prepared virtual device. You do not need to change your glasses.</p><button className="mentra-source-primary" onClick={() => setStep('permission')}>Continue to pairing</button></>}
          {step === 'permission' && <><p>Bluetooth access lets the native app find nearby glasses. Choose a simulated permission response.</p><button className="mentra-source-primary" onClick={() => setStep('scan')}>Allow in demo</button><button onClick={() => setStep('denied')}>Deny in demo</button></>}
          {step === 'denied' && <><p role="alert">Bluetooth permissions are required to connect to glasses.</p><button className="mentra-source-primary" onClick={() => setStep('permission')}>Review demo permission</button></>}
          {step === 'scan' && <p role="status">Scanning for {model.name}. Use the device simulator to return a discovery result.</p>}
          {step === 'found' && <><p>One simulated device found.</p><button className="mentra-source-device" onClick={() => setStep('connecting')}><strong>{model.name}</strong><span>Demo device · Connect →</span></button></>}
          {step === 'connecting' && <p role="status">Connecting to the demo device. Choose its response in the simulator.</p>}
          {step === 'success' && <><p role="status">{model.name} connected in this demo.</p><p>You completed model selection, discovery and pairing. No physical device is connected.</p><button className="mentra-source-primary" onClick={reset}>Try another model</button></>}
          {step === 'failure' && <><p role="alert">The demo device could not connect. Return to discovery and try again.</p><button className="mentra-source-primary" onClick={() => setStep('scan')}>Retry discovery</button></>}
        </>}
      </div>
    </section>
    <aside className="mentra-source-context"><p className="mentra-source-label">Source-based prototype</p><h2>Connect your glasses.</h2><p>Try two models from the MentraOS onboarding flow, including a failed connection and recovery.</p><fieldset><legend>Device simulator</legend><p>These controls stand in for native Bluetooth responses. They are separate from the app interface.</p>{step === 'scan' ? <><button onClick={() => setStep('found')}>Discover demo glasses</button><button onClick={() => setStep('failure')}>Return no device</button></> : step === 'connecting' ? <><button onClick={() => setStep('success')}>Connection succeeds</button><button onClick={() => setStep('failure')}>Connection fails</button></> : <p>Select a model and allow the demo permission to begin.</p>}<button onClick={reset}>Reset pairing</button></fieldset><details><summary>Source and adaptation</summary><p>Adapted from MentraOS model selection, G1 preparation, scan and pairing screens at revision {revision.slice(0, 7)}. Two models are included; native Bluetooth, account setup and the rest of the app are outside this prototype.</p><p>Browser controls and permission responses are adaptations. The original design recording is available in the adjacent view.</p><a href={`https://github.com/Mentra-Community/MentraOS/tree/${revision}/mobile/src/app/pairing`} target="_blank" rel="noreferrer">Inspect pinned source ↗</a><br/><a href="/Assets/Projects/MentraSource/LICENSE.txt">MentraOS Apache 2.0 license</a></details></aside>
  </div>
}
