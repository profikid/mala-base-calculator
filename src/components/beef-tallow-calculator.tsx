"use client";

import React, { useState, useEffect, useMemo, ReactNode } from 'react';
const Card = ({ children, className = "" }: { children: ReactNode, className?: string }) => <div className={`bg-white shadow rounded-lg p-6 ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }: { children: ReactNode, className?: string }) => <div className={`mb-4 ${className}`}>{children}</div>;
const CardContent = ({ children, className = "" }: { children: ReactNode, className?: string }) => <div className={className}>{children}</div>;
const Button = ({ children, className = "", ...props }: { children: ReactNode, className?: string, [key: string]: any }) => <button className={`bg-blue-500 text-white px-4 py-2 rounded ${className}`} {...props}>{children}</button>;
const Input = ({ className = "", ...props }: { className?: string, [key: string]: any }) => <input className={`border rounded px-2 py-1 ${className}`} {...props} />;
const Label = ({ children, className = "", ...props }: { children: ReactNode, className?: string, [key: string]: any }) => <label className={`block mb-2 ${className}`} {...props}>{children}</label>;
const Select = ({ className = "", ...props }: { className?: string, [key: string]: any }) => <select className={`border rounded px-2 py-1 ${className}`} {...props} />;
import { initData } from '@/lib/recipe';

interface Supplier {
  name: string;
  prices: { kg: number; price: number }[];
}

interface Ingredient {
  suppliers: Supplier[];
  v: number;
  r: number;
  a?: string;
  g?: number;
  c?: number;
  uc?: number;
  currentSupplier?: string;
  currentPrice?: number;
}

interface State {
  o: number;
  pp: number;
  pc: number;
  pac: number;
  d: Record<string, Ingredient>;
  i: Record<string, Ingredient>;
  p: {
    pc: number;
    ic: number;
    pac: number;
    tc: number;
    r: number;
    pf: number;
    pp: number;
  };
  n: {
    n: string;
    suppliers: Supplier[];
    v: number;
    r: number;
  };
  rn: string;
  r: Record<string, Record<string, Ingredient>>;
  cr: string;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
}

const BeefTallowCalculator = () => {
  const [state, setState] = useState<State>({ 
    oilAmount: 2, packagePrice: 23, packageCount: 8, packagingCost: 0.36, 
    data: initData, 
    ingredients: {}, 
    profit: { packageCount: 0, ingredientCost: 0, packagingCost: 0, totalCost: 0, revenue: 0, profit: 0, profitPercentage: 0 }, 
    newIngredient: { name: '', suppliers: [{ name: '', prices: [{ kg: 1, price: 0 }] }], unitVolume: 0, ratio: 0 }, 
    recipeName: '', 
    recipes: { 'Default': initData }, 
    currentRecipe: 'Default',
    sortColumn: '',
    sortDirection: 'asc'
  });

  const c = (o: number, d: Record<string, Ingredient>): Record<string, Ingredient> => 
    Object.entries(d).reduce((a: Record<string, Ingredient>, [k, v]) => {
      const g = v.r * o / 2;
      const uc = Math.ceil(g / v.v);
      const bestPrice = v.suppliers.reduce((best, supplier) => {
        const applicablePrice = supplier.prices.reduce((p, tier) => {
          const pricePerKg = tier.price / tier.kg;
          return tier.kg <= g/1000 ? pricePerKg : p;
        }, supplier.prices[0].price / supplier.prices[0].kg);
        return applicablePrice < best.price ? { price: applicablePrice, supplier: supplier.name } : best;
      }, { price: Infinity, supplier: '' });
      a[k] = { 
        ...v,
        a: `${g.toFixed(2)} g`, 
        g, 
        c: g / 1000 * bestPrice.price, 
        uc, 
        currentSupplier: bestPrice.supplier,
        currentPrice: bestPrice.price
      };
      return a;
    }, {});

  const cp = (i: Record<string, Ingredient>, pc: number, pp: number, pac: number) => {
    const ic = Object.values(i).reduce((s, { c }) => s + (c ?? 0), 0);
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

  const u = (k: string, f: string, v: number) => setS(p => {
    const nd = { ...p.d[k], [f]: Number(v) };
    if (f === 'p') (nd as any).u = v * nd.v / 1000;
    else if (f === 'u') (nd as any).p = v * 1000 / nd.v;
    else if (f === 'v') (nd as any).u = (nd as any).p * v / 1000;
    return { ...p, d: { ...p.d, [k]: nd } };
  });

  const handlers = {
    updateOilAmount: (value: string) => { 
      const newAmount = Number(value); 
      setState(prev => ({ ...prev, oilAmount: newAmount, packageCount: Math.floor(newAmount * 4) })); 
    },
    updatePackageCount: (value: string) => { 
      const newCount = Number(value); 
      setState(prev => ({ ...prev, packageCount: newCount, oilAmount: newCount / 4 })); 
    },
    addIngredient: () => {
      const { name, suppliers, unitVolume, ratio } = state.newIngredient;
      if (name && suppliers.length > 0 && unitVolume && ratio) {
        setState(prev => ({ 
          ...prev, 
          data: { ...prev.data, [name]: { suppliers, v: Number(unitVolume), r: Number(ratio) } }, 
          newIngredient: { name: '', suppliers: [{ name: '', prices: [{ kg: 1, price: 0 }] }], unitVolume: 0, ratio: 0 } 
        }));
      }
    },
    removeIngredient: (key: string) => setState(prev => { 
      const newData = { ...prev.data }; 
      delete newData[key]; 
      return { ...prev, data: newData }; 
    }),
    saveRecipe: () => state.recipeName && setState(prev => ({ 
      ...prev, 
      recipes: { ...prev.recipes, [prev.recipeName]: prev.data }, 
      recipeName: '' 
    })),
    loadRecipe: (name: string) => setState(prev => ({ ...prev, data: prev.recipes[name], currentRecipe: name })),
    updateIngredientName: (oldName: string, newName: string) => {
      setState(prev => {
        const newData = { ...prev.data };
        newData[newName] = newData[oldName];
        delete newData[oldName];
        return { ...prev, data: newData };
      });
    },
    updateSupplier: (ingredient: string, supplierName: string) => {
      setState(prev => {
        const newData = { ...prev.data };
        const supplier = newData[ingredient].suppliers.find(s => s.name === supplierName);
        if (supplier) {
          newData[ingredient].currentSupplier = supplierName;
          newData[ingredient].currentPrice = supplier.prices[0].price; // Default to first price
        }
        return { ...prev, data: newData };
      });
    }
  };

  const handleSort = (column: string) => {
    setS(prev => ({
      ...prev,
      sortColumn: column,
      sortDirection: prev.sortColumn === column && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedIngredients = useMemo(() => {
    const { sortColumn, sortDirection } = s;
    return Object.entries(s.i).sort(([aKey, a], [bKey, b]) => {
      let aValue, bValue;
      switch (sortColumn) {
        case 'ingredient':
          [aValue, bValue] = [aKey, bKey];
          break;
        case 'amount':
          [aValue, bValue] = [parseFloat(a.a), parseFloat(b.a)];
          break;
        case 'currentSupplier':
          [aValue, bValue] = [a.currentSupplier, b.currentSupplier];
          break;
        case 'currentPrice':
          [aValue, bValue] = [a.currentPrice, b.currentPrice];
          break;
        case 'unitVolume':
          [aValue, bValue] = [a.v, b.v];
          break;
        case 'ratio':
          [aValue, bValue] = [a.r, b.r];
          break;
        case 'unitCount':
          [aValue, bValue] = [a.uc, b.uc];
          break;
        case 'cost':
          [aValue, bValue] = [a.c, b.c];
          break;
        default:
          return 0;
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [s.i, s.sortColumn, s.sortDirection]);

  return (
    <Card>
      <CardHeader>
        <h2>Beef Tallow Calculator</h2>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { k: 'o', l: 'Total Oil (kg)', step: '0.1' },
            { k: 'pp', l: 'Package Price (€)', step: '0.01' },
            { k: 'pc', l: 'Package Count', step: '1' },
            { k: 'pac', l: 'Packaging Cost (€)', step: '0.01' }
          ].map(({ k, l, step }) => (
            <div key={k} className="flex items-center">
              <Label htmlFor={k} className="mr-2 w-36">{l}:</Label>
              <Input
                id={k}
                type="number"
                value={s[k]}
                onChange={e => k === 'o' ? h.o(e.target.value) : k === 'pc' ? h.pc(e.target.value) : setS(p => ({ ...p, [k]: Number(e.target.value) }))}
                min="0"
                step={step}
                className="w-full"
              />
            </div>
          ))}
        </div>
        <div className="mb-5">
          <Label htmlFor="r" className="mr-2">Recipe:</Label>
          <select id="r" value={s.cr} onChange={e => h.lr(e.target.value)} className="mr-2 border rounded px-2 py-1">
            {Object.keys(s.r).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <Input type="text" value={s.rn} onChange={e => setS(p => ({ ...p, rn: e.target.value }))} placeholder="New Recipe Name" className="w-36 mr-2" />
          <Button onClick={h.sr}>Save Recipe</Button>
        </div>
        <div className="mb-5">
          <h3 className="mb-2">New Ingredient</h3>
          <div className="grid grid-cols-4 gap-2 mb-2">
            <div className="flex flex-col">
              <Label htmlFor="new-n" className="mb-1">Name</Label>
              <Input
                id="new-n"
                type="text"
                placeholder="Name"
                value={s.n.n}
                onChange={e => setS(prev => ({ ...prev, n: { ...prev.n, n: e.target.value } }))}
                className="w-full"
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="new-v" className="mb-1">Unit Volume</Label>
              <Input
                id="new-v"
                type="number"
                placeholder="Unit Volume"
                value={s.n.v}
                onChange={e => setS(prev => ({ ...prev, n: { ...prev.n, v: Number(e.target.value) } }))}
                className="w-full"
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="new-r" className="mb-1">Ratio</Label>
              <Input
                id="new-r"
                type="number"
                placeholder="Ratio"
                value={s.n.r}
                onChange={e => setS(prev => ({ ...prev, n: { ...prev.n, r: Number(e.target.value) } }))}
                className="w-full"
              />
            </div>
          </div>
          <div className="mb-2">
            <h4 className="mb-1">Suppliers</h4>
            {s.n.suppliers.map((supplier, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                <Input
                  type="text"
                  placeholder="Supplier Name"
                  value={supplier.name}
                  onChange={e => setS(prev => {
                    const newSuppliers = [...prev.n.suppliers];
                    newSuppliers[index].name = e.target.value;
                    return { ...prev, n: { ...prev.n, suppliers: newSuppliers } };
                  })}
                  className="w-full"
                />
                {supplier.prices.map((price, priceIndex) => (
                  <React.Fragment key={priceIndex}>
                    <Input
                      type="number"
                      placeholder="kg"
                      value={price.kg}
                      onChange={e => setS(prev => {
                        const newSuppliers = [...prev.n.suppliers];
                        newSuppliers[index].prices[priceIndex].kg = Number(e.target.value);
                        return { ...prev, n: { ...prev.n, suppliers: newSuppliers } };
                      })}
                      className="w-full"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={price.price}
                      onChange={e => setS(prev => {
                        const newSuppliers = [...prev.n.suppliers];
                        newSuppliers[index].prices[priceIndex].price = Number(e.target.value);
                        return { ...prev, n: { ...prev.n, suppliers: newSuppliers } };
                      })}
                      className="w-full"
                    />
                  </React.Fragment>
                ))}
              </div>
            ))}
            <Button onClick={() => setS(prev => ({ ...prev, n: { ...prev.n, suppliers: [...prev.n.suppliers, { name: '', prices: [{ kg: 1, price: 0 }] }] } }))}>
              Add Supplier
            </Button>
          </div>
          <Button onClick={h.ai}>Add Ingredient</Button>
        </div>
        <table className="w-full border-collapse mb-5">
          <thead>
            <tr>
              {[
                { label: 'Ingredient', key: 'ingredient' },
                { label: 'Amount', key: 'amount' },
                { label: 'Current Supplier', key: 'currentSupplier' },
                { label: 'Current Price/kg (€)', key: 'currentPrice' },
                { label: 'Unit Volume (gr or ml)', key: 'unitVolume' },
                { label: 'Ratio', key: 'ratio' },
                { label: 'Unit Count', key: 'unitCount' },
                { label: 'Cost (€)', key: 'cost' },
                { label: 'Actions', key: 'actions' }
              ].map(({ label, key }) => (
                <th key={key} className="border border-gray-300 p-2">
                  <div className="flex justify-between items-center">
                    {label}
                    {key !== 'actions' && (
                      <button onClick={() => handleSort(key)} className="ml-2">
                        {s.sortColumn === key ? (s.sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedIngredients.map(([k, v]) => (
              <tr key={k}>
                <td className="border border-gray-300 p-2">
                  <Input type="text" value={k} onChange={e => h.updateIngredientName(k, e.target.value)} className="w-full" />
                </td>
                <td className="border border-gray-300 p-2">{v.a}</td>
                <td className="border border-gray-300 p-2">
                  <Select value={v.currentSupplier} onChange={e => h.updateSupplier(k, e.target.value)} className="w-full">
                    {v.suppliers.map(supplier => (
                      <option key={supplier.name} value={supplier.name}>{supplier.name}</option>
                    ))}
                  </Select>
                </td>
                <td className="border border-gray-300 p-2">{v.currentPrice.toFixed(2)} €/kg</td>
                <td className="border border-gray-300 p-2">
                  <Input type="number" value={v.v} onChange={e => u(k, 'v', e.target.value)} min="0" step="0.01" className="w-full" />
                </td>
                <td className="border border-gray-300 p-2">
                  <Input type="number" value={v.r} onChange={e => u(k, 'r', e.target.value)} min="0" step="0.01" className="w-full" />
                </td>
                <td className="border border-gray-300 p-2">{v.uc}</td>
                <td className="border border-gray-300 p-2">{v.c?.toFixed(2) ?? '0.00'}</td>
                <td className="border border-gray-300 p-2">
                  <Button onClick={() => h.ri(k)}>Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <h3 className="mb-2">Profit Analysis</h3>
          <table className="w-full border-collapse">
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
                  <td className="border border-gray-300 p-2">{l}</td>
                  <td className="border border-gray-300 p-2">
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
