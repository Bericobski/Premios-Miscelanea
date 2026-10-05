import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { Category } from '../../../classes/category';
import { Auth } from '../../../services/auth';
import { AwardCategoryService } from '../../../services/award-category.service';
import { GameVoteStat, VoteService } from '../../../services/vote.service';

Chart.register(...registerables);

const CHART_TOP_N = 5;

@Component({
  selector: 'app-vote-results',
  standalone: true,
  templateUrl: './vote-results.html',
  styleUrl: './vote-results.scss',
})
export class VoteResults implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;

  readonly categories = signal<Category[]>([]);
  // null = "All": votes from every award category combined.
  readonly selectedCategoryId = signal<number | null>(null);
  // Always most voted first, as the API returns it.
  readonly stats = signal<GameVoteStat[]>([]);
  readonly sortDesc = signal<boolean>(true);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly tableRows = computed(() => (this.sortDesc() ? this.stats() : [...this.stats()].reverse()));
  // The chart always shows the top games, whichever way the table is sorted.
  readonly chartRows = computed(() => this.stats().slice(0, CHART_TOP_N));

  private chart?: Chart<'bar'>;
  private requestId = 0;

  constructor(
    private voteService: VoteService,
    private awardCategoryService: AwardCategoryService,
    authService: Auth
  ) {
    this.awardCategoryService.getActiveCategories().subscribe((categories) => {
      this.categories.set(categories);
    });

    // The stats endpoint needs a token, so wait for the signed-in profile before loading,
    // then reload whenever the selected category changes.
    const profile = toSignal(authService.profile$, { initialValue: null });
    effect(() => {
      const categoryId = this.selectedCategoryId();
      if (profile()) {
        this.loadStats(categoryId);
      }
    });

    effect(() => {
      const rows = this.chartRows();
      if (!this.chart) return;
      this.chart.data.labels = rows.map((row) => row.title);
      this.chart.data.datasets[0].data = rows.map((row) => row.votes);
      this.chart.update();
    });
  }

  ngAfterViewInit(): void {
    const rows = this.chartRows();
    this.chart = new Chart(this.chartCanvas!.nativeElement, {
      type: 'bar',
      data: {
        labels: rows.map((row) => row.title),
        datasets: [
          {
            label: 'Votes',
            data: rows.map((row) => row.votes),
            backgroundColor: 'rgba(92, 107, 192, 0.7)',
            borderColor: 'rgba(159, 168, 218, 1)',
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 0, color: '#9fa8da' },
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
          },
          y: {
            ticks: { color: '#e0e0e0' },
            grid: { display: false },
          },
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
  }

  toggleSort(): void {
    this.sortDesc.update((desc) => !desc);
  }

  selectedCategoryName(): string {
    const id = this.selectedCategoryId();
    return id === null ? 'All categories' : this.categories().find((c) => c.id === id)?.name ?? '';
  }

  private async loadStats(categoryId: number | null): Promise<void> {
    // Ignore responses from older requests if the user switches category quickly.
    const requestId = ++this.requestId;
    this.loading.set(true);
    this.error.set(null);

    try {
      const stats = await this.voteService.getVoteStats(categoryId);
      if (requestId !== this.requestId) return;
      this.stats.set(stats);
    } catch (error) {
      if (requestId !== this.requestId) return;
      console.error('Failed to load vote results', error);
      this.stats.set([]);
      this.error.set(
        error instanceof HttpErrorResponse && error.status === 403
          ? 'Only admins can see vote results.'
          : 'Something went wrong loading the vote results. Please try again.'
      );
    } finally {
      if (requestId === this.requestId) this.loading.set(false);
    }
  }
}
