import React, { ReactNode } from 'react';

export const Card = ({ children, className = "" }: { children: ReactNode, className?: string }) => 
  <div className={`bg-white shadow rounded-lg p-6 ${className}`}>{children}</div>;

export const CardHeader = ({ children, className = "" }: { children: ReactNode, className?: string }) => 
  <div className={`mb-4 ${className}`}>{children}</div>;

export const CardContent = ({ children, className = "" }: { children: ReactNode, className?: string }) => 
  <div className={className}>{children}</div>;

export const Button = ({ children, className = "", ...props }: { children: ReactNode, className?: string, [key: string]: any }) => 
  <button className={`bg-blue-500 text-white px-4 py-2 rounded ${className}`} {...props}>{children}</button>;

export const Input = ({ className = "", ...props }: { className?: string, [key: string]: any }) => 
  <input className={`border rounded px-2 py-1 ${className}`} {...props} />;

export const Label = ({ children, className = "", ...props }: { children: ReactNode, className?: string, [key: string]: any }) => 
  <label className={`block mb-2 ${className}`} {...props}>{children}</label>;

export const Select = ({ className = "", ...props }: { className?: string, [key: string]: any }) => 
  <select className={`border rounded px-2 py-1 ${className}`} {...props} />;
