import { Injectable } from '@angular/core';
import { GitHubEvent, PetState } from './models';

@Injectable({
  providedIn: 'root'
})
export class PetEngineService {
  
  calculateState(events: GitHubEvent[]): PetState {
    const defaultState: PetState = {
      stage: 'Egg',
      health: 100,
      mood: 'Neutral',
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      daysSinceLastCommit: 999,
      commitStreak: 0,
      recentCommitsCount: 0,
      topLanguage: 'Unknown',
      lastCommitMessage: null,
      posture: 'Stand'
    };

    if (!events || events.length === 0) return defaultState;

    const pushEvents = events.filter(e => e.type === 'PushEvent');
    
    // Calculate total pushes
    const totalPushes = pushEvents.length;
    
    // Sort events by date descending
    const sortedPushes = [...pushEvents].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    let daysSinceLast = 999;
    let lastCommitMessage = null;
    if (sortedPushes.length > 0) {
      const lastPushDate = new Date(sortedPushes[0].created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - lastPushDate.getTime());
      daysSinceLast = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const payload = sortedPushes[0].payload;
      if (payload && Array.isArray(payload['commits']) && payload['commits'].length > 0) {
        lastCommitMessage = (payload['commits'][0] as Record<string, unknown>)['message'] as string;
      }
    }

    // Calculate streak (very naive: group by day, count consecutive days back from today or yesterday)
    let streak = 0;
    const daysWithCommits = new Set<string>();
    for (const push of pushEvents) {
      const d = new Date(push.created_at);
      const dateStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      daysWithCommits.add(dateStr);
    }
    
    // check backwards from today
    // allow yesterday to keep streak active
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let currentStreak = 0;
    const inspectingDate = new Date();
    
    // If today exists, start counting from today, else try yesterday
    const todayStr = `${inspectingDate.getFullYear()}-${inspectingDate.getMonth()}-${inspectingDate.getDate()}`;
    const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
    
    if (daysWithCommits.has(todayStr) || daysWithCommits.has(yesterdayStr)) {
        let dateWalker = new Date();
        if (!daysWithCommits.has(todayStr) && daysWithCommits.has(yesterdayStr)) {
            dateWalker = yesterday;
        }
        
        while (true) {
            const str = `${dateWalker.getFullYear()}-${dateWalker.getMonth()}-${dateWalker.getDate()}`;
            if (daysWithCommits.has(str)) {
                currentStreak++;
                dateWalker.setDate(dateWalker.getDate() - 1);
            } else {
                break;
            }
        }
    }
    streak = currentStreak;

    // Determine XP / Level
    // rough estimate: 1 push = 10 XP, formula Lvl = Math.floor(sqrt(XP / 10)) + 1
    const xp = totalPushes * 15 + streak * 50;
    const level = Math.floor(Math.sqrt(xp / 20)) + 1;
    const xpToNextLevel = Math.pow(level, 2) * 20;

    // Determine Health
    // Health degrades by 10 per day without commits
    let health = Math.max(0, 100 - (daysSinceLast * 15));
    if (daysSinceLast === 0) health = 100;
    
    // Stage
    let stage: PetState['stage'] = 'Egg';
    if (level >= 10) stage = 'Elder';
    else if (level >= 6) stage = 'Adult';
    else if (level >= 3) stage = 'Teen';
    else if (level >= 2) stage = 'Baby';

    // Mood
    let mood: PetState['mood'] = 'Neutral';
    if (health === 0) mood = 'Dead';
    else if (health < 40) mood = 'Sad';
    else if (streak > 2) mood = 'Ecstatic';
    else if (health > 70) mood = 'Happy';

    return {
      stage,
      health,
      mood,
      posture: 'Stand',
      level,
      xp,
      xpToNextLevel,
      daysSinceLastCommit: daysSinceLast,
      commitStreak: streak,
      recentCommitsCount: totalPushes,
      topLanguage: 'Code', 
      lastCommitMessage
    };
  }
}
