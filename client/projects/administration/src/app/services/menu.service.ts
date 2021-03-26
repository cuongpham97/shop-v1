import { Injectable } from '@angular/core';

@Injectable()
export class MenuService {
  
  getMenu(): Array<any> {
    return [ 
      { name: '', path: '/' },
      { name: 'Dashboard', path: '/dashboard', children: [] },
      { 
        name: 'Categories', path: '/categories', children: [
          { name: 'New category', path: '/new', children: [] },
          { name: 'Edit category', path: '/edit', children: [] }
        ] 
      },
      { 
        name: 'Products', path: '/products', children: [
          { name: 'New product', path: '/new', children: [] },
          { name: 'Edit product', path: '/edit', children: [] }
        ] 
      },
      { 
        name: 'Orders', path: '/orders', children: [
          { name: 'New order', path: '/new', children: [] },
          { name: 'Edit order', path: '/edit', children: [] }
        ] 
      },
      { name: 'Customers', path: '/customers', children: [] },
    ];
  }
}
