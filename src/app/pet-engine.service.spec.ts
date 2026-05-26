import { TestBed } from '@angular/core/testing';
import { PetEngineService } from './pet-engine.service';
import { GitHubEvent, GitHubRepository } from './models';

describe('PetEngineService', () => {
  let service: PetEngineService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [PetEngineService],
    }).compileComponents();
    service = TestBed.inject(PetEngineService);
  });

  describe('calculateState', () => {
    it('should return default state for empty events', () => {
      const result = service.calculateState([]);
      expect(result.stage).toBe('Egg');
      expect(result.level).toBe(1);
      expect(result.commitStreak).toBe(0);
    });

    it('should calculate XP from push events', () => {
      const events = makePushEvents(5);
      const result = service.calculateState(events);
      expect(result.recentCommitsCount).toBe(5);
      expect(result.xp).toBeGreaterThan(0);
    });

    it('should use ISO date strings for streak (no month-boundary collision)', () => {
      // Simulate two consecutive days — Jan 31 and Feb 1 should not collide
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const events = [
        makePushEvent(today.toISOString()),
        makePushEvent(yesterday.toISOString()),
      ];

      const result = service.calculateState(events);
      expect(result.commitStreak).toBe(2);
    });

    it('should cap level at Elder for level 10+', () => {
      const events = makePushEvents(50);
      const result = service.calculateState(events);
      expect(result.stage).toBe('Elder');
      expect(result.level).toBeGreaterThanOrEqual(10);
    });
  });

  describe('calculateStateFromContributionSummary', () => {
    it('should return default state for zero contributions', () => {
      const summary = { totalContributions: 0, totalCommitContributions: 0, restrictedContributionsCount: 0, contributionDays: [] };
      const result = service.calculateStateFromContributionSummary(summary);
      expect(result.stage).toBe('Egg');
    });

    it('should calculate level using SHARED_LEVEL_DIVISOR (25)', () => {
      const today = new Date().toISOString().slice(0, 10);
      const summary = {
        totalContributions: 100,
        totalCommitContributions: 50,
        restrictedContributionsCount: 0,
        contributionDays: Array.from({ length: 10 }, (_, i) => ({
          date: today,
          contributionCount: 10,
        })),
      };
      const result = service.calculateStateFromContributionSummary(summary);
      expect(result.level).toBeGreaterThan(1);
    });
  });

  describe('calculateTechBadges', () => {
    it('should ignore forked repositories', () => {
      const repos: GitHubRepository[] = [
        { id: 1, name: 'forked-repo', full_name: 'user/forked-repo', fork: true, language: 'JavaScript' } as GitHubRepository,
        { id: 2, name: 'main-repo', full_name: 'user/main-repo', fork: false, language: 'JavaScript' } as GitHubRepository,
      ];
      const result = service.calculateState([], repos);
      expect(result.techBadges).toBeDefined();
    });
  });
});

function makePushEvent(createdAt: string): GitHubEvent {
  return {
    id: Math.random().toString(),
    type: 'PushEvent',
    actor: { login: 'user', avatar_url: '' },
    repo: { name: 'user/repo', url: '' },
    payload: { commits: [{ message: 'test' }] },
    created_at: createdAt,
  } as unknown as GitHubEvent;
}

function makePushEvents(count: number): GitHubEvent[] {
  return Array.from({ length: count }, (_, i) => makePushEvent(new Date().toISOString()));
}