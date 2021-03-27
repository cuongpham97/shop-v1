import { Injectable } from '@angular/core';

@Injectable()
export class MenuService {
  
  getMenu(): Array<any> {
    return [ 
      { name: 'dashboard', path: '/dashboard', link: true, children: [] },
      {
        name: 'catalog', path: '/catalog', link: false, children: [
          { 
            name: 'categories', path: '/categories', link: true,  children: [
              { name: 'new category', path: '/new', link: true, children: [] },
              { name: 'edit category', path: '/edit', link: true, children: [] }
            ] 
          },
          { 
            name: 'products', path: '/products', link: true, children: [
              { name: 'new product', path: '/new', link: true, children: [] },
              { name: 'edit product', path: '/edit', link: true, children: [] }
            ] 
          },
        ]
      }, 
      {
        name: 'customers', path: '/customers', link: false, children: [
          { 
            name: 'customers', path: '/customers', link: true,  children: [
              { name: 'new customer', path: '/new', link: true, children: [] },
              { name: 'edit customer', path: '/edit', link: true, children: [] }
            ] 
          },
          { 
            name: 'customer groups', path: '/customer-groups', link: true, children: [
              { name: 'new customer group', path: '/new', link: true, children: [] },
              { name: 'edit customer-group', path: '/edit', link: true, children: [] }
            ] 
          },
        ]
      }
    ];
  }
}
