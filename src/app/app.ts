import { Component, signal } from '@angular/core'
import { JsonPipe } from '@angular/common'
import { RouterLink, RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-root',
  imports: [JsonPipe, RouterLink, RouterOutlet],
  template: `
    <h3>supabase-js #2768 on Angular</h3>
    <h4>dynamic import from root component (late-loaded chunk)</h4>
    <pre id="root-result">{{ r() | json }}</pre>
    <a routerLink="/lazy">open lazy route</a>
    <router-outlet />
  `,
})
export class App {
  r = signal<unknown>(null)
  constructor() {
    // supabase-js is NOT in the main bundle: it loads in its own chunk after bootstrap.
    setTimeout(async () => this.r.set(await (await import('./probe')).runProbe('root-dynamic')), 500)
  }
}
