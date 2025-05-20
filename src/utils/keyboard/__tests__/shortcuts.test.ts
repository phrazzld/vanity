/**
 * Tests for keyboard shortcut utilities
 */
import {
  parseKeyCombination,
  matchesShortcut,
  createShortcutManager,
  getGlobalShortcutManager,
} from '../shortcuts';
import type { ShortcutManager } from '../shortcuts';
import type { RegisteredShortcut } from '../types';

describe('Shortcut utilities', () => {
  describe('parseKeyCombination', () => {
    it('should parse simple key combinations', () => {
      const result = parseKeyCombination('ctrl+s');

      expect(result.keys).toEqual(['s']);
      expect(result.modifiers).toEqual({
        ctrl: true,
        alt: false,
        shift: false,
        meta: false,
      });
    });

    it('should parse complex key combinations', () => {
      const result = parseKeyCombination('shift+alt+p');

      expect(result.keys).toEqual(['p']);
      expect(result.modifiers).toEqual({
        ctrl: false,
        alt: true,
        shift: true,
        meta: false,
      });
    });

    it('should handle cmd as an alias for meta', () => {
      const result = parseKeyCombination('cmd+k');

      expect(result.keys).toEqual(['k']);
      expect(result.modifiers).toEqual({
        ctrl: false,
        alt: false,
        shift: false,
        meta: true,
      });
    });
  });

  describe('matchesShortcut', () => {
    const createMockEvent = (key: string, modifiers: { [key: string]: boolean } = {}) => {
      return {
        key,
        ctrlKey: !!modifiers.ctrl,
        altKey: !!modifiers.alt,
        shiftKey: !!modifiers.shift,
        metaKey: !!modifiers.meta,
        preventDefault: jest.fn(),
      } as unknown as KeyboardEvent;
    };

    const createMockShortcut = (keyCombination: string): RegisteredShortcut => {
      const { keys, modifiers } = parseKeyCombination(keyCombination);

      return {
        id: 'test-shortcut',
        keyCombination,
        handler: jest.fn(),
        keys,
        modifiers,
      };
    };

    it('should match when all modifiers and key match', () => {
      const event = createMockEvent('s', { ctrl: true });
      const shortcut = createMockShortcut('ctrl+s');

      const result = matchesShortcut(event, shortcut);

      expect(result).toBe(true);
    });

    it('should not match when any modifier is different', () => {
      const event = createMockEvent('s', { ctrl: true, alt: true });
      const shortcut = createMockShortcut('ctrl+s');

      const result = matchesShortcut(event, shortcut);

      expect(result).toBe(false);
    });

    it('should not match when the key is different', () => {
      const event = createMockEvent('a', { ctrl: true });
      const shortcut = createMockShortcut('ctrl+s');

      const result = matchesShortcut(event, shortcut);

      expect(result).toBe(false);
    });
  });

  describe('ShortcutManager', () => {
    let manager: ShortcutManager;

    beforeEach(() => {
      manager = createShortcutManager();

      // Mock document addEventListener
      document.addEventListener = jest.fn();
      document.removeEventListener = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('register', () => {
      it('should register a new shortcut', () => {
        const handler = jest.fn();
        const id = manager.register({
          id: 'test-shortcut',
          keyCombination: 'ctrl+s',
          handler,
        });

        expect(id).toBe('test-shortcut');
        expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      });

      it('should throw an error when registering a duplicate ID', () => {
        manager.register({
          id: 'test-shortcut',
          keyCombination: 'ctrl+s',
          handler: jest.fn(),
        });

        expect(() => {
          manager.register({
            id: 'test-shortcut',
            keyCombination: 'ctrl+a',
            handler: jest.fn(),
          });
        }).toThrow(/already registered/);
      });
    });

    describe('unregister', () => {
      it('should unregister a shortcut by ID', () => {
        manager.register({
          id: 'test-shortcut',
          keyCombination: 'ctrl+s',
          handler: jest.fn(),
        });

        const result = manager.unregister('test-shortcut');

        expect(result).toBe(true);
      });

      it('should return false when unregistering a non-existent ID', () => {
        const result = manager.unregister('non-existent');

        expect(result).toBe(false);
      });

      it('should remove the event listener when no shortcuts remain', () => {
        manager.register({
          id: 'test-shortcut',
          keyCombination: 'ctrl+s',
          handler: jest.fn(),
        });

        manager.unregister('test-shortcut');

        expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      });
    });

    describe('getAll', () => {
      it('should return all registered shortcuts', () => {
        manager.register({
          id: 'shortcut-1',
          keyCombination: 'ctrl+s',
          handler: jest.fn(),
        });

        manager.register({
          id: 'shortcut-2',
          keyCombination: 'alt+p',
          handler: jest.fn(),
        });

        const shortcuts = manager.getAll();

        expect(shortcuts).toHaveLength(2);
        expect(shortcuts.map(s => s.id)).toEqual(['shortcut-1', 'shortcut-2']);
      });
    });

    describe('clear', () => {
      it('should remove all registered shortcuts', () => {
        manager.register({
          id: 'shortcut-1',
          keyCombination: 'ctrl+s',
          handler: jest.fn(),
        });

        manager.register({
          id: 'shortcut-2',
          keyCombination: 'alt+p',
          handler: jest.fn(),
        });

        manager.clear();

        expect(manager.getAll()).toHaveLength(0);
        expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      });
    });
  });

  describe('getGlobalShortcutManager', () => {
    it('should return the same instance on multiple calls', () => {
      const manager1 = getGlobalShortcutManager();
      const manager2 = getGlobalShortcutManager();

      expect(manager1).toBe(manager2);
    });
  });
});
