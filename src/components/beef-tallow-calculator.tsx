"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardContent, Button, Input, Label, Select } from './ui-components';
import { initData } from '@/lib/recipe';

const TABLE_HEADERS = [
  { label: 'Ingredient', key: 'ingredient' },
  { label: 'Amount', key: 'amount' },
  { label: 'Current Supplier', key: 'currentSupplier' },
  { label: 'Current Price/kg (€)', key: 'currentPrice' },
  { label: 'Unit Price (€)', key: 'unitPrice' },
  { label: 'Unit Volume (gr or ml)', key: 'unitVolume' },
  { label: 'Ratio', key: 'ratio' },
  { label: 'Unit Count', key: 'unitCount' },
  { label: 'Total Unit Cost (€)', key: 'totalUnitCost' },
  { label: 'Cost (€)', key: 'cost' },
  { label: 'Actions', key: 'actions' }
];

const PROFIT_ANALYSIS_ITEMS = [
  { k: 'pc', l: 'Number of Packages' },
  { k: 'ic', l: 'Ingredient Cost (€)' },
  { k: 'pac', l: 'Packaging Cost (€)' },
  { k: 'tc', l: 'Total Cost (€)' },
  { k: 'r', l: 'Revenue (€)' },
  { k: 'pf', l: 'Profit (€)' },
  { k: 'pp', l: 'Profit Percentage' },
  { k: 'tucs', l: 'Total Unit Cost Sum (€)', f: (v: number) => v.toFixed(2) },
  { k: 'pftucs', l: 'Profit from Total Unit Cost Sum (€)', f: (v: number) => v.toFixed(2) },
  { k: 'pptucs', l: 'Profit Percentage from Total Unit Cost Sum', f: (v: number) => `${v.toFixed(2)}%` }
];

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
    ucs: number; // Add this line for unit cost sum
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
  newIngredient: {
    name: string;
    suppliers: Supplier[];
    unitVolume: number;
    ratio: number;
  };
}

