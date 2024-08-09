import React, { useState, useEffect } from 'react';
const Card = ({ children }) => <div className="bg-white shadow rounded-lg p-6">{children}</div>;
const CardHeader = ({ children }) => <div className="mb-4">{children}</div>;
const CardContent = ({ children }) => <div>{children}</div>;
const Button = ({ children, ...props }) => <button className="bg-blue-500 text-white px-4 py-2 rounded" {...props}>{children}</button>;
const Input = (props) => <input className="border rounded px-2 py-1" {...props} />;
const Label = ({ children, ...props }) => <label className="block mb-2" {...props}>{children}</label>;

const initData = {
  'Dried chilies': { p: 20, u: 5, v: 250, r: 400 },
  'Sichuan pepper': { p: 30, u: 3, v: 100, r: 60 },
  'Shaoxing wine': { p: 10, u: 5, v: 500, r: 240 },
  'Beef tallow': { p: 15, u: 7.5, v: 500, r: 800 },
  'Rapeseed oil': { p: 8, u: 4, v: 500, r: 200 },
  'Star anise': { p: 25, u: 2.5, v: 100, r: 8 },
  'Cassia cinnamon': { p: 20, u: 2, v: 100, r: 16 },
  'Bay leaves': { p: 15, u: 1.5, v: 100, r: 4.8 },
  'Chinese black cardamom': { p: 40, u: 4, v: 100, r: 12 },
  'White cardamom': { p: 35, u: 3.5, v: 100, r: 4 },
  'Fennel seeds': { p: 18, u: 1.8, v: 100, r: 20 },
  'Onion': { p: 2, u: 0.5, v: 250, r: 300 },
  'Scallions': { p: 5, u: 1, v: 200, r: 300 },
  'Cilantro': { p: 8, u: 1.6, v: 200, r: 40 },
  'Ginger': { p: 6, u: 1.5, v: 250, r: 120 },
  'Sichuan chilli bean paste': { p: 25, u: 5, v: 200, r: 200 },
  'Fermented black beans': { p: 15, u: 3, v: 200, r: 64 },
  'Rock sugar': { p: 5, u: 1, v: 200, r: 48 },
  'Orange peel': { p: 10, u: 2, v: 100, r: 20 }
};

