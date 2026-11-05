import { Component, signal } from '@angular/core'
import { JsonPipe } from '@angular/common'

@Component({
  selector: 'app-lazy',
  template: `<h4>lazy route</h4><pre id="lazy-result">{{ r() | json }}</pre>`,
  imports: [JsonPipe],
})
export class Lazy {
  r = signal<unknown>(null)
  constructor() {
    import('./probe').then((m) => m.runProbe('lazy-route')).then((x) => this.r.set(x))
  }
}
