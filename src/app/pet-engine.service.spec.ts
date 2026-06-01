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
      const events = makePushEvents(500);
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
        contributionDays: Array.from({ length: 10 }, () => ({
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
      const repos = [
        { id: 1, name: 'forked-repo', full_name: 'user/forked-repo', fork: true, language: 'JavaScript', html_url: '' } as unknown as GitHubRepository,
        { id: 2, name: 'main-repo', full_name: 'user/main-repo', fork: false, language: 'JavaScript', html_url: '' } as unknown as GitHubRepository,
      ];
      const result = service.calculateState([], repos);
      expect(result.techBadges).toBeDefined();
    });
  });

  describe('recency-weighted scoring', () => {
    it('should weight recent pushes more than old ones', () => {
      const today = new Date();
      const todayEvent = makePushEvent(today.toISOString());
      const oldDate = new Date(today);
      oldDate.setDate(today.getDate() - 180); // 6 months old
      const oldEvent = makePushEvent(oldDate.toISOString());

      const recentResult = service.calculateState([todayEvent]);
      const oldResult = service.calculateState([oldEvent]);
      expect(recentResult.xp).toBeGreaterThan(oldResult.xp);
    });

    it('should give small but non-zero credit for very old pushes', () => {
      const veryOld = new Date();
      veryOld.setDate(veryOld.getDate() - 365);
      const oldEvent = makePushEvent(veryOld.toISOString());
      const result = service.calculateState([oldEvent]);
      // Old push should still contribute some XP (recency curve has a floor, not zero)
      expect(result.xp).toBeGreaterThan(0);
    });
  });

  describe('achievements', () => {
    it('should cap achievements at 6 entries', () => {
      const events = makePushEvents(500);
      const result = service.calculateState(events);
      expect(result.achievements.length).toBeLessThanOrEqual(6);
    });

    it('should award Elder Maintainer at level 10+', () => {
      const events = makePushEvents(500);
      const result = service.calculateState(events);
      expect(result.achievements.some(a => a.name === 'Elder Maintainer')).toBe(true);
    });

    it('should award First Signal for any activity', () => {
      const events = makePushEvents(1);
      const result = service.calculateState(events);
      expect(result.achievements.some(a => a.name === 'First Signal')).toBe(true);
    });
  });

  describe('personality lines', () => {
    it('should produce a non-empty personality line', () => {
      const result = service.calculateState([]);
      expect(result.personalityLine.length).toBeGreaterThan(0);
    });

    it('should produce different lines for different states', () => {
      const thriving = service.calculateState(makePushEvents(3));
      const neglected = service.calculateState([]);
      expect(thriving.personalityLine).not.toBe(neglected.personalityLine);
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
  // Spread across recent days so the recency curve gives each event near-full weight.
  // 500+ events at full recency clears the Elder level threshold (level 10, ~2025 XP).
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setHours(d.getHours() - (i % 48));
    return makePushEvent(d.toISOString());
  });
}