const BeefTallowCalculator = () => {
  const [state, setState] = useState<State>({ 
    o: 2, pp: 23, pc: 8, pac: 0.36, 
    d: initData, 
    i: {}, 
    p: { pc: 0, ic: 0, pac: 0, tc: 0, r: 0, pf: 0, pp: 0 }, 
    n: { n: '', suppliers: [{ name: '', prices: [{ kg: 1, price: 0 }] }], v: 0, r: 0 }, 
    rn: '', 
    r: { 'Default': initData }, 
    cr: 'Default',
    sortColumn: '',
    sortDirection: 'asc',
    newIngredient: { name: '', suppliers: [{ name: '', prices: [{ kg: 1, price: 0 }] }], unitVolume: 0, ratio: 0 }
  });

  const calculateIngredients = (oilAmount: number, ingredients: Record<string, Ingredient>): Record<string, Ingredient> => 
    Object.entries(ingredients).reduce((a: Record<string, Ingredient>, [k, v]) => {
      const g = v.r * oilAmount;
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

  const calculateProfit = (ingredients: Record<string, Ingredient>, packageCount: number, packagePrice: number, packagingCost: number) => {
    const ingredientCost = Object.values(ingredients).reduce((sum, { c }) => sum + (c ?? 0), 0);
    const packagingTotalCost = packageCount * packagingCost;
    const totalCost = ingredientCost + packagingTotalCost;
    const revenue = packageCount * packagePrice;
    const profit = revenue - totalCost;
    const totalUnitCostSum = Object.values(ingredients).reduce((sum, { v, uc, currentPrice }) => {
      const unitPrice = (currentPrice ?? 0) * v / 1000;
      return sum + (unitPrice * (uc ?? 0));
    }, 0);
    const profitFromTotalUnitCostSum = revenue - totalUnitCostSum;
    return { 
      pc: packageCount, 
      ic: ingredientCost, 
      pac: packagingTotalCost, 
      tc: totalCost, 
      r: revenue, 
      pf: profit, 
      pp: revenue > 0 ? (profit / revenue * 100) : 0,
      tucs: totalUnitCostSum,
      pftucs: profitFromTotalUnitCostSum,
      pptucs: revenue > 0 ? (profitFromTotalUnitCostSum / revenue * 100) : 0
    };
  };

  useEffect(() => {
    const i = calculateIngredients(state.o, state.d);
    setState(p => ({ ...p, i, p: calculateProfit(i, p.pc, p.pp, p.pac) }));
  }, [state.o, state.pp, state.pc, state.pac, state.d]);

  const updateIngredient = (key: string, field: string, value: string) => setState(prevState => {
    const updatedIngredient = { ...prevState.d[key], [field]: Number(value) };
    return { ...prevState, d: { ...prevState.d, [key]: updatedIngredient } };
  });

  const handlers = {
    updateOilAmount: (value: string) => { 
      const newAmount = Number(value); 
      setState(prev => ({ ...prev, o: newAmount, pc: Math.floor(newAmount * 4) })); 
    },
    updatePackageCount: (value: string) => { 
      const newCount = Number(value); 
      setState(prev => ({ ...prev, pc: newCount, o: newCount / 4 })); 
    },
    addIngredient: () => {
      const { n, suppliers, v, r } = state.n;
      if (n && suppliers.length > 0 && v && r) {
        setState(prev => ({ 
          ...prev, 
          d: { ...prev.d, [n]: { suppliers, v: Number(v), r: Number(r) } }, 
          n: { n: '', suppliers: [{ name: '', prices: [{ kg: 1, price: 0 }] }], v: 0, r: 0 } 
        }));
      }
    },
    removeIngredient: (key: string) => setState(prev => { 
      const newD = { ...prev.d }; 
      delete newD[key]; 
      return { ...prev, d: newD }; 
    }),
    saveRecipe: () => state.rn && setState(prev => ({ 
      ...prev, 
      r: { ...prev.r, [prev.rn]: prev.d }, 
      rn: '' 
    })),
    loadRecipe: (name: string) => setState(prev => ({ ...prev, d: prev.r[name], cr: name })),
    updateIngredientName: (oldName: string, newName: string) => {
      setState(prev => {
        const newD = { ...prev.d };
        newD[newName] = newD[oldName];
        delete newD[oldName];
        return { ...prev, d: newD };
      });
    },
    updateSupplier: (ingredient: string, supplierName: string) => {
      setState(prev => {
        const newD = { ...prev.d };
        const supplier = newD[ingredient].suppliers.find(s => s.name === supplierName);
        if (supplier) {
          newD[ingredient].currentSupplier = supplierName;
          newD[ingredient].currentPrice = supplier.prices[0].price; // Default to first price
        }
        return { ...prev, d: newD };
      });
    }
  };

  const handleSort = (column: string) => {
    setState(prev => ({
      ...prev,
      sortColumn: column,
      sortDirection: prev.sortColumn === column && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  };

  const TableHeader = ({ label, sortKey }: { label: string; sortKey: string }) => (
    <th key={sortKey} className="border border-gray-300 p-2">
      <div className="flex justify-between items-center">
        {label}
        {sortKey !== 'actions' && (
          <button onClick={() => handleSort(sortKey)} className="ml-2">
            {state.sortColumn === sortKey ? (state.sortDirection === 'asc' ? '↑' : '↓') : '↕'}
          </button>
        )}
      </div>
    </th>
  );

  const sortedIngredients = useMemo(() => {
    const { sortColumn, sortDirection } = state;
    return Object.entries(state.i).sort(([aKey, a], [bKey, b]) => {
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
  }, [state.i, state.sortColumn, state.sortDirection]);

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
                value={state[k]}
                onChange={e => k === 'o' ? handlers.updateOilAmount(e.target.value) : k === 'pc' ? handlers.updatePackageCount(e.target.value) : setState(p => ({ ...p, [k]: Number(e.target.value) }))}
                min="0"
                step={step}
                className="w-full"
              />
            </div>
          ))}
        </div>
        <div className="mb-5">
          <Label htmlFor="r" className="mr-2">Recipe:</Label>
          <select id="r" value={state.cr} onChange={e => handlers.loadRecipe(e.target.value)} className="mr-2 border rounded px-2 py-1">
            {Object.keys(state.r).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <Input type="text" value={state.rn} onChange={e => setState(p => ({ ...p, rn: e.target.value }))} placeholder="New Recipe Name" className="w-36 mr-2" />
          <Button onClick={handlers.saveRecipe}>Save Recipe</Button>
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
                value={state.n.n}
                onChange={e => setState(prev => ({ ...prev, n: { ...prev.n, n: e.target.value } }))}
                className="w-full"
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="new-v" className="mb-1">Unit Volume</Label>
              <Input
                id="new-v"
                type="number"
                placeholder="Unit Volume"
                value={state.n.v}
                onChange={e => setState(prev => ({ ...prev, n: { ...prev.n, v: Number(e.target.value) } }))}
                className="w-full"
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="new-r" className="mb-1">Ratio</Label>
              <Input
                id="new-r"
                type="number"
                placeholder="Ratio"
                value={state.n.r}
                onChange={e => setState(prev => ({ ...prev, n: { ...prev.n, r: Number(e.target.value) } }))}
                className="w-full"
              />
            </div>
          </div>
          <div className="mb-2">
            <h4 className="mb-1">Suppliers</h4>
            {state.n.suppliers.map((supplier, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                <Input
                  type="text"
                  placeholder="Supplier Name"
                  value={supplier.name}
                  onChange={e => setState(prev => {
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
                      onChange={e => setState(prev => {
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
                      onChange={e => setState(prev => {
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
            <Button onClick={() => setState(prev => ({ ...prev, n: { ...prev.n, suppliers: [...prev.n.suppliers, { name: '', prices: [{ kg: 1, price: 0 }] }] } }))}>
              Add Supplier
            </Button>
          </div>
          <Button onClick={handlers.addIngredient}>Add Ingredient</Button>
        </div>
        <div className="mb-5">
          <h3 className="mb-2">Profit Analysis</h3>
          <table className="w-full border-collapse">
            <tbody>
              {PROFIT_ANALYSIS_ITEMS.map((item) => (
                <tr key={item.k}>
                  <td className="border border-gray-300 p-2">{item.l}</td>
                  <td className="border border-gray-300 p-2">
                    {item.f ? item.f(state.p[item.k] ?? 0) : (state.p[item.k]?.toFixed(2) ?? '0.00')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <table className="w-full border-collapse mb-5">
          <thead>
            <tr>
              {TABLE_HEADERS.map(({ label, key }) => (
                <TableHeader key={key} label={label} sortKey={key} />
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedIngredients.map(([k, v]) => (
              <tr key={k}>
                <td className="border border-gray-300 p-2">
                  <Input type="text" value={k} onChange={e => handlers.updateIngredientName(k, e.target.value)} className="w-full" />
                </td>
                <td className="border border-gray-300 p-2">{v.a}</td>
                <td className="border border-gray-300 p-2">
                  <Select value={v.currentSupplier} onChange={e => handlers.updateSupplier(k, e.target.value)} className="w-full">
                    {v.suppliers.map(supplier => (
                      <option key={supplier.name} value={supplier.name}>{supplier.name}</option>
                    ))}
                  </Select>
                </td>
                <td className="border border-gray-300 p-2">{v.currentPrice?.toFixed(2) ?? '0.00'} €/kg</td>
                <td className="border border-gray-300 p-2">{((v.currentPrice ?? 0) * v.v / 1000).toFixed(2)} €</td>
                <td className="border border-gray-300 p-2">
                  <Input type="number" value={v.v} onChange={e => updateIngredient(k, 'v', e.target.value)} min="0" step="0.01" className="w-full" />
                </td>
                <td className="border border-gray-300 p-2">
                  <Input type="number" value={v.r} onChange={e => updateIngredient(k, 'r', e.target.value)} min="0" step="0.01" className="w-full" />
                </td>
                <td className="border border-gray-300 p-2">{v.uc}</td>
                <td className="border border-gray-300 p-2">{(((v.currentPrice ?? 0) * v.v / 1000) * (v.uc ?? 0)).toFixed(2)} €</td>
                <td className="border border-gray-300 p-2">{v.c?.toFixed(2) ?? '0.00'}</td>
                <td className="border border-gray-300 p-2">
                  <Button onClick={() => handlers.removeIngredient(k)}>Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default BeefTallowCalculator;