const BeefTallowCalculator = () => {
  const [s, setS] = useState({ 
    o: 2, pp: 23, pc: 8, pac: 0.36, 
    d: initData, 
    i: {}, 
    p: { pc: 0, ic: 0, pac: 0, tc: 0, r: 0, pf: 0, pp: 0 }, 
    n: { n: '', p: 0, u: 0, v: 0, r: 0 }, 
    rn: '', 
    r: { 'Default': initData }, 
    cr: 'Default' 
  });

  const c = (o, d) => Object.entries(d).reduce((a, [k, v]) => {
    const g = v.r * o / 2;
    const uc = Math.ceil(g / v.v);
    a[k] = { a: `${g.toFixed(2)} g`, g, c: g / 1000 * v.p, uc, ...v };
    return a;
  }, {});

  const cp = (i, pc, pp, pac) => {
    const ic = Object.values(i).reduce((s, { c }) => s + c, 0);
    const tc = ic + pc * pac;
    const r = pc * pp;
    const pf = r - tc;
    return { 
      pc, 
      ic, 
      pac: pc * pac, 
      tc, 
      r, 
      pf, 
      pp: r > 0 ? (pf / r * 100) : 0 
    };
  };

  useEffect(() => {
    const i = c(s.o, s.d);
    setS(p => ({ ...p, i, p: cp(i, p.pc, p.pp, p.pac) }));
  }, [s.o, s.pp, s.pc, s.pac, s.d]);

  const u = (k, f, v) => setS(p => {
    const nd = { ...p.d[k], [f]: Number(v) };
    if (f === 'p') nd.u = v * nd.v / 1000;
    else if (f === 'u') nd.p = v * 1000 / nd.v;
    else if (f === 'v') nd.u = nd.p * v / 1000;
    return { ...p, d: { ...p.d, [k]: nd } };
  });

  const h = {
    o: v => { const no = Number(v); setS(p => ({ ...p, o: no, pc: Math.floor(no * 4) })); },
    pc: v => { const npc = Number(v); setS(p => ({ ...p, pc: npc, o: npc / 4 })); },
    ai: () => {
      const { n, p, u, v, r } = s.n;
      if (n && p && u && v && r) {
        setS(p => ({ ...p, d: { ...p.d, [n]: { p: Number(p), u: Number(u), v: Number(v), r: Number(r) } }, n: { n: '', p: 0, u: 0, v: 0, r: 0 } }));
      }
    },
    ri: k => setS(p => { const nd = { ...p.d }; delete nd[k]; return { ...p, d: nd }; }),
    sr: () => s.rn && setS(p => ({ ...p, r: { ...p.r, [p.rn]: p.d }, rn: '' })),
    lr: n => setS(p => ({ ...p, d: p.r[n], cr: n }))
  };

  return (
    <Card>
      <CardHeader>
        <h2>Beef Tallow Calculator</h2>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { k: 'o', l: 'Total Oil (kg)', step: '0.1' },
            { k: 'pp', l: 'Package Price (€)', step: '0.01' },
            { k: 'pc', l: 'Package Count', step: '1' },
            { k: 'pac', l: 'Packaging Cost (€)', step: '0.01' }
          ].map(({ k, l, step }) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center' }}>
              <Label htmlFor={k} style={{ marginRight: '10px', width: '150px' }}>{l}:</Label>
              <Input
                id={k}
                type="number"
                value={s[k]}
                onChange={e => k === 'o' ? h.o(e.target.value) : k === 'pc' ? h.pc(e.target.value) : setS(p => ({ ...p, [k]: Number(e.target.value) }))}
                min="0"
                step={step}
                style={{ width: '100px' }}
              />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: '20px' }}>
          <Label htmlFor="r" style={{ marginRight: '10px' }}>Recipe:</Label>
          <select id="r" value={s.cr} onChange={e => h.lr(e.target.value)} style={{ marginRight: '10px' }}>
            {Object.keys(s.r).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <Input type="text" value={s.rn} onChange={e => setS(p => ({ ...p, rn: e.target.value }))} placeholder="New Recipe Name" style={{ width: '150px', marginRight: '10px' }} />
          <Button onClick={h.sr}>Save Recipe</Button>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <h3>New Ingredient</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            {[
              { k: 'n', p: 'Name', t: 'text' },
              { k: 'p', p: 'Price/kg', t: 'number' },
              { k: 'u', p: 'Unit Price', t: 'number' },
              { k: 'v', p: 'Unit Volume', t: 'number' },
              { k: 'r', p: 'Ratio', t: 'number' }
            ].map(({ k, p, t }) => (
              <Input key={k} type={t} placeholder={p} value={s.n[k]} onChange={e => setS(prev => ({ ...prev, n: { ...prev.n, [k]: e.target.value } }))} style={{ width: '100px' }} />
            ))}
          </div>
          <Button onClick={h.ai}>Add Ingredient</Button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr>
              {['Ingredient', 'Amount', 'Price/kg (€)', 'Unit Price (€)', 'Unit Volume (ml)', 'Ratio', 'Unit Count', 'Cost (€)', 'Actions'].map(h => <th key={h} style={{ border: '1px solid #ddd', padding: '8px' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {Object.entries(s.i).map(([k, v]) => (
              <tr key={k}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{k}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{v.a}</td>
                {['p', 'u', 'v', 'r'].map(f => (
                  <td key={f} style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <Input type="number" value={v[f]} onChange={e => u(k, f, e.target.value)} min="0" step="0.01" style={{ width: '60px' }} />
                  </td>
                ))}
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{v.uc}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{v.c?.toFixed(2) ?? '0.00'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <Button onClick={() => h.ri(k)}>Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <h3>Profit Analysis</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                { k: 'pc', l: 'Number of Packages' },
                { k: 'ic', l: 'Ingredient Cost (€)' },
                { k: 'pac', l: 'Packaging Cost (€)' },
                { k: 'tc', l: 'Total Cost (€)' },
                { k: 'r', l: 'Revenue (€)' },
                { k: 'pf', l: 'Profit (€)' },
                { k: 'pp', l: 'Profit Percentage' }
              ].map(({ k, l }) => (
                <tr key={k}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{l}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {k === 'pp' ? `${s.p[k]?.toFixed(2) ?? '0.00'}%` : (s.p[k]?.toFixed(2) ?? '0.00')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BeefTallowCalculator;
