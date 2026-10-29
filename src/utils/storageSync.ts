import { StudioProject, StudioScene } from '../types/studio';
import { POSE_PRESETS } from './riggingLogic';

const STORAGE_KEY_PROJECTS = 'autodraft_projects_v2';
const STORAGE_KEY_CURRENT_ID = 'autodraft_current_project_id';
const STORAGE_KEY_OFFLINE_OVERRIDE = 'autodraft_force_offline_mode';

export const DEFAULT_SAMPLE_PROJECTS: StudioProject[] = [
  {
    id: 'proj_village_story',
    title: 'Village Kirana & Walk Tale',
    aspectRatio: '16:9',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 600000,
    fps: 24,
    currentSceneId: 'scene_village_walk',
    scenes: [
      {
        id: 'scene_village_walk',
        name: 'Village Walk Scene',
        duration: 8.0,
        backgroundColor: '#e0f2fe',
        backgroundTemplate: 'village_exterior',
        elements: [
          {
            id: 'elem_char_ramesh',
            type: 'character',
            name: 'Ramesh (Village Man)',
            x: 200,
            y: 220,
            scale: 1.0,
            rotation: 0,
            zIndex: 10,
            activeMotionClipId: 'village_walk',
            activeMotionSpeed: 1.0,
            characterData: {
              id: 'char_ramesh',
              name: 'Ramesh',
              skinColor: '#d99763',
              headStyle: 'village_man',
              hairStyle: 'classic_fade',
              facialHair: 'thick_mustache',
              clothesStyle: 'lungi_shirt',
              shirtColor: '#10b981',
              bottomColor: '#e0f2fe',
              expression: 'smile',
              flipX: false,
              scale: 1,
              pose: POSE_PRESETS.walkA.joints,
            },
          },
          {
            id: 'elem_char_elder',
            type: 'character',
            name: 'Pandit Ji (Village Elder)',
            x: 520,
            y: 220,
            scale: 1.0,
            rotation: 0,
            zIndex: 9,
            activeMotionClipId: 'namaste_greeting',
            activeMotionSpeed: 0.9,
            characterData: {
              id: 'char_pandit',
              name: 'Pandit Ji',
              skinColor: '#e5a575',
              headStyle: 'village_elder',
              hairStyle: 'village_turban',
              facialHair: 'elder_white_beard',
              clothesStyle: 'dhoti_kurta',
              shirtColor: '#f97316',
              bottomColor: '#fef3c7',
              expression: 'smile',
              flipX: true,
              scale: 1,
              pose: POSE_PRESETS.namaste.joints,
            },
          },
          {
            id: 'elem_prop_cart',
            type: 'prop',
            name: 'Bullock Cart / Chai Stall',
            x: 750,
            y: 350,
            scale: 1.0,
            rotation: 0,
            zIndex: 5,
            propIcon: '🚜',
            propColor: '#b45309',
          },
        ],
        audioTracks: [
          {
            id: 'audio_birds',
            name: 'Morning Birds Chirp',
            type: 'sfx',
            category: 'animal',
            startTime: 0,
            duration: 8,
            volume: 0.6,
            soundType: 'bird',
          },
          {
            id: 'audio_narration',
            name: 'Ramesh: "Namaste Pandit Ji!"',
            type: 'tts',
            category: 'human',
            startTime: 1.5,
            duration: 3,
            volume: 1.0,
            text: 'Namaste Pandit Ji, aaj subah ka mausam kitna suhana hai!',
          },
        ],
      },
      {
        id: 'scene_kirana_shop',
        name: 'Kirana Shop Closed',
        duration: 6.0,
        backgroundColor: '#fef3c7',
        backgroundTemplate: 'kirana_shop',
        elements: [
          {
            id: 'elem_char_shopkeeper',
            type: 'character',
            name: 'Dukandar Kaka',
            x: 380,
            y: 220,
            scale: 1.0,
            rotation: 0,
            zIndex: 8,
            activeMotionClipId: 'tea_chai_sip',
            characterData: {
              id: 'char_dukandar',
              name: 'Dukandar Kaka',
              skinColor: '#c88752',
              headStyle: 'village_elder',
              hairStyle: 'elder_white',
              facialHair: 'rajput_curled',
              clothesStyle: 'farmer_vest',
              shirtColor: '#ffffff',
              bottomColor: '#fbbf24',
              expression: 'neutral',
              flipX: false,
              scale: 1,
              pose: POSE_PRESETS.sittingChai.joints,
            },
          },
        ],
        audioTracks: [
          {
            id: 'audio_shutter',
            name: 'Metal Shutter Roll',
            type: 'sfx',
            category: 'work',
            startTime: 0.5,
            duration: 2.5,
            volume: 0.8,
            soundType: 'shutter',
          },
        ],
      },
    ],
  },
  {
    id: 'proj_phone_short',
    title: 'Moral Short: The Farmer Wisdom',
    aspectRatio: '9:16',
    createdAt: Date.now() - 1200000,
    updatedAt: Date.now() - 100000,
    fps: 30,
    currentSceneId: 'scene_farmer_field',
    scenes: [
      {
        id: 'scene_farmer_field',
        name: 'Field Scene',
        duration: 5.0,
        backgroundColor: '#ecfccb',
        backgroundTemplate: 'village_exterior',
        elements: [
          {
            id: 'elem_farmer',
            type: 'character',
            name: 'Kisan Bhaiya',
            x: 180,
            y: 440,
            scale: 1.3,
            rotation: 0,
            zIndex: 10,
            activeMotionClipId: 'farmer_work',
            characterData: {
              id: 'char_kisan',
              name: 'Kisan',
              skinColor: '#be7845',
              headStyle: 'farmer',
              hairStyle: 'village_turban',
              facialHair: 'thick_mustache',
              clothesStyle: 'farmer_vest',
              shirtColor: '#f59e0b',
              bottomColor: '#ffffff',
              expression: 'smile',
              flipX: false,
              scale: 1,
              pose: POSE_PRESETS.farmWork.joints,
            },
          },
        ],
        audioTracks: [
          {
            id: 'audio_cow',
            name: 'Farm Cow Moo',
            type: 'sfx',
            category: 'animal',
            startTime: 0.2,
            duration: 2,
            volume: 0.7,
            soundType: 'cow',
          },
        ],
      },
    ],
  },
];

