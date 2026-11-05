import { Routes } from '@angular/router'

export const routes: Routes = [{ path: 'lazy', loadComponent: () => import('./lazy').then((m) => m.Lazy) }]
