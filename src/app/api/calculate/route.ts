import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Calculation } from '@/entities/Calculation';

function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === ' ') {
      i++;
      continue;
    }
    if (ch >= '0' && ch <= '9' || ch === '.') {
      let num = '';
      while (i < expr.length && (expr[i] >= '0' && expr[i] <= '9' || expr[i] === '.')) {
        num += expr[i];
        i++;
      }
      tokens.push(num);
      continue;
    }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '%' || ch === '(' || ch === ')') {
      tokens.push(ch);
      i++;
      continue;
    }
    throw new Error(`Unknown character: ${ch}`);
  }
  return tokens;
}

function parse(tokens: string[]): number {
  let pos = 0;

  function peek(): string | undefined {
    return tokens[pos];
  }

  function consume(): string {
    return tokens[pos++];
  }

  function parseExpression(): number {
    return parseAddSub();
  }

  function parseAddSub(): number {
    let left = parseMulDiv();
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const right = parseMulDiv();
      if (op === '+') left += right;
      else left -= right;
    }
    return left;
  }

  function parseMulDiv(): number {
    let left = parseUnary();
    while (peek() === '*' || peek() === '/' || peek() === '%') {
      const op = consume();
      const right = parseUnary();
      if (op === '*') left *= right;
      else if (op === '/') {
        if (right === 0) throw new Error('Division by zero');
        left /= right;
      } else {
        left %= right;
      }
    }
    return left;
  }

  function parseUnary(): number {
    if (peek() === '-') {
      consume();
      return -parsePrimary();
    }
    if (peek() === '+') {
      consume();
      return parsePrimary();
    }
    return parsePrimary();
  }

  function parsePrimary(): number {
    const token = peek();
    if (token === undefined) throw new Error('Unexpected end of expression');
    if (token === '(') {
      consume();
      const val = parseExpression();
      if (peek() !== ')') throw new Error('Missing closing parenthesis');
      consume();
      return val;
    }
    const num = parseFloat(token);
    if (isNaN(num)) throw new Error(`Invalid token: ${token}`);
    consume();
    return num;
  }

  const result = parseExpression();
  if (pos < tokens.length) {
    throw new Error('Unexpected token: ' + tokens[pos]);
  }
  return result;
}

function evaluateExpression(expression: string): number {
  // Replace display symbols with standard operators
  const normalized = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-');
  const tokens = tokenize(normalized);
  return parse(tokens);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { expression } = body as { expression: string };

    if (!expression || typeof expression !== 'string') {
      return NextResponse.json({ error: 'Invalid expression' }, { status: 400 });
    }

    let result: string;
    try {
      const numResult = evaluateExpression(expression);
      if (!isFinite(numResult)) {
        result = 'Error';
      } else {
        // Round to avoid floating point issues
        result = parseFloat(numResult.toPrecision(12)).toString();
      }
    } catch (e) {
      result = 'Error';
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Calculation);

    // Keep only the last 50 calculations
    const count = await repo.count();
    if (count >= 50) {
      const oldest = await repo.find({
        order: { createdAt: 'ASC' },
        take: count - 49,
      });
      if (oldest.length > 0) {
        await repo.remove(oldest);
      }
    }

    const calculation = repo.create({
      expression,
      result,
    });
    await repo.save(calculation);

    return NextResponse.json({ result, expression });
  } catch (error) {
    console.error('Calculate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
