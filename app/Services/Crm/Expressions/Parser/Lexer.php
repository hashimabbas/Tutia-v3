<?php

namespace App\Services\Crm\Expressions\Parser;

class Lexer
{
    private string $source;

    private int $pos = 0;

    private int $line = 1;

    private int $column = 1;

    /** @var Token[] */
    private array $tokens = [];

    /**
     * @return Token[]
     */
    public function tokenize(string $expression): array
    {
        $this->source = $expression;
        $this->pos = 0;
        $this->line = 1;
        $this->column = 1;
        $this->tokens = [];

        while ($this->pos < strlen($this->source)) {
            if (ctype_space($this->source[$this->pos])) {
                $this->advance();

                continue;
            }

            if ($this->match('(')) {
                $this->emit(TokenType::LPAREN, '(');

                continue;
            }

            if ($this->match(')')) {
                $this->emit(TokenType::RPAREN, ')');

                continue;
            }

            if ($token = $this->tryString()) {
                $this->tokens[] = $token;

                continue;
            }

            if ($token = $this->tryNumber()) {
                $this->tokens[] = $token;

                continue;
            }

            if ($token = $this->tryOperator()) {
                $this->tokens[] = $token;

                continue;
            }

            if ($token = $this->tryIdentifierOrKeyword()) {
                $this->tokens[] = $token;

                continue;
            }

            throw $this->error("Unexpected character '{$this->source[$this->pos]}'");
        }

        $this->tokens[] = new Token(TokenType::EOF, '', $this->line, $this->column);

        return $this->tokens;
    }

    private function advance(): void
    {
        if ($this->pos < strlen($this->source) && $this->source[$this->pos] === "\n") {
            $this->line++;
            $this->column = 1;
        } else {
            $this->column++;
        }

        $this->pos++;
    }

    private function peek(): ?string
    {
        return $this->source[$this->pos] ?? null;
    }

    private function peekNext(): ?string
    {
        return $this->source[$this->pos + 1] ?? null;
    }

    private function match(string $char): bool
    {
        if ($this->peek() === $char) {
            $this->advance();

            return true;
        }

        return false;
    }

    private function emit(TokenType $type, string $value): void
    {
        $this->tokens[] = new Token($type, $value, $this->line, $this->column - strlen($value));
    }

    private function tryString(): ?Token
    {
        $quote = $this->peek();

        if ($quote !== '"' && $quote !== "'") {
            return null;
        }

        $startColumn = $this->column;
        $this->advance();

        $value = '';

        while ($this->pos < strlen($this->source)) {
            if ($this->peek() === $quote) {
                $this->advance();

                return new Token(TokenType::STRING, $value, $this->line, $startColumn);
            }

            $value .= $this->source[$this->pos];
            $this->advance();
        }

        throw $this->error('Unterminated string literal');
    }

    private function tryNumber(): ?Token
    {
        $start = $this->pos;
        $isFloat = false;

        if ($this->peek() === '-' && $this->peekNext() !== null && (ctype_digit($this->peekNext()) || $this->peekNext() === '.')) {
            $this->advance();
        }

        if ($this->peek() !== null && ctype_digit($this->peek())) {
            while ($this->peek() !== null && ctype_digit($this->peek())) {
                $this->advance();
            }
        } else {
            $this->pos = $start;

            return null;
        }

        if ($this->peek() === '.') {
            $isFloat = true;
            $this->advance();

            while ($this->peek() !== null && ctype_digit($this->peek())) {
                $this->advance();
            }
        }

        if ($start === $this->pos) {
            return null;
        }

        return new Token(TokenType::NUMBER, substr($this->source, $start, $this->pos - $start), $this->line, $this->column - ($this->pos - $start));
    }

    private function tryOperator(): ?Token
    {
        $operators = [
            '>=' => TokenType::GTE,
            '<=' => TokenType::LTE,
            '!=' => TokenType::NEQ,
            '=' => TokenType::EQ,
            '>' => TokenType::GT,
            '<' => TokenType::LT,
        ];

        foreach ($operators as $op => $type) {
            if (substr($this->source, $this->pos, strlen($op)) === $op) {
                $startColumn = $this->column;

                for ($i = 0; $i < strlen($op); $i++) {
                    $this->advance();
                }

                return new Token($type, $op, $this->line, $startColumn);
            }
        }

        return null;
    }

    private function tryIdentifierOrKeyword(): ?Token
    {
        if (! $this->isIdentStart($this->peek())) {
            return null;
        }

        $start = $this->pos;
        $startColumn = $this->column;

        while ($this->peek() !== null && $this->isIdentContinuation($this->peek())) {
            $this->advance();
        }

        $word = substr($this->source, $start, $this->pos - $start);

        $type = $this->resolveKeyword($word);

        return new Token($type, $word, $this->line, $startColumn);
    }

    private function isIdentStart(?string $ch): bool
    {
        return $ch !== null && (ctype_alpha($ch) || $ch === '_');
    }

    private function isIdentContinuation(?string $ch): bool
    {
        return $ch !== null && (ctype_alnum($ch) || $ch === '_' || $ch === '.');
    }

    private function resolveKeyword(string $word): TokenType
    {
        return match (strtoupper($word)) {
            'AND' => TokenType::AND,
            'OR' => TokenType::OR,
            'NOT' => TokenType::NOT,
            'IN' => TokenType::IN,
            'NOT_IN' => TokenType::NOT_IN,
            'TRUE' => TokenType::BOOLEAN,
            'FALSE' => TokenType::BOOLEAN,
            'CONTAINS' => TokenType::CONTAINS,
            default => match (strtoupper($word)) {
                'STARTS_WITH', 'STARTS' => TokenType::STARTS_WITH,
                'ENDS_WITH', 'ENDS' => TokenType::ENDS_WITH,
                default => TokenType::IDENTIFIER,
            },
        };
    }

    private function error(string $message): ExpressionParseException
    {
        return new ExpressionParseException("{$message} at line {$this->line}, column {$this->column}");
    }
}
