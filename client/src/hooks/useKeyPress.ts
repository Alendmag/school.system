import { useEffect, useLayoutEffect, useRef } from 'react';

export const useKeyPress = (
  keyCombo: string,
  callback: (event: KeyboardEvent) => void
) => {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keys = keyCombo.toLowerCase().split('+');
      const isCtrl = keys.includes('ctrl') || keys.includes('cmd');
      const isAlt = keys.includes('alt');
      const isShift = keys.includes('shift');
      const key = keys.filter(k => k !== 'ctrl' && k !== 'cmd' && k !== 'alt' && k !== 'shift')[0];

      const ctrlMatch = isCtrl ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey);
      const altMatch = isAlt ? event.altKey : !event.altKey;
      const shiftMatch = isShift ? event.shiftKey : !event.shiftKey;
      
      const eventKey = event.key.toLowerCase();
      // Handle the case where Escape is represented as 'escape'
      const keyMatch = key === eventKey || (key === 'esc' && eventKey === 'escape');

      if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
        callbackRef.current(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [keyCombo]);
};
