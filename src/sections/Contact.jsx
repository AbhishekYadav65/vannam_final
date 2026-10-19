import { useRef, useState } from 'react';
import { INSTAGRAM, IG_HANDLE, copyText } from '../lib/data.js';
import Reveal from '../components/Reveal.jsx';
import Split from '../components/Split.jsx';

export default function Contact() {
  const [f, setF] = useState({ name: '', topic: 'Order', msg: '' });
  const [err, setErr] = useState({});
  const [status, setStatus] = useState('');
  const nameRef = useRef(null), msgRef = useRef(null);
  const set = k => e => setF(s => ({ ...s, [k]: e.target.value }));

  // There is no sending integration yet, so the form prepares a message and never claims it was sent.
  const submit = async e => {
    e.preventDefault();
    const er = {};
    if (f.name.trim().length < 2) er.name = 'Please enter your name.';
    if (f.msg.trim().length < 10) er.msg = 'Please write at least a sentence (10 characters).';
    setErr(er);
    if (er.name) return nameRef.current.focus();
    if (er.msg) return msgRef.current.focus();
    const ok = await copyText(`Hi Vannam, this is ${f.name.trim()}. (${f.topic})\n\n${f.msg.trim()}`);
    setStatus(ok ? 'copied' : 'failed');
  };

  return (
    <section className="contact" id="contact" aria-labelledby="ct-h">
      <div className="wrap cgrid">
        <div>
          <Reveal as="p" className="eyebrow">Contact</Reveal>
          <Split id="ct-h" text={'Tell us what\nyou’d like *to carry.*'} />
          <Reveal as="p" className="lede" d={2}>A question about a pouch, an order, or an idea to make something together. Write to us and we’ll take it from there.</Reveal>
          <Reveal d={3}><a className="ig" href={INSTAGRAM} target="_blank" rel="noopener noreferrer">{IG_HANDLE}</a></Reveal>
          <Reveal as="ul" className="ways" d={4}>
            <li>Orders<small>Include the pieces from your bag</small></li>
            <li>Questions<small>Fabric, size, fit</small></li>
            <li>Collaborations<small>Tell us about your idea</small></li>
          </Reveal>
        </div>

        <Reveal as="form" className="cform" d={2} onSubmit={submit} noValidate>
          <label>Your name
            <input ref={nameRef} value={f.name} onChange={set('name')} autoComplete="name" required aria-invalid={Boolean(err.name)} />
            {err.name && <span className="err">{err.name}</span>}
          </label>
          <label>What is this about?
            <select value={f.topic} onChange={set('topic')}><option>Order</option><option>Product question</option><option>Collaboration</option></select>
          </label>
          <label>Message
            <textarea ref={msgRef} value={f.msg} onChange={set('msg')} required aria-invalid={Boolean(err.msg)} />
            {err.msg && <span className="err">{err.msg}</span>}
          </label>
          <button className="btn btn-blush" data-magnetic type="submit">Prepare my message</button>
          <p className="stat" role="status">
            {status === 'copied' && <>Your message is copied. Paste it into an Instagram message to <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">{IG_HANDLE}</a>. It has not been sent.</>}
            {status === 'failed' && 'We couldn’t copy it automatically. Please copy your message and send it to us on Instagram.'}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
