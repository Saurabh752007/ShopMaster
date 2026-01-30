
import React from 'react';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum AppView {
  LOGIN = 'LOGIN',
  OVERVIEW = 'OVERVIEW',
  NEW_SALE = 'NEW_SALE',
  BILLING = 'BILLING',
  PRODUCTS = 'PRODUCTS',
  EMPLOYEES = 'EMPLOYEES',
  CUSTOMERS = 'CUSTOMERS',
  EXPORT = 'EXPORT',
  PROFILE = 'PROFILE',
  CONTENT_PAGE = 'CONTENT_PAGE'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  category: string;
}

export interface Bill {
  id: string;
  date: string;
  customer: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Cancelled';
  items: number;
  gstDetails: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  loginCode: string;
  permissions: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  shopName: string;
  address: string;
  notifications: boolean;
  twoFactor: boolean;
  role: UserRole;
}

export interface ContentPage {
  title: string;
  content: React.ReactNode;
}
