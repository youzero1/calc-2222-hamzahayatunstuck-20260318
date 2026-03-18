'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Display from './Display';
import Button from './Button';
import History from './History';

type Operator = '+' | '-' | '×' | '÷' | null;

interface CalcState {
  current: string;
  previous: string;
  operator: Operator;
  expression: string;
  justEvaluated: boolean;
  hasError: boolean;
}

const initialState: CalcState = {
  current: '0',
  previous: '',
  operator: null,
  expression: '',
  justEvaluated: false,
  hasError: false,
};

export default function Calculator() {
  const [state, setState] = useState<CalcState>(initialState);
  const [historyTrigger, setHistoryTrigger] = useState(0);

  const handleDigit = useCallback((digit: string) => {
    setState((prev) => {
      if (prev.hasError) return { ...initialState, current: digit === '0' ? '0' : digit };
      if (prev.justEvaluated) {
        return {
          ...initialState,
          current: digit,
          justEvaluated: false,
        };
      }
      const newCurrent =
        prev.current === '0' ? digit : prev.current + digit;
      if (newCurrent.length > 15) return prev;
      return { ...prev, current: newCurrent };
    });
  }, []);

  const handleDecimal = useCallback(() => {
    setState((prev) => {
      if (prev.hasError) return { ...initialState, current: '0.' };
      if (prev.justEvaluated) {
        return { ...initialState, current: '0.', justEvaluated: false };
      }
      if (prev.current.includes('.')) return prev;
      return { ...prev, current: prev.current + '.' };
    });
  }, []);

  const handleOperator = useCallback((op: Operator) => {
    setState((prev) => {
      if (prev.hasError) return prev;
      const newExpression = prev.justEvaluated
        ? `${prev.current} ${op}`
        : prev.expression
        ? `${prev.expression} ${prev.current} ${op}`
        : `${prev.current} ${op}`;

      return {
        ...prev,
        previous: prev.current,
        operator: op,
        expression: newExpression,
        current: '0',
        justEvaluated: false,
      };
    });
  }, []);

  const handlePercent = useCallback(() => {
    setState((prev) => {
      if (prev.hasError) return prev;
      const val = parseFloat(prev.current);
      if (isNaN(val)) return prev;
      const result = (val / 100).toString();
      return { ...prev, current: result };
    });
  }, []);

  const handleToggleSign = useCallback(() => {
    setState((prev) => {
      if (prev.hasError) return prev;
      const val = parseFloat(prev.current);
      if (isNaN(val)) return prev;
      return { ...prev, current: (-val).toString() };
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setState((prev) => {
      if (prev.hasError) return initialState;
      if (prev.justEvaluated) return initialState;
      if (prev.current.length <= 1 || (prev.current.length === 2 && prev.current.startsWith('-'))) {
        return { ...prev, current: '0' };
      }
      return { ...prev, current: prev.current.slice(0, -1) };
    });
  }, []);

  const handleClear = useCallback(() => {
    setState(initialState);
  }, []);

  const handleEquals = useCallback(async () => {
    setState((prev) => {
      if (prev.hasError || !prev.operator) return prev;
      return prev;
    });

    const currentState = await new Promise<CalcState>((resolve) => {
      setState((prev) => {
        resolve(prev);
        return prev;
      });
    });

    if (currentState.hasError || !currentState.operator) return;

    const fullExpression = `${currentState.expression} ${currentState.current}`;

    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: fullExpression }),
      });
      const data = await res.json();
      const result: string = data.result;

      setState({
        current: result,
        previous: currentState.current,
        operator: null,
        expression: fullExpression + ' =',
        justEvaluated: true,
        hasError: result === 'Error',
      });
      setHistoryTrigger((t) => t + 1);
    } catch (err) {
      setState((prev) => ({ ...prev, current: 'Error', hasError: true }));
    }
  }, []);

  const handleSelectHistory = useCallback((expression: string, result: string) => {
    setState({
      current: result,
      previous: '',
      operator: null,
      expression: expression + ' =',
      justEvaluated: true,
      hasError: result === 'Error',
    });
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
      else if (e.key === '.') handleDecimal();
      else if (e.key === '+') handleOperator('+');
      else if (e.key === '-') handleOperator('-');
      else if (e.key === '*') handleOperator('×');
      else if (e.key === '/') { e.preventDefault(); handleOperator('÷'); }
      else if (e.key === '%') handlePercent();
      else if (e.key === 'Enter' || e.key === '=') handleEquals();
      else if (e.key === 'Backspace') handleBackspace();
      else if (e.key === 'Escape') handleClear();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDecimal, handleOperator, handlePercent, handleEquals, handleBackspace, handleClear]);

  const buttons = [
    // Row 1
    { label: 'C', variant: 'function' as const, action: handleClear },
    { label: '+/-', variant: 'function' as const, action: handleToggleSign },
    { label: '%', variant: 'function' as const, action: handlePercent },
    { label: '÷', variant: 'operator' as const, action: () => handleOperator('÷') },
    // Row 2
    { label: '7', variant: 'number' as const, action: () => handleDigit('7') },
    { label: '8', variant: 'number' as const, action: () => handleDigit('8') },
    { label: '9', variant: 'number' as const, action: () => handleDigit('9') },
    { label: '×', variant: 'operator' as const, action: () => handleOperator('×') },
    // Row 3
    { label: '4', variant: 'number' as const, action: () => handleDigit('4') },
    { label: '5', variant: 'number' as const, action: () => handleDigit('5') },
    { label: '6', variant: 'number' as const, action: () => handleDigit('6') },
    { label: '−', variant: 'operator' as const, action: () => handleOperator('-') },
    // Row 4
    { label: '1', variant: 'number' as const, action: () => handleDigit('1') },
    { label: '2', variant: 'number' as const, action: () => handleDigit('2') },
    { label: '3', variant: 'number' as const, action: () => handleDigit('3') },
    { label: '+', variant: 'operator' as const, action: () => handleOperator('+') },
    // Row 5
    { label: '⌫', variant: 'function' as const, action: handleBackspace },
    { label: '0', variant: 'number' as const, action: () => handleDigit('0') },
    { label: '.', variant: 'number' as const, action: handleDecimal },
    { label: '=', variant: 'equals' as const, action: handleEquals },
  ];

  const isActiveOperator = (op: string) => {
    const map: Record<string, string> = { '÷': '÷', '×': '×', '−': '-', '+': '+' };
    return state.operator === map[op] || state.operator === op;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-2xl">
      {/* Calculator */}
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-gray-700 border-opacity-40 w-full lg:w-80 flex-shrink-0">
        <Display
          expression={state.expression}
          current={state.current}
          hasError={state.hasError}
        />
        <div className="grid grid-cols-4 gap-3">
          {buttons.map((btn, idx) => {
            const isActive =
              (btn.variant === 'operator' || btn.variant === 'equals') &&
              isActiveOperator(btn.label) &&
              !state.justEvaluated;
            return (
              <Button
                key={idx}
                label={btn.label}
                onClick={btn.action}
                variant={btn.variant}
                className={
                  isActive
                    ? 'ring-2 ring-orange-300 ring-opacity-80 brightness-125'
                    : ''
                }
              />
            );
          })}
        </div>
      </div>

      {/* History */}
      <History
        refreshTrigger={historyTrigger}
        onSelectHistory={handleSelectHistory}
      />
    </div>
  );
}