export type SyncState = 'synced' | 'syncing' | 'offline';

class StorageSyncService {
  private broadcastChannel: BroadcastChannel | null = null;
  private changeQueue: { timestamp: number; action: string; data: unknown }[] = [];
  private listeners: Set<(state: SyncState, queueLen: number) => void> = new Set();
  private forceOffline: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('autodraft_realtime_sync');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'SYNC_PROJECTS') {
            this.notifyListeners();
          }
        };
      } catch {
        // BroadcastChannel may fail in some iframe environments
      }

      window.addEventListener('online', () => this.handleNetworkChange());
      window.addEventListener('offline', () => this.handleNetworkChange());

      const savedOverride = localStorage.getItem(STORAGE_KEY_OFFLINE_OVERRIDE);
      if (savedOverride === 'true') {
        this.forceOffline = true;
      }
    }
  }

  public isOnline(): boolean {
    if (this.forceOffline) return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  public setForceOffline(force: boolean) {
    this.forceOffline = force;
    localStorage.setItem(STORAGE_KEY_OFFLINE_OVERRIDE, String(force));
    this.handleNetworkChange();
  }

  public getForceOffline(): boolean {
    return this.forceOffline;
  }

  public subscribe(fn: (state: SyncState, queueLen: number) => void) {
    this.listeners.add(fn);
    fn(this.getSyncStatus(), this.changeQueue.length);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notifyListeners(status?: SyncState) {
    const s = status || this.getSyncStatus();
    this.listeners.forEach((fn) => fn(s, this.changeQueue.length));
  }

  public getSyncStatus(): SyncState {
    if (!this.isOnline()) return 'offline';
    if (this.changeQueue.length > 0) return 'syncing';
    return 'synced';
  }

  private handleNetworkChange() {
    if (this.isOnline() && this.changeQueue.length > 0) {
      this.flushSyncQueue();
    } else {
      this.notifyListeners();
    }
  }

  public flushSyncQueue() {
    if (!this.isOnline()) return;

    this.notifyListeners('syncing');
    // Simulate real-time server replication handshake
    setTimeout(() => {
      this.changeQueue = [];
      this.notifyListeners('synced');
    }, 600);
  }

  // --- CRUD OPERATIONS ---
  public getProjects(): StudioProject[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading projects from localStorage:', e);
    }
    // Seed defaults
    this.saveProjects(DEFAULT_SAMPLE_PROJECTS);
    return DEFAULT_SAMPLE_PROJECTS;
  }

  public saveProjects(projects: StudioProject[]) {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
      if (this.isOnline()) {
        this.changeQueue.push({
          timestamp: Date.now(),
          action: 'SAVE_PROJECTS',
          data: projects.map((p) => p.id),
        });
        this.flushSyncQueue();
      } else {
        this.changeQueue.push({
          timestamp: Date.now(),
          action: 'SAVE_PROJECTS_OFFLINE',
          data: projects.map((p) => p.id),
        });
        this.notifyListeners('offline');
      }

      this.broadcastChannel?.postMessage({ type: 'SYNC_PROJECTS', timestamp: Date.now() });
    } catch (e) {
      console.error('Failed to save projects to localStorage:', e);
    }
  }

  public getProject(id: string): StudioProject | undefined {
    const projects = this.getProjects();
    return projects.find((p) => p.id === id);
  }

  public saveProject(project: StudioProject) {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.id === project.id);
    const updated = { ...project, updatedAt: Date.now() };

    if (idx >= 0) {
      projects[idx] = updated;
    } else {
      projects.unshift(updated);
    }

    this.saveProjects(projects);
  }

  public deleteProject(id: string) {
    const projects = this.getProjects().filter((p) => p.id !== id);
    this.saveProjects(projects);
  }

  public getCurrentProjectId(): string {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT_ID);
    if (saved) return saved;
    const projects = this.getProjects();
    return projects[0]?.id || DEFAULT_SAMPLE_PROJECTS[0].id;
  }

  public setCurrentProjectId(id: string) {
    localStorage.setItem(STORAGE_KEY_CURRENT_ID, id);
  }

  // --- EXPORT & IMPORT ---
  public exportProjectToJson(project: StudioProject): string {
    return JSON.stringify(project, null, 2);
  }

  public importProjectFromJson(jsonString: string): StudioProject {
    const parsed = JSON.parse(jsonString) as StudioProject;
    if (!parsed.id || !parsed.title || !Array.isArray(parsed.scenes)) {
      throw new Error('Invalid AutoDraft project format');
    }
    parsed.id = `proj_${Date.now()}`;
    parsed.title = `${parsed.title} (Imported)`;
    parsed.updatedAt = Date.now();
    this.saveProject(parsed);
    return parsed;
  }
}

export const storageSync = new StorageSyncService();
