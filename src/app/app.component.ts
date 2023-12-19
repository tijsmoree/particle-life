import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';

const array = (n: number) => new Array(n).fill(0);

const SIZE = 500;

const DMAX = 100;
const ALPHA = 0.7;
const BETA = 0.2;

const COLORS = ['red', 'chartreuse', 'cornflowerblue', 'yellow'];

class Particle {
  constructor(
    public color: number,
    public xx = Math.random() * SIZE,
    public xy = Math.random() * SIZE,
    public vx = 0,
    public vy = 0,
  ) {}
}

const FORCES = [
  [0.5, 1, 0, -1],
  [-1, 0.5, 1, 0],
  [0, -1, 0.5, 1],
  [1, 0, -1, 0.5],
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  @ViewChild('canvas', { static: true })
  private readonly canvas!: ElementRef<HTMLCanvasElement>;

  readonly particles = [
    ...array(300).map(() => new Particle(0)),
    ...array(300).map(() => new Particle(1)),
    ...array(300).map(() => new Particle(2)),
    ...array(300).map(() => new Particle(3)),
  ];

  size = SIZE;

  ngOnInit(): void {
    this.resize();

    let last = 0;
    const animate = () => {
      requestAnimationFrame(t => {
        this.update((t - last) / 1e3);
        last = t;

        animate();
      });
    };
    animate();
  }

  @HostListener('window:resize')
  @HostListener('window:zoom')
  resize(): void {
    const ratio = devicePixelRatio || 1;
    this.size = ratio * SIZE;

    const canvas = this.canvas.nativeElement;

    if (canvas) {
      canvas.style.width = `800px`;
      canvas.style.height = `800px`;
      canvas.width = this.size;
      canvas.height = this.size;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(ratio, ratio);
      }
    }
  }

  private update(dt: number): void {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      let ax = 0;
      let ay = 0;

      for (let j = 0; j < this.particles.length; j++) {
        if (i === j) {
          continue;
        }

        const p = this.particles[j];

        const dxx = p.xx - particle.xx;
        const dx =
          dxx < -0.5 * SIZE ? dxx + SIZE : dxx > 0.5 * SIZE ? dxx - SIZE : dxx;

        const dxy = p.xy - particle.xy;
        const dy =
          dxy < -0.5 * SIZE ? dxy + SIZE : dxy > 0.5 * SIZE ? dxy - SIZE : dxy;

        if (dx < -DMAX || dx > DMAX || dy < -DMAX || dy > DMAX) {
          continue;
        }

        const d = Math.sqrt(dx * dx + dy * dy);
        const r = d / DMAX;

        const maxForce = FORCES[particle.color][p.color];

        const force =
          r < BETA
            ? r / BETA - 1
            : r < 1
              ? maxForce * (1 - Math.abs(2 * r - 1 - BETA) / (1 - BETA))
              : 0;

        ax += ((DMAX * dx) / d) * force;
        ay += ((DMAX * dy) / d) * force;
      }

      particle.vx *= ALPHA;
      particle.vx += ax * dt;
      particle.xx += particle.vx * dt + SIZE;
      particle.xx %= SIZE;

      particle.vy *= ALPHA;
      particle.vy += ay * dt;
      particle.xy += particle.vy * dt + SIZE;
      particle.xy %= SIZE;
    }

    const ctx = this.canvas.nativeElement.getContext('2d')!;

    ctx.clearRect(0, 0, this.size, this.size);

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      ctx.fillStyle = COLORS[particle.color];
      ctx.fillRect(particle.xx, particle.xy, 1, 1);
    }
  }
}